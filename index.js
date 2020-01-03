const http = require('http');
const PostRouter = require('./PostRouter');

global.status = {};

const GetRouter = (url, res) => {
  switch (url) {
    case '/':
      res.write('TEST');
      res.end(); //end the response
      break;
  }
};



http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  req.method === 'GET' ? GetRouter(req.url, res) : PostRouter(req.url, req, res);
}).listen(80); //the server object listens on port 8080

