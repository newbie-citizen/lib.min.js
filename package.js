var lib = require ("library.min.js/src")
const {define} = lib

lib.path.api ()
lib.path.regex.api ()
lib.path.separator (lib.path.api.engine.sep)
lib.file.system.api ()
lib.url.api ()
lib.hash.crypto.api ()
lib.ip.initialize ("default"), lib.ip.initialize ()
lib.geo.initialize ("default"), lib.geo.initialize ()

define (module).export (lib)
