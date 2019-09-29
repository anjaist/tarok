let socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('Websocket connected!');
});

socket.on('message', function(data) {
    console.log(data);
    if (data) {

    }
});


// todo: finish this if statement - delete/add <p> if names
