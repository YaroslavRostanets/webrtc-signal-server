
import {platformSocket} from './platformSocket.js';
import {config} from './rtcConfig.js';

export default class RTC {
  constructor(options, signalEmitter, videoStreamCallback, dataChannelCallback, setConnectionState) {
    this.handlers = {};
    const {isControl} = options;
    this.isControl = isControl;
    this.SE = signalEmitter;
    this.videoStreamCallback = videoStreamCallback;
    this.dataChannelCallback = dataChannelCallback;
    this.platformSocketUri = options.platformSocket;
    this.pc = new RTCPeerConnection(config);
    this.setConnectionState = setConnectionState;

    pcHandlers(this.pc, this);
    seHandlers(this);

    if (isControl) {
      this.channel = this.pc.createDataChannel('RTCDataChannel');
      this.channel.onopen = () => this.emit('dataChannel', this.channel);
    } else {
      this.pc.ondatachannel = (e) => {
        this.channel = e.channel;
        this.channel.onmessage = (e) => this._parseControlMessage(e);
        setInterval(() => {
          if (this.pc.iceConnectionState === 'disconnected' || this.pc.iceConnectionState === 'failed') {
            window.location.reload();
            this.emit('disconnected');
          }
        }, 1000);
      };
    }
  }

  on(eventName, handler) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
  }

  emit(eventName, ...values) {
    this.handlers[eventName].forEach(fn => fn.apply(values))
  }

  _setRemoteSDP(sdp) {
    this.pc.setRemoteDescription(new RTCSessionDescription(sdp), () => {
      if(this.pc.remoteDescription.type == 'offer') {
        this.createAnswer();
      }
    }, err => {
      console.log('Failed to setRemoteDescription():', err);
    });
  }

  async createOffer() {
    const offer = await this.pc.createOffer({offerToReceiveVideo: true});
    this.pc.setLocalDescription(offer);
    this.SE.send('SDP', offer);
  }

  async createAnswer() {
    try {
      await this._addStream();
      this.platformSocket = await platformSocket(this.platformSocketUri);
      const answer = await this.pc.createAnswer();
      this.pc.setLocalDescription(answer);
      this.SE.send('SDP', answer);
    } catch (err) {
      console.error(err);
      this.SE.send('ERROR', err);
    }
  }

  async _addStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
      stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
      return stream;
    } catch (err) {
      console.error(err);
      this.SE.send('ERROR', err);
    }
  }

  _parseControlMessage(e) {
    const message = JSON.parse(e.data);
    if(this.platformSocket && this.platformSocket.send) {
      this.platformSocket.send(JSON.stringify(message.data));
    }
  }
}

function pcHandlers(pc, _this) {
  _this.pc.onicecandidate = evt => {
    if (evt.candidate) _this.SE.send('ICE', evt.candidate);
  };

  _this.pc.onconnection = () => console.log('Connection established');

  _this.pc.addEventListener('track', e => _this.emit('videoStream', e.streams[0]));

  _this.pc.onconnectionstatechange = ev => {
    console.log('CHANGE: ', ev);
    if (_this.isControl) {
      _this.setConnectionState(_this.pc.connectionState);
    } else {
      if (['disconnected', 'closed', 'failed'].some(state => _this.pc.connectionState === state)) {
        window.location.reload();
      }
    }
  };
  _this.pc.onicecandidateerror = err => {
    console.log('CANDIDATE_ERROR: ', err);
    //window.location.reload();
  }
}

function seHandlers(_this) {
  _this.SE.on('SDP', sdp => {
    _this._setRemoteSDP(sdp);
  });
  _this.SE.on('ICE', ice => {
    _this.pc.addIceCandidate(new RTCIceCandidate(ice));
  });
  _this.SE.on('ERROR', err => {
    console.log('ERROR: ', err);
  });
}
