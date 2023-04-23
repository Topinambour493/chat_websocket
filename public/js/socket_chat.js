
var socket = io();
console.log(socket);

socket.emit('deplace room', window.location.pathname.substring(1))

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');



form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    var room = window.location.pathname.substring(1)
    socket.emit('chat message', room, input.value);
    input.value = '';
  }
});

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});




