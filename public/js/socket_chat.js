
var socket = io();
console.log(socket);

socket.emit('deplace room', window.location.pathname.substring(1))

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var message = document.getElementById('message');
var room = window.location.pathname.substring(1)


socket.emit("init chat", room, (response) => {
  if (response.status == "first"){
    document.getElementById("loader").style.display = "block";
  } else if (response.status == "second"){
    socket.emit("start game", room);
  }
});

socket.on('start game', function(){
  document.getElementById("loader").style.display = "none";
  message.innerHTML="oupi";
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    var room = window.location.pathname.substring(1)
    var username = localStorage.getItem('username')
    socket.emit('chat message', room, username, input.value);
    input.value = '';
  }
});

socket.on('chat message', function(username, msg) {
  var item = document.createElement('li');
  item.textContent = username  + " " +  msg;

  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});




