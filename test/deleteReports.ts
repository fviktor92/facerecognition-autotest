const fs = require('fs');
fs.rmdirSync('./test/cypress/report/', {recursive: true});
fs.rmdirSync('./test/api/report/', {recursive: true});