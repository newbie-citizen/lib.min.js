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
	end (data) {
		if (typeof data === "string") return this.data.endsWith (data);
		else return this.data.substr (- data);
		}
	replace (key, value) {
		if (typeof key === "object") {
			var data = this.data;
			for (var i in key) {
				if (value) {
					if (value.exclude) {
						if (value.exclude.includes (i)) continue;
						else data = data.split ("{{ " + i + " }}").join (key [i]);
						}
					else data = data.split ("{{ " + i + " }}").join (key [i]);
					}
				else data = data.split ("{{ " + i + " }}").join (key [i]);
				}
			return data;
			}
		else return this.data.split (key).join (value);
		return this.data;
		}
	to_replace (key, value) {
		this.data = this.replace (key, value);
		return this;
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
lib.time.sleep.emit = function (context) { return setTimeout (context, 100); }
lib.time.sleep.clear = function (context) { return clearTimeout (context); }
lib.time.interval = function (context, second = 1) { return setInterval (context, (second * 1000)); }
lib.time.interval.clear = function (context) { return clearInterval (context); }
lib.timeout = function (context) { return setTimeout (context, (lib.timeout.sleep * 1000)); }
lib.timeout.sleep = 10;

lib.timezone = function (timezone) {
	for (var i in lib.geo.data.timezone) {
		if ([lib.geo.data.timezone [i].id, lib.geo.data.timezone [i].code].includes (timezone)) {
			return lib.geo.data.timezone [i];
			}
		}
	return {}
	}

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
lib.url.get = function (url, option = {}) { if (Array.isArray (url)) url = url.join (""); return new lib.url.c (url, {method: "get", ... option}); }
lib.url.post = function (url, option = {}) { if (Array.isArray (url)) url = url.join (""); return new lib.url.c (url, {method: "post", ... option}); }
lib.url.require = function (url) { if (url) return lib.url.api = url; else return lib.url.api = require ("axios"); }

lib.url.c = class {
	constructor (url, option = {}) {
		this.url = url;
		this.option = option;
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
	emit (context) {
		return this.then (context).catch ();
		}
	exec () {
		var url, header;
		if (this.option.gateway) {
			if (lib.parse_url.header.data !== {}) header = lib.parse_url.header.data;
			}
		url = {
			url: this.url,
			method: this.option.method || "get",
			headers: this.option.header || header || {},
			}
		return lib.url.api (url).then (this.context).catch (lib.context (this.error));
		}
	}

lib.parse_url = function (input) {
	var host, parse_url = {
		client: {host: {}},
		cross: {origin: false},
		reference: "",
		referer: "",
		address: "",
		protocol: "http",
		scheme: "http://",
		host: {address: input.host, name: input.host_name, port: ""},
		user: "", password: "",
		path: input.path,
		query: input.query || {},
		}
	if (parse_url.host.address) {
		var h;
		if ((h = parse_url.host.address.split ("@")).length > 1) {}
		else {
			if ((h = parse_url.host.address.split (":")).length > 1) {
				parse_url.host.port = h [1];
				}
			}
		}
	if (parse_url.password) host = parse_url.user + ":" + parse_url.password + "@" + parse_url.host.name;
	else if (parse_url.user) host = parse_url.user + "@" + parse_url.host.name;
	else host = parse_url.host.name;
	if (parse_url.port) host = host + ":" + parse_url.port;
	if (input ["x-forwarded-proto"]) {
		parse_url.protocol = input ["x-forwarded-proto"];
		parse_url.scheme = parse_url.protocol + "://";
		}
	parse_url.address = parse_url.scheme + host + parse_url.path;
	var query = [];
	for (var i in parse_url.query) query.push (i + "=" + parse_url.query [i]);
	if (query.length) parse_url.address = parse_url.scheme + host + parse_url.path + "?" + query.join ("&");
	var url;
	if (url = input.origin) {
		var url = url.split ("://");
		parse_url.client.host = {protocol: url [0], name: url [1].split (":") [0]}
		parse_url.cross.origin = true;
		}
	return parse_url;
	}

lib.parse_url.header = function () {}
lib.parse_url.header.data = {}
lib.parse_url.header.insert = function (key, value) { return lib.parse_url.header.data [key] = value; }

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

lib.plugin = function () {}

lib.ip = function (data) {
	if (data) lib.ip.data = data;
	else lib.ip.initialize ();
	}

lib.ip.reserve = function (ip) {
	if (ip === "local") return "127.0.0.1";
	else if (ip === "sub") return "255.255.255.0";
	else return "0.0.0.0";
	}

lib.ip.parse = function (ip, input = {}) {
	var ip_reserve = lib.ip.reserve ();
	var ip_local = lib.ip.reserve ("local");
	var data = {
		ip: {address: (ip || ip_local), network: "", mask: "", version: 4},
		internet: {service: {code: "", name: "", provider: ""}},
		country: lib.geo.country (), region: {code: "", name: ""}, city: {code: "", name: ""},
		timezone: {code: "GMT", name: "", offset: "+00:00"},
		language: [],
		coordinate: {latitude: 0, longitude: 0},
		}
	if (data.ip.address === ("::ffff:" + ip_local)) data.ip.address = ip_local;
	if (data.ip.address.includes (":")) data.ip.version = 6;
	else data.ip.version = 4;
	data.ip.network = input.network || data.ip.network;
	data.internet.service.code = (input.as || "").split (" ") [0] || input.asn || data.internet.service.code;
	data.internet.service.name = input.asname || data.internet.service.name;
	data.internet.service.provider = input.isp || input.org || data.internet.service.provider;
	data.country = lib.geo.country (input.country_code, {exclude: ["region", "city"]});
	data.region.code = input.region_code || "";
	data.region.name = input.region || "";
	data.city.code = input.city_code || "";
	data.city.name = input.city || "";
	var timezone = lib.timezone (input.timezone);
	data.timezone.code = timezone.code || data.timezone.code;
	data.timezone.name = timezone.name || data.timezone.name;
	data.timezone.offset = timezone.offset || lib.help.timezone_format (input.utc_offset) || data.timezone.offset;
	data.coordinate.latitude = input.latitude || data.coordinate.latitude;
	data.coordinate.longitude = input.longitude || data.coordinate.longitude;
	return data;
	}

lib.ip.trace = function () {}
lib.ip.trace.url = "https://ipapi.co/%s/json/";
lib.ip.url = "https://api.ipify.org/?format=json";

lib.ip.initialize = function () {}

lib.geo = function (data) {
	if (data) lib.geo.data = data;
	else lib.geo.initialize ();
	}

lib.geo.country = function (code, option = {}) {
	var country = lib.geo.country.data [code] || {
		code: "",
		name: "",
		capital: {code: "", name: "", coordinate: {latitude: "", longitude: ""}},
		region: {data: {}, city: {data: {}}},
		coordinate: {latitude: "", longitude: ""},
		currency: {code: "", name: ""},
		population: 0,
		language: [],
		domain: [],
		}
	country = {... country}
	if (option.exclude) for (var i in option.exclude) delete country [option.exclude [i]];
	return country;
	}

lib.geo.country.region = function () {}
lib.geo.country.region.city = function () {}

lib.geo.data = {}
lib.geo.country.data = {}
lib.geo.country.region.data = {}
lib.geo.country.region.city.data = {}

lib.geo.initialize = function () {
	for (var i in lib.geo.data.country.data) {
		lib.geo.country.data [lib.geo.data.country.data [i].code] = lib.geo.data.country.data [i];
		for (var x in lib.geo.data.country.region.data) {
			if (lib.geo.data.country.region.data [x].id) {
				if (lib.geo.data.country.region.data [x].country === lib.geo.data.country.data [i].id) {
					lib.geo.country.data [lib.geo.data.country.data [i].code].region.data [lib.geo.data.country.region.data [x].code] = lib.geo.data.country.region.data [x];
					for (var o in lib.geo.data.country.region.city.data) {
						if (lib.geo.data.country.region.city.data [o].id) {
							if (lib.geo.data.country.region.city.data [o].country === lib.geo.data.country.data [i].id) {
								if (lib.geo.data.country.region.city.data [o].region === lib.geo.data.country.region.data [x].id) {
									lib.geo.country.data [lib.geo.data.country.data [i].code].region.city.data [lib.geo.data.country.region.city.data [o].code] = lib.geo.data.country.region.city.data [o];
									}
								}
							}
						}
					}
				}
			}
		}
	}

lib.browser = function () {}
lib.browser.require = function () {
	window.scroll = function () {}
	window.scroll.smooth = function (id) { return document.getElementById (id).scrollIntoView ({behavior: "smooth"}); }
	window.size = function () { return {width: window.innerWidth, height: window.innerHeight} }
	window.on = function (key, value) {
		if (key === "scroll") window.onscroll = value;
		if (["size:change", "size change"].includes (key)) window.onresize = value;
		}
	document.url = {}
	document.base_url = window.location.href;
	var tmp, host;
	if (document.base_url.startsWith ("http://")) tmp = document.base_url.substr ("http://".length);
	if (document.base_url.startsWith ("https://")) tmp = document.base_url.substr ("https://".length);
	tmp = tmp.split ("/");
	document.url.host = tmp [0];
	}

lib.visitor = function (browser) {
	var tmp_brand = false;
	var tmp_system = "";
	var tmp_agent = "";
	var tmp_version = "";
	var tmp_mobile = false;
	if (browser) {}
	else {
		if (window.navigator.userAgentData) {
			if (window.navigator.userAgentData.brands.length) {
				if (tmp_brand = true) {
					var brand = window.navigator.userAgentData.brands [2] || window.navigator.userAgentData.brands [1] || window.navigator.userAgentData.brands [0];
					tmp_system = window.navigator.userAgentData.platform;
					tmp_agent = tmp_system + " " + brand.brand + "/" + brand.version;
					tmp_version = brand.version;
					tmp_mobile = window.navigator.userAgentData.mobile;
					}
				}
			}
		if (tmp_brand === false) tmp_agent = window.navigator.userAgent;
		}
	var visitor = {ip: {address: "0.0.0.0"}, browser: {name: (browser || tmp_agent), version: tmp_version}, device: {type: "computer", system: tmp_system, mobile: tmp_mobile}}
	var browser = visitor.browser.name.toLowerCase ();
	if (browser.includes ("windows")) {
		visitor.device.system = "win";
		}
	if (browser.includes ("android")) {
		visitor.device.system = "android";
		if (browser.includes ("wv")) visitor.browser.model = "web-view";
		if (browser.includes ("mobile")) visitor.device.type = "phone";
		else visitor.device.type = "tablet";
		if (browser.includes ("android")) visitor.device.model = "a";
		}
	if (browser.includes ("mac")) {
		visitor.device.system = "mac";
		if (browser.includes ("iphone")) visitor.device.type = "phone";
		else if (browser.includes ("ipad")) visitor.device.type = "tablet";
		else visitor.device.type = "computer";
		if (browser.includes ("iphone")) visitor.device.model = "i";
		}
	if (browser.includes ("firefox")) visitor.browser.platform = "mozilla";
	else if (browser.includes ("chrome")) visitor.browser.platform = "chrome";
	else if (browser.includes ("safari")) visitor.browser.platform = "safari";
	else visitor.browser.platform = "*";
	visitor.browser.type = (visitor.device.type == "computer") ? "" : "mobile";
	return visitor;
	}

lib.api = function () {}

lib.$session = class {
	constructor ($session) { this.$session = $session; }
	config (... option) { return this.$session.config (... option); }
	set (key, value, ... option) { return this.$session.set (this.key (key), lib.hash.encode (value), ... option); }
	get (key) { if (key) return lib.hash.decode (this.$session.get (this.key (key))); else { var $session = {}; var session = this.key (); for (var i in session) $session [session [i]] = lib.hash.decode (this.$session.get (session [i])); return $session; } }
	exist (key) { return this.$session.isKey (this.key (key)); }
	key (key) { if (key) return lib.string (key).replace (":", "_"); else return this.$session.keys (); }
	register (key, value, context, ... option) {
		if (this.exist (key) === false) {
			if (context) context ();
			return this.set (key, value, ... option);
			}
		}
	}

lib.path = function () {}
lib.path.join = function (... path) { return lib.path.api.join (... path); }
lib.path.require = function (path) { if (path) return lib.path.api = path; else return lib.path.api = require ("path"); }

lib.fs = function () {}
lib.fs.require = function (fs) { if (fs) return lib.fs.api = fs; else return lib.fs.api = require ("fs"); }

lib.help = class {}
lib.help.timezone_format = function (input) {
	if (input) if (["+", "-"].includes (input.substr (0, 1))) return input.substr (0, 3) + ":" + input.substr (3);
	else return input;
	else return input;
	}

lib.export = function (M, L) {
	if (M === "symbol") if (L) Symbol.$$$ = L;
	else Symbol.$$$ = lib;
	if (typeof M === "string") {}
	else if (M) if (L) return M.exports = L;
	else return M.exports = lib;
	}

lib ["favorite.ico"] = "favicon.ico";

lib.export ("symbol");

/*
var ip_json = '{"ip": {"address": "%s", "network": "%s"}, "internet": {"service": {"name": "%s", "provider": "%s"}}, "country": {"code": "%s"}, "region": {"code": "%s", "name": "%s"}, "city": {"code": "%s", "name": "%s"}, "coordinate": {"latitude": %s, "longitude": %s}, "timezone": {"code": "%s", "offset": "%s"}}'
console.log (lib.string (ip_json).print_format (extra.data.ip, extra.data.network, extra.data.org, "", extra.data.country_code, extra.data.region_code, extra.data.region, "", extra.data.city, extra.data.latitude, extra.data.longitude, extra.data.timezone, extra.data.utc_offset))
console.log (lib.string (lib.json.encode (data)).to_replace ('":', '": ', true).replace (',"', ', "'))
*/
