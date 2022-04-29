var http = require('http');

const httpPort = 8080;

console.log(`Starting http server on port ${httpPort}`);
//create a server object:
http.createServer(function (req, res) {
  res.write('Hello World! Random Num: ' + Math.random()); //write a response to the client
  res.end(); //end the response
}).listen(httpPort); //the server object listens on port 8080