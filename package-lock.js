var lib = require ("library.min.js/module")
const {define} = lib

lib.path.api ()
lib.fs.api ()
lib.url.api ()
lib.hash.crypto.api ()

define (module).export (lib)
