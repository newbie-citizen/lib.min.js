var lib = require ("library.min.js/module")
const {define} = lib

lib.path.api ()
lib.path.separator (lib.path.api.engine.sep)
lib.fs.api ()
lib.url.api ()
lib.hash.crypto.api ()
lib.ip.initialize ("default"), lib.ip.initialize ()
lib.geo.initialize ("default"), lib.geo.initialize ()

define (module).export (lib)
