var lib = require ("lib.min.js");

var {MD5, SHA256, SHA1} = lib.hash.require ();
lib.hash.require (MD5, SHA256, SHA1);

var {Client, Databases, Query, ID} = lib.api.appwrite.require ();
lib.api.appwrite.require (Client, Databases, Query, ID);

module.exports = exports = lib;
