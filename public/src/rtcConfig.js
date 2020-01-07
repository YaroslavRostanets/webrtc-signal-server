
export const config = {
 iceServers: [
   {
     urls: [
       "stun: stun1.l.google.com:19302",
       "stun:stun.iptel.org",
       "stun: stun3.l.google.com:19302"]
   },
   {
     url: 'turn:numb.viagenie.ca',
     credential: 'muazkh',
     username: 'webrtc@live.com'
   }
 ]
};
