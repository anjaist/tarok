let socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('=> Websocket connected! <=');
    socket.emit('connect to playroom');
});

socket.on('a user connected', function(username) {
    console.log(`User ${username} has joined`)
    let user = document.getElementById(username);
    if (user) {
        user.classList.remove('inactive-username');
        user.innerHTML = username
    }
});

socket.on('a user disconnected', function(username) {
    console.log(`User ${username} has left`);
    let user = document.getElementById(username);
    if (user) {
        user.classList.add('inactive-username');
        user.innnerText = `Čakamo na ${username}`
    }
});
