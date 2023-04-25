
var socket = io();
console.log(socket);

socket.emit('deplace room', window.location.pathname.substring(1))

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var message = document.getElementById('message');
var room = window.location.pathname.substring(1)


socket.emit("init chat", room, (response) => {
  if (response.status == "second"){
    document.getElementById("loader").style.display = "none";
    socket.emit("start game", room);
  }
});

socket.on('start game', function(){
  document.getElementById("loader").style.display = "none";
  message.innerHTML="oupi";
});






