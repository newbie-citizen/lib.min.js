import lib from "lib.min.js";
import {Client, Databases, Query, ID} from "appwrite";

lib.api.appwrite = class {
	constructor (config) {
		if (config) {
			this.config = config;
			this.start ();
			}
		}
	start (config) {
		if (config) this.config = config;
		this.url = this.config.url;
		this.socket = this.config.socket;
		this.project = {id: this.config.project}
		this ["data:base"] = this.config.db;
		this.client = new Client ().setEndpoint (this.url).setEndpointRealtime (this.socket).setProject (this.project.id);
		this.db = new lib.api.appwrite.database (this, this ["data:base"]);
		}
	database (db) {
		return new lib.api.appwrite.database (this, db);
		}
	}

lib.api.appwrite.database = class {
	constructor (appwrite, db) {
		this.appwrite = appwrite;
		this.client = new Databases (this.appwrite.client);
		this.use = db;
		this.snapshot = [];
		this.clear ();
		}
	clear () {
		delete this.action;
		delete this.table;
		delete this.id;
		delete this.data;
		delete this.limit;
		delete this.offset;
		this.query = [];
		}
	set (action, collection, data, query) {
		this.action = action;
		this.table = this.collection [collection] || collection;
		this.data = data;
		this.query = query || [];
		}
	get (collection, id) {
		this.id = id;
		this.set ("get", collection);
		return this;
		}
	select (collection, query) {
		this.set ("select", collection);
		this.queries (query);
		return this;
		}
	insert (collection, data = {}) {
		if (data.id) if (this.id = data.id) delete data.id;
		else this.id = ID.unique ();
		else this.id = ID.unique ();
		this.set ("insert", collection, data);
		return this;
		}
	update (collection, query, data) {
		this.id = query.id;
		this.set ("update", collection, data);
		return this;
		}
	delete (collection, query = "") {
		this.id = query.id || query;
		this.limit = query.limit || 1024;
		this.set ("delete", collection);
		return this;
		}
	then (context = function () {}) {
		this.context = context;
		if (this.error) return this.exec ();
		return this;
		}
	catch (context = function () {}) {
		this.error = context;
		if (this.context) return this.exec ();
		return this;
		}
	exec () {
		if (this.action === "get") {
			this.client.getDocument (this.use, this.table, this.id).then (lib.api.appwrite.database.select.single_format.bind ({context: this.context}), lib.context (this.error));
			}
		if (this.action === "select") {
			if (this.query.length) this.client.listDocuments (this.use, this.table, this.query).then (lib.api.appwrite.database.select.array_format.bind ({context: this.context}), lib.context (this.error));
			else this.client.listDocuments (this.use, this.table).then (lib.api.appwrite.database.select.array_format.bind ({context: this.context}), lib.context (this.error));
			}
		if (this.action === "insert") {
			this.client.createDocument (this.use, this.table, this.id, this.data).then (lib.api.appwrite.database.select.single_format.bind ({context: this.context}), lib.context (this.error));
			}
		if (this.action === "update") {
			this.client.updateDocument (this.use, this.table, this.id, this.data).then (lib.api.appwrite.database.select.single_format.bind ({context: this.context}), lib.context (this.error));
			}
		if (this.action === "delete") {
			if (this.id) this.client.deleteDocument (this.use, this.table, this.id).then (lib.api.appwrite.database.select.single_format.bind ({context: this.context}), lib.context (this.error));
			else this.client.listDocuments (this.use, this.table, [Query.limit (this.limit)]).then (function (response) { for (var i in response.documents) this.db.client.deleteDocument (this.db.use, this.table, response.documents [i].$id).then (lib.context, lib.context); }.bind ({db: this, table: this.table}), lib.context (this.error));
			}
		this.clear ();
		return this;
		}
	queries (query = {}) {
		if (lib.is_string (query)) this.query.push (Query.equal ("$id", query));
		else {
			if (query.id) this.query.push (Query.equal ("$id", query.id));
			if (query.limit) this.query.push (Query.limit (query.limit));
			if (query.offset) this.query.push (Query.offset (query.offset));
			if (query.sort) {
				for (var i in query.sort) {
					for (var x in query.sort [i]) {
						var sort;
						if (["$insert", "stamp.insert"].includes (x)) sort = "$createdAt";
						else sort = x;
						if (query.sort [i][x] === "ascending") this.query.push (Query.orderAsc (sort));
						if (query.sort [i][x] === "descending") this.query.push (Query.orderDesc (sort));
						}
					}
				}
			if (query.equal) {
				for (var i in query.equal) {
					for (var x in query.equal [i]) {
						this.query.push (Query.equal (x, query.equal [i][x]));
						}
					}
				}
			}
		}
	on (action, collection, context) {
		if (lib.is_object (collection)) collection = collection.collection;
		this.set (action, collection);
		this.snapshot.push ({action: this.action, collection: this.table, context});
		return this;
		}
	emit (context) {
		return this.then (context).catch ();
		}
	subscribe (context) {
		return this.appwrite.client.subscribe ("documents", (context || lib.api.appwrite.database.subscribe (this)));
		}
	}

lib.api.appwrite.database.subscribe = function (db) {
	return function (response) {
		var action = response.events [0].split (".");
		action = action [action.length - 1];
		if (action === "create") action = "insert";
		var collection = response.payload.$collectionId;
		var data = response.payload;
		for (var i in db.snapshot) {
			if (action === db.snapshot [i].action) {
				if (collection === db.snapshot [i].collection) {
					db.snapshot [i].context (lib.api.appwrite.database.doc_format (data));
					}
				}
			}
		}
	}

lib.api.appwrite.database.doc_format = function (data) {
	data.id = data.$id;
	data.stamp = {
		insert: new Date (data.$createdAt).getTime (),
		update: new Date (data.$updatedAt).getTime (),
		delete: 0,
		}
	for (var i in data) if (i.startsWith ("$")) delete data [i];
	return data;
	}

lib.api.appwrite.database.select = function () {}
lib.api.appwrite.database.select.single_format = function (data) { this.context (lib.api.appwrite.database.doc_format (data)); }
lib.api.appwrite.database.select.array_format = function (response) { this.context ({total: response.total, data: response.documents.map (function (data) { return lib.api.appwrite.database.doc_format (data); })}); }

Symbol.$$$ = lib;
