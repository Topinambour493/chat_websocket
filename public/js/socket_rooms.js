var socket = io();
var createPrivate = document.getElementById('create_private');
var joinPublic = document.getElementById('join_public');
var createLocal = document.getElementById('create_local');
var joinPrivate = document.getElementById('join_private');
var inputNameRoom = document.getElementById('room');
var inputUsername = document.getElementById('username');

inputUsername.value = localStorage.getItem('nickname')

function getMode() {
    mode = document.querySelector('input[name="mode"]:checked').value;
    return mode;
}

joinPublic.addEventListener('click', function (e) {
    e.preventDefault();
    if (!inputUsername.value.trim()) {
        alert("entre un pseudo")
    } else {
        mode = getMode();
        socket.emit('join public room', mode, (response) => {
            window.location.pathname = response.nameRoom;
        });
    }
});

createLocal.addEventListener('click', function (e) {
    e.preventDefault();
    if (!inputUsername.value.trim()) {
        alert("entre un pseudo")
    } else {
        mode = getMode();
        console.log("je susi la ", mode)
        socket.emit('create local room', mode, (response) => {
            window.location.pathname = response.nameRoom;
        });
    }
});

createPrivate.addEventListener('click', function (e) {
    e.preventDefault();
    if (!inputUsername.value.trim()) {
        alert("entre un pseudo")
    } else {
        mode = getMode();
        socket.emit('create private room', mode, (response) => {
            window.location.pathname = response.nameRoom;
        });
    }
});


joinPrivate.addEventListener('click', function (e) {
    e.preventDefault();
    if (!inputUsername.value.trim()) {
        alert("entre un pseudo")
    } else {
        console.log('private');
        nameRoom = inputNameRoom.value;
        socket.emit('join room private', nameRoom, (response) => {
            if (response.status === 'not found') {
                alert("Could not join room. (noSuchRoom)")
                console.log("ui");
            } else {
                window.location.pathname = nameRoom;
                console.log("non");
            }
        });
    }
});







