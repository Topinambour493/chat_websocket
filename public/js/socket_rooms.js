var socket = io();
var createPrivate = document.getElementById('create_private');
var joinPublic = document.getElementById('join_public');
var createLocal = document.getElementById('create_local');
var joinPrivate = document.getElementById('join_private');
var inputNameRoom = document.getElementById('room');
var inputUsername = document.getElementById('username');

inputUsername.value = localStorage.getItem('nickname')
localStorage.setItem('nickname2','')

function getMode() {
    mode = document.querySelector('#mode').checked;
    return mode ? "expert" : "classique";
}


function goGameOrEnterNickname(typeGame){
    if ( ['',null].includes(localStorage.getItem('nickname')) ){
        alertify.closeAll()
        alertify.prompt('Entre ton pseudo', '', function(evt, value) {
            localStorage.setItem('nickname', value.trim())
            inputUsername.value = value.trim()
            goGameOrEnterNickname(typeGame)
        });
    } else {
        mode = getMode();
        socket.emit(typeGame, mode, (response) => {
            window.location.pathname = response.nameRoom;
        });
    }
}

function goGameLocalOrEnterNickname(){
    if ( ['',null].includes(localStorage.getItem('nickname')) ){
        alertify.closeAll()
        alertify.prompt('Entre ton pseudo', '', function(evt, value) {
            localStorage.setItem('nickname', value.trim())
            inputUsername.value = value.trim()
            goGameLocalOrEnterNickname()
        });
    }
    else if ( ['',null].includes(localStorage.getItem('nickname2')) ){
        alertify.closeAll()
        alertify.prompt('Entre le pseudo du deuxième joueur', '', function(evt, value) {
            localStorage.setItem('nickname2', value.trim())
            goGameLocalOrEnterNickname()
        });
    }
    else {
        mode = getMode();
        socket.emit('create local room', mode, (response) => {
            window.location.pathname = response.nameRoom;
        });
    }
}

joinPublic.addEventListener('click', function (e) {
    e.preventDefault();
    goGameOrEnterNickname('join public room')
});

createLocal.addEventListener('click', function (e) {
    e.preventDefault();
    goGameLocalOrEnterNickname()
});

createPrivate.addEventListener('click', function (e) {
    e.preventDefault()
    goGameOrEnterNickname('create private room')
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







