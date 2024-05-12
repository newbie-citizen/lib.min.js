import lib from "lib.min.js";
import md5 from "crypto-js/md5";
import sha1 from "crypto-js/sha1";
import sha256 from "crypto-js/sha256";

lib.hash.encode = function (input) { return btoa (input); }
lib.hash.decode = function (input) { if (input) return atob (input); else return ""; }
lib.hash.md = function (input) { return md5 (input).toString (); }
lib.hash.sha = function (input) { return sha256 (input).toString (); }
lib.hash.sha.one = function (input) { return sha1 (input).toString (); }

Symbol.$$$ = lib;
