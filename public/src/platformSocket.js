export const platformSocket = async function(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.onopen = function() {
      resolve(socket);
    };
    socket.onclose = function(event) {
      console.log('close');
    };

    socket.onmessage = function(event) {
      console.log(event.data);
    };

    socket.onerror = function(error) {
      console.log("Ошибка " + error.message);
      reject(error.message);
    };
  });
};
