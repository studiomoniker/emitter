
require('./legacy-compat');

// we do this to easily wrap each file in a mocha test
// and also have browserify be able to statically analyze this file
// var orig_require = require;
// var require = function(file) {
//     test(file, function() {
//         orig_require(file);
//     });
// }

require('./add-listeners.js');
require('./listener-count.js');
require('./listeners-side-effects.js');
require('./listeners.js');
require('./modify-in-emit.js');
require('./num-args.js');
require('./once.js');
require('./subclass.js');
require('./remove-all-listeners.js');
require('./remove-listeners.js');
require('./any.js');
require('./forward.js');
