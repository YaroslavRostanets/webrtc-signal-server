
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
          console.log('MESS: ', e.data, new Date().toLocaleString());
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
    console.log('createOffer');
    return this.pc.createOffer({offerToReceiveVideo: true})
      .then(offer => {
      this.pc.setLocalDescription(offer);
      return offer;
    })
      .then(offer => this.SE.send('SDP', offer))
      .catch(err => console.error(err));
  }

  async createAnswer() {
    await this._addStream();
    this.platformSocket = await platformSocket(this.platformSocket);
     /*--------------33--------*/
     platformSocket(this.platformSocket)
     .then(socket => this.platformSocket = socket);
    /*----------------------*/
    this.pc.createAnswer()
      .then( answer => {
        this.pc.setLocalDescription(answer);
        return answer;
      })
      .then(answer => this.SE.send('SDP', answer))
  }

  async _addStream() {
    return navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
        stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
        /*--------------33--------*/
        const testVideo = document.querySelector('#test-video');
        if(testVideo) {
          testVideo.srcObject = stream;
          testVideo.play();
        }
        /*----------------------*/
      })
      .catch(function(err) {
        console.log(err);
      });
  }

  _parseControlMessage(e) {
    //const message = JSON.parse(e.data);
    if(this.platformSocket && this.platformSocket.send) {
      //console.log('SEND: ', e.data);
      this.platformSocket.send(e.data.data);
    }

  }
}

function sum(number){
  return number === 0 ?  0 : number + sum(number - 1)
}
