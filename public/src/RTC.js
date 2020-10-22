
import {platformSocket} from './platformSocket.js';
import {config} from './rtcConfig.js';

export default class RTC {
  constructor(options, signalEmitter, videoStreamCallback, dataChannelCallback, setConnectionState) {
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
      this.channel.onopen = () => this.dataChannelCallback(this.channel);
      this.channel.onclose = () => console.log('Channel closed');
    } else {
      this.pc.ondatachannel = (e) => {
        this.channel = e.channel;
        this.channel.onopen = () => console.log('Channel open');
        this.channel.onclose = () => console.log('Channel closed');
        this.channel.onmessage = (e) => {
          this._parseControlMessage(e);
        };
      };
    }
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
    console.log('SEND OFFER: ', offer);
    this.SE.send('SDP', offer);
  }

  async createAnswer() {
    try {
      await this._addStream();
      this.platformSocket = platformSocket(this.platformSocketUri);
      const answer = await this.pc.createAnswer();
      this.pc.setLocalDescription(answer);
      console.log('SEND ANSWER: ', answer);
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
      //console.log('SEND: ', message.data);
      this.platformSocket.send(JSON.stringify(message.data));
    }
  }
}

function pcHandlers(pc, _this) {
  _this.pc.onicecandidate = evt => {
    console.log('CANDIDATE: ', evt.candidate);
    if (evt.candidate) _this.SE.send('ICE', evt.candidate);
  };

  _this.pc.onconnection = () => console.log('Connection established');

  _this.pc.addEventListener('track', e => _this.videoStreamCallback(e.streams[0]));

  _this.pc.onconnectionstatechange = ev => {
    if (_this.isControl) {
      _this.setConnectionState(_this.pc.connectionState);
    } else {
      if (['disconnected', 'closed', 'failed'].some(state => _this.pc.connectionState === state)) {
        window.location.reload();
      }
    }
  };
}

function seHandlers(_this) {
  _this.SE.on('SDP', sdp => {
    console.log('SDP CANDIDATE: ', sdp);
    _this._setRemoteSDP(sdp);
  });
  _this.SE.on('ICE', ice => {
    console.log('ICE CANDIDATE: ', ice);
    _this.pc.addIceCandidate(new RTCIceCandidate(ice));
  });
  _this.SE.on('ERROR', err => {
    console.log('ERROR: ', err);
  });
}
