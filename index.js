const http = require('http');
const ws = require('ws');

Array.prototype.removeEl = function(el) {
  const index = this.findIndex(item => el === item);
  if (index) this.slice(index, 1);
};
Array.prototype.allExcept = function(el) {
  return this.filter(item => item !== el);
};
const sockets = [];

const wss = new ws.Server({ port: 3001 });
wss.on('connection', ws => {
  sockets.push(ws);
  console.log('CONNECTED: ', sockets);
  ws.on('message', message => messageHandler(message, ws));
  ws.onclose = () => {console.log('CONNECTED: ', sockets); sockets.removeEl(ws)};
});

const messageHandler = (message, ws) => {
  console.log('CONNECTED: ', sockets);
  sockets.allExcept(ws).forEach( socket => socket.send(message));
};



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
}).listen(3000); //the server object listens on port 8080

