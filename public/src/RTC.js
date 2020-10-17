
import {platformSocket} from './platformSocket.js';
import {config} from './rtcConfig.js';

export default class RTC {
  constructor(options, signalEmitter, videoStreamCallback, dataChannelCallback) {
    const {isControl} = options;
    this.isControl = isControl;
    this.SE = signalEmitter;
    this.videoStreamCallback = videoStreamCallback;
    this.dataChannelCallback = dataChannelCallback;
    this.platformSocket = options.platformSocket;
    this.pc = new RTCPeerConnection(config);
    this.pc.onicecandidate = evt => {
      if(evt.candidate) {
        this.SE.send('ICE', evt.candidate);
      }
    };
    this.pc.onconnection = () => {
      console.log('Connection established');
    };
    this.pc.onconnectionstatechange = ev => {
      switch(this.pc.connectionState) {
        case "connected":
          console.log('connected');
          break;
        case "disconnected":
          console.log('disconnected');
          break;
        case "closed":
          console.log('closed');
          break;
        case "failed":
          console.log('failed')
          break;
        default:
          break;
      }
    };
    this.pc.addEventListener('track', e => {
      this.videoStreamCallback(e.streams[0]);
    });
    if (isControl) {
      this.channel = this.pc.createDataChannel('RTCDataChannel');
      this.channel.onopen = () => this.dataChannelCallback(this.channel);
      this.channel.onclose = () => console.log('Channel closed');
      this.channel.onerror = err => console.log('Channel error:', err);
    } else {
      this.pc.ondatachannel = (e) => {
        this.channel = e.channel;
        this.channel.onopen = () => console.log('Channel open');
        this.channel.onclose = () => console.log('Channel closed');
        this.channel.onerror = err => console.log('Channel error:', err);
        this.channel.onmessage = (e) => {
          this._parseControlMessage(e);
        };
      };
    }
    this.SE.on('SDP', sdp => {
      console.log('SDP CANDIDATE: ', sdp);
      this._setRemoteSDP(sdp);
    });
    this.SE.on('ICE', ice => {
      console.log('ICE CANDIDATE: ', ice);
      this.pc.addIceCandidate(new RTCIceCandidate(ice));
    });
  }

  _setRemoteSDP(sdp) {
    this.pc.setRemoteDescription(new RTCSessionDescription(sdp), () => {
      console.log('SET_REMOTE_DESC: ', sdp);
      if(this.pc.remoteDescription.type == 'offer') {
        this.createAnswer();
      }
    }, (err) => {
      console.log('Failed to setRemoteDescription():', err);
    });
  }

  async createOffer() {
    const offer = await this.pc.createOffer({offerToReceiveVideo: true});
    this.pc.setLocalDescription(offer);
    this.SE.send('SDP', offer);
  }

  async createAnswer() {
    await this._addStream();
    this.platformSocket = await platformSocket(this.platformSocket);
    const answer = await this.pc.createAnswer();
    this.pc.setLocalDescription(answer);
    this.SE.send('SDP', answer);
  }

  async _addStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
      stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
      return stream;
    } catch (err) {
      console.error(err);
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
