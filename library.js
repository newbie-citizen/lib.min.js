function lib (data) {
	if (typeof data === "object") return new lib.object.proto (data);
	else if (typeof data === "string") return new lib.string.proto (data);
	else if (typeof data === "number") return new lib.number.proto (data);
	else if (Array.isArray (data)) return new lib.array.proto (data);
	}

lib.object = function (data = {}) {
	return new lib.object.proto (data);
	}

lib.object.proto = class {
	constructor (data = {}) {
		this.data = data;
		}
	}

Object.defineProperty (lib.object.proto.prototype, "length", {
	get: function () { var length = 0; for (var i in this.data) length ++; return length; },
	enumerable: false,
	configurable: false,
	});

lib.array = function (data = []) {
	return new lib.array.proto (data);
	}

lib.array.proto = class {
	constructor (data = []) {
		this.data = data;
		}
	begin (data) { for (var i in this.data) return this.data [i]; return data; }
	end (data) { for (var i in this.data) data = this.data [i]; return data; }
	}

Object.defineProperty (lib.array.proto.prototype, "length", {
	get: function () { return this.data.length; },
	enumerable: false,
	configurable: false,
	});

lib.string = function (data = "") {
	return new lib.string.proto (data);
	}

lib.string.proto = class {
	constructor (data = "") {
		this.data = data;
		}
	begin (data = 1) {
		if (typeof data === "string") return this.data.startsWith (data);
		else return this.data.substr (0, data);
		}
	replace (key, value) {
		return this.data.split (key).join (value);
		}
	print_format (... format) {
		var array = this.data.split ("%s");
		var index = - 1;
		for (var i in format) {
			index += 2;
			array.splice (index, 0, format [i]);
			}
		return array.join ("");
		}
	}

lib.number = function (data = 0) {
	return new lib.number.proto (data);
	}

lib.number.proto = class {
	constructor (data = 0) {
		this.data = data;
		}
	}

lib.number.KB = function (input = 1) { return input * 1024; }
lib.number.MB = function (input = 1) { return input * (1024 * 1024); }
lib.number.GB = function (input = 1) { return input * (1024 * 1024 * 1024); }
lib.number.TB = function (input = 1) { return input * (1024 * 1024 * 1024 * 1024); }

lib.infinity = Infinity;

lib.time = function () { return Date.now (); }
lib.time.sleep = function (context, second = 1) { return setTimeout (context, (second * 1000)); }
lib.time.sleep.next = function (context) { return setTimeout (context, 100); }
lib.time.sleep.clear = function (context) { return clearTimeout (context); }
lib.time.interval = function (context, second = 1) { return setInterval (context, (second * 1000)); }
lib.time.interval.clear = function (context) { return clearInterval (context); }
lib.timeout = function (context) { return setTimeout (context, (lib.timeout.sleep * 1000)); }
lib.timeout.sleep = 10;

lib.context = function (context) { return context || function () {} }

lib.is_object = function (input) { return typeof input === "object"; }
lib.is_array = function (input) { return Array.isArray (input); }
lib.is_string = function (input) { return typeof input === "string"; }
lib.is_define = function (input) { return ! lib.un_define (input); }
lib.un_define = function (input) { return input === undefined; }
lib.is_set = function (input) { if (input === undefined || input === null) return false; else return true; }
lib.un_set = function (input) { return ! lib.is_set (input); }

lib.json = function () {}
lib.json.encode = function (data) { return JSON.stringify (data); }
lib.json.decode = function (data, value) { if (data) return JSON.parse (data); else return value; }

lib.hash = function (algorithm, option) { return lib.hash.crypto.createHash (algorithm, option); }
lib.hash.algorithm = {"md": "md5", "sha": "sha256", "sha:one": "sha1", "encoding": "utf8", "base": "base64"}
lib.hash.md = function (input) { return lib.hash.crypto.createHash ("md5").update (input).digest ("hex"); }
lib.hash.sha = function (input) { return lib.hash.crypto.createHash ("sha256").update (input).digest ("hex"); }
lib.hash.sha.one = function (input) { return lib.hash.crypto.createHash ("sha1").update (input).digest ("hex"); }

lib.url = function () {}
lib.url.get = function (url, option = {}) { return new lib.url.c (url, {method: "get", ... option}); }
lib.url.post = function (url, option = {}) { return new lib.url.c (url, {method: "post", ... option}); }
lib.url.c = class {
	constructor (url, option = {}) {
		this.url = url;
		this.option = option;
		}
	then (context) {
		return lib.url.engine ({url: this.url, method: this.option.method || "get"}).then (context).catch (lib.context (this.error));
		}
	catch (context) {
		this.error = context;
		return this;
		}
	}

lib.dom = function (element) { return new lib.dom.document (element); }
lib.dom.document = class {
	constructor (element) { this.dom = $ (this.element = element); }
	attribute (... arg) { return this.dom.attr (... arg); }
	}

lib.dom.style = function (style) {
	var attribute = [];
	for (var i in style) attribute.push (i + ": " + style [i]);
	return attribute.join ("; ");
	}

Symbol.$$$ = lib;
