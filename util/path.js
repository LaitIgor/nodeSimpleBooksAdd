const path = require('path');
// get access to the app`s directory, so we dont need to add "../" 
// when return a file location in routes
module.exports = path.dirname(require.main.filename);