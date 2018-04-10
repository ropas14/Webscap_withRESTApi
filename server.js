const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
var routes = require('./productRoute'); 
const http=require('http');
const server =http.createServer(routes);
server.listen(port);
console.log("Server is listening on port " + port );

