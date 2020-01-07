const http = require('http');
const https = require('https');
const static = require('node-static');
const ws = require('ws');
const fs = require('fs');

const file = new(static.Server)('./public');

Array.prototype.removeEl = function(el) {
  const index = this.findIndex(item => el === item);
  if (index) this.slice(index, 1);
};
Array.prototype.allExcept = function(el) {
  return this.filter(item => item !== el);
};


global.status = {};

http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  file.serve(req, res);
}).listen(3000); //the server object listens on port 8080

const options = {
  key: fs.readFileSync('./ssl/private.key', 'utf8'),
  cert: fs.readFileSync('./ssl/certificate.crt', 'utf8'),
  ca: fs.readFileSync('./ssl/ca_bundle.crt', 'utf8'),
};

const httpsServer = https.createServer(options, function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  file.serve(req, res);
}).listen(2999); //the server object listens on port 8080


const sockets = [];
const wss = new ws.Server({ server: httpsServer });
wss.on('connection', ws => {
  sockets.push(ws);
  console.log('CONNECTED: ', sockets);
  ws.on('message', message => messageHandler(message, ws));
  ws.onclose = () => {console.log('CONNECTED: ', sockets); sockets.removeEl(ws)};
});

const messageHandler = (message, ws) => {
  console.log('CONNECTED: ', sockets.length);
  sockets.allExcept(ws).forEach( socket => socket.send(message));
};
