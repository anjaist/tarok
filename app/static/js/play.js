let socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('Websocket connected!');
});

socket.on('message', function(data) {
    console.log(data);
    for (let username in data){
      if (data[username]) {
        document.getElementById(username).innerText = username
        document.getElementById(username).className = ""
      } else {
        document.getElementById(username).innerText = "Čakamo na " + username
        document.getElementById(username).className = "inactive-username"
      }
    }
});
