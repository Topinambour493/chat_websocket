var socket = io();
var createPrivate = document.getElementById('create_private');
var joinPublic = document.getElementById('join_public');
var createLocal = document.getElementById('create_local');
var joinPrivate = document.getElementById('join_private');
var inputNameRoom = document.getElementById('room');
var inputUsername = document.getElementById('username');
var typeGame;
const validateNicknamesLocal = document.getElementById("form-nicknames")
const validateNickname = document.getElementById("form-nickname")

inputUsername.value = localStorage.getItem('nickname')

function getMode() {
    mode = document.querySelector('#mode').checked;
    return mode ? "expert" : "classique";
}


function goGameOrEnterNickname(){
    let nickname = localStorage.getItem('nickname')
    localStorage.setItem('nickname',nickname)
    if ( ['',null,'null'].includes(nickname) ){
        console.log(nickname,'pk')
        localStorage.setItem("nickname", nickname)
        document.querySelector("#form-nickname").parentElement.style.display= "block";
    } else {
        console.log('ici')
        inputUsername.value = localStorage.getItem('nickname')
        localStorage.setItem("nickname", nickname)
        mode = getMode();
        if (typeGame === "'join room private'" ){
            let nameRoom = inputNameRoom.value;
            socket.emit(typeGame, nameRoom, (response) => {
                if (response.status === 'not found') {
                    alert("Could not join room. (noSuchRoom)")
                    console.log("ui");
                } else {
                    window.location.pathname = nameRoom;
                    console.log("non");
                }
            });
        } else {
            socket.emit(typeGame, mode, (response) => {
                if (response.status === 'not found') {
                    alert("Could not join room. (noSuchRoom)")
                } else {
                    window.location.pathname = response.nameRoom;
                }
            });
        }
    }
}

function goGameLocalOrEnterNickname(){
    localStorage.setItem('nickname2','')
    let nickname =  document.querySelector("input[name='nickname1']").value || localStorage.getItem('nickname')
    let nickname2 = document.querySelector("input[name='nickname2']").value
    localStorage.setItem('nickname',nickname)
    localStorage.setItem('nickname2',nickname2)
    if ( ['',null,'null'].includes(nickname) || ['',null].includes(nickname2)){
        document.querySelector("input[name='nickname1']").value = localStorage.getItem("nickname")
        document.querySelector("#form-nicknames").parentElement.style.display= "block";
    }
    else {
        localStorage.setItem("nickname", nickname)
        localStorage.setItem("nickname2",  nickname2)
        document.querySelector("input[name='nickname1']").value = localStorage.getItem("nickname")
        document.querySelector("input[name='nickname2']").value = localStorage.getItem("nickname2")
        inputUsername.value = localStorage.getItem('nickname')
        mode = getMode();
        socket.emit('create local room', mode, (response) => {
            window.location.pathname = response.nameRoom;
        });
    }
}
createLocal.addEventListener('click', function (e) {
    e.preventDefault();
    goGameLocalOrEnterNickname()
});

validateNicknamesLocal.addEventListener('submit', function (e) {
    e.preventDefault();
    goGameLocalOrEnterNickname()
});

validateNickname.addEventListener('submit', function (e){
    e.preventDefault();
    goGameOrEnterNickname()
});

createPrivate.addEventListener('click', function (e) {
    e.preventDefault()
    typeGame = 'create private room'
    goGameOrEnterNickname()
});


joinPrivate.addEventListener('click', function (e) {
    e.preventDefault();
    typeGame = 'join room private'
    goGameOrEnterNickname()
});

joinPublic.addEventListener('click', function (e) {
    e.preventDefault();
    typeGame = 'join public room'
    goGameOrEnterNickname()
});

document.querySelector("input[name='nickname1']").addEventListener('input', (event) => {
    event.target.value = event.target.value.trim();
});

document.querySelector("input[name='nickname2']").addEventListener('input', (event) => {
    event.target.value = event.target.value.trim();
});

document.querySelector("input[name='nickname']").addEventListener('input', (event) => {
    event.target.value = event.target.value.trim();
});

document.getElementById('username').addEventListener('input', (event) => {
    event.target.value = event.target.value.trim();
});


window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});