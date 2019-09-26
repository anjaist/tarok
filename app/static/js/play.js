let socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('Websocket connected!')
});

socket.on('Active players changed', function(data) {
    console.log(data)
});
