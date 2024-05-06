require ("./library");
var $$$ = {
	crypto: require ("crypto"),
	axios: require ("axios"),
	appwrite: require ("appwrite"),
	}

Symbol.$$$.hash.crypto = $$$.crypto;
Symbol.$$$.url.engine = $$$.axios;

module.exports = exports = Symbol.$$$;
