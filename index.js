const http = require('http');
const https = require('https');
const static = require('node-static');
const ws = require('ws');
const fs = require('fs');
const url = require('url');
const routeParser = require('./routeParser');
const { trim } = require('./functions');

const file = new(static.Server)('./public');

Array.prototype.removeEl = function(el) {
  const index = this.findIndex(item => el === item);
  if (~index) this.slice(index, 1);
};
Array.prototype.allExcept = function(el) {
  return this.filter(item => item !== el);
};

global.conformitys = {
  set(device, id, ws) {
    console.log(device, id, ws);
    if (!this.id) this[id] = {};
    console.log(this);
    this[id][device] = ws;
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
  console.log(`Conn Url ${req.url}`);
  const parsedURL = url.parse(req.url, true);
  const {id} = parsedURL.query;
  const device = trim(parsedURL.pathname, '/') === 'platform' ? 'platform' : 'control';
  if (device === 'platform') {
    global.conformitys.set('platform', id, ws);
  } else {
    global.conformitys.set('control', id, ws);
  }
  console.log(global.conformitys);
  ws.on('message', message => messageHandler(message, ws));
  ws.onclose = () => {
    sockets.allExcept(ws).forEach( socket => socket.send('DISCONNECT'));
    global.conformitys.unset(device, id);
  };
}

wss.on('connection', connectionHandler);

const messageHandler = (message, ws) => {
  sockets.allExcept(ws).forEach( socket => socket.send(message));
};
