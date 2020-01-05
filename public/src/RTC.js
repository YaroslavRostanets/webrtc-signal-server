import {SIGNAL_SERVER, PLATFORM_SOCKET} from '../config.js';
import SignalEmitter from './SignalEmitter.js';
import {platformSocket} from './platformSocket.js';
import {config} from './rtcConfig.js';
console.log(SIGNAL_SERVER, PLATFORM_SOCKET);
const se = new SignalEmitter(SIGNAL_SERVER);

export default class RTC {
  constructor(isControl, videoStreamCallback, dataChannelCallback) {
    console.log('isControl: ', isControl);
    this.isControl = isControl;
    this.videoStreamCallback = videoStreamCallback;
    this.dataChannelCallback = dataChannelCallback;
    this.pc = new RTCPeerConnection(config);
    this.pc.onicecandidate = evt => {
      if(evt.candidate) {
        se.send('ICE', evt.candidate);
      }
    };
    this.pc.onconnection = () => {
      console.log('Connection established');
    };
    this.pc.onclosedconnection = () => {
      console.log('Disconnected');
    };
    this.pc.addEventListener('track', e => {
      this.videoStreamCallback(e.streams[0]);
    });
    if (isControl) {
      this.channel = this.pc.createDataChannel('RTCDataChannel');
      this.channel.onopen = () => this.dataChannelCallback(this.channel);
      this.channel.onclose = () => console.log('Channel closed');
      this.channel.onerror = err => console.log('Channel error:', err);
      this.channel.onmessage = e => console.log('Incoming message:', e.data);
    } else {
      this.pc.ondatachannel = (e) => {
        this.channel = e.channel;
        this.channel.onopen = () => console.log('Channel open');
        this.channel.onclose = () => console.log('Channel closed');
        this.channel.onerror = err => console.log('Channel error:', err);
        this.channel.onmessage = (e) => {
          console.log('I: ', e.data);
          this._parseControlMessage(e);
        };
      };
    }
    se.on('SDP', sdp => {
      console.log('SDP CANDIDATE: ', sdp);
      this._setRemoteSDP(sdp);
    });
    se.on('ICE', ice => {
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
    return this.pc.createOffer({offerToReceiveVideo: true})
      .then(offer => {
      this.pc.setLocalDescription(offer);
      return offer;
    })
      .then(offer => se.send('SDP', offer))
      .catch(err => console.error(err));
  }

  async createAnswer() {
    await this._addStream();
    this.platformSocket = await platformSocket(PLATFORM_SOCKET);
    console.log('platformSocket: ', this.platformSocket);
    this.pc.createAnswer()
      .then( answer => {
        this.pc.setLocalDescription(answer);
        return answer;
      })
      .then(answer => se.send('SDP', answer))
  }

  async _addStream() {
    return navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
        stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
      })
      .catch(function(err) {
        console.log(err);
      });
  }

  _parseControlMessage(e) {
    //const message = JSON.parse(e.data);
    console.log('MESSAGE: ', e.data);
    console.log('SOCKET: ', this.platformSocket);
    if(this.platformSocket && this.platformSocket.send) {

      this.platformSocket.send(e.data);
    }

  }
}

