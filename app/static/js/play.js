let socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('Websocket connected!');
});

socket.on('joined', function(message) {
    console.log(message['message'])
});

socket.on('left', function(message) {
    console.log(message['message'])
});
