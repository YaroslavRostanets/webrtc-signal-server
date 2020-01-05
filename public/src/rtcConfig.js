export const config = {
  iceServers: [
    {
      urls: [
        "stun: stun.ekiga.net",
        "stun: stun.ideasip.com",
        "stun: stun.rixtelecom.se",
        "stun: stun.schlund.de",
        "stun: stun1.l.google.com:19302",
        "stun: stun1.voiceeclipse.net:3478",
        "stun: stun2.l.google.com:19302",
        "stun: stun3.l.google.com:19302"]
    },
    {
      url: 'turn:turn.anyfirewall.com:443?transport=tcp',
      credential: 'webrtc',
      username: 'webrtc'
    }
  ]
};
