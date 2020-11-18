const http = require('http');
const https = require('https');
const static = require('node-static');
const ws = require('ws');
const fs = require('fs');
const url = require('url');
const routeParser = require('./routeParser');
const { trim } = require('./functions');
const { PLATFORM, CONTROL } = require('./constants.js');

const file = new(static.Server)('./public');

Array.prototype.removeEl = function(el) {
  const index = this.findIndex(item => el === item);
  if (index) this.slice(index, 1);
};
Array.prototype.allExcept = function(el) {
  return this.filter(item => item !== el);
};
const sockets = [];

global.conformitys = {
  set(device, id, ws) {
    if (!this[id]) this[id] = {};
    this[id][device] = ws;
    console.table(global.conformitys);
  },
  unset(device, id) {
    try {
      delete this[id][device];
      if (!Object.keys(this[id]).length) delete this[id];
      console.log('RESULT: ', this);
    } catch (err) {
      console.log(err);
    }
  }
};

http.createServer(function (req, res) {
  if (routeParser(req, res)) return;
  file.serve(req, res);
}).listen(3000); //the server object listens on port 8080

const options = {
  key: fs.readFileSync('./ssl/private.key', 'utf8'),
  cert: fs.readFileSync('./ssl/certificate.crt', 'utf8'),
  ca: fs.readFileSync('./ssl/ca_bundle.crt', 'utf8'),
};

const httpsServer = https.createServer(options, function (req, res) {
  if (routeParser(req, res)) return;
  file.serve(req, res);
}).listen(2999); //the server object listens on port 8080

const wss = new ws.Server({ server: httpsServer });

const connectionHandler = (ws, req) => {
  sockets.push(ws);
  const parsedURL = url.parse(req.url, true);
  const {id} = parsedURL.query;
  const device = trim(parsedURL.pathname, '/') === PLATFORM ? PLATFORM : CONTROL;
  if (device === PLATFORM) {
    global.conformitys.set(PLATFORM, id, ws);
  } else {
    global.conformitys.set(CONTROL, id, ws);
  }
  console.log(global.conformitys);
  ws.on('message', message => messageHandler(id, device, message, ws));
  ws.onclose = () => {
    sockets.allExcept(ws).forEach( socket => socket.send('DISCONNECT'));
    global.conformitys.unset(device, id);
    console.table(global.conformitys);
  };
  console.table(global.conformitys);
}

wss.on('connection', connectionHandler);

const messageHandler = (id, device, message, ws) => {
  console.log('ID: ', id);
  console.log('CONF: ', global.conformitys);
  const socket = global.conformitys[id][device === PLATFORM ? CONTROL : PLATFORM];
  if (socket) socket.send(message);
};
