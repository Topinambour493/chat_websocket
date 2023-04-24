var createPrivate = document.getElementById('create_private');
var joinPublic = document.getElementById('join_public');
var inputNameRoom = document.getElementById('room');
var inputUsername = document.getElementById('username');
var joinPrivate = document.getElementById('join_private');

inputUsername.value = localStorage.getItem('username') ? localStorage.getItem('username') : "me";

joinPublic.addEventListener('click', function(e) {
  e.preventDefault();
  socket.emit('join public room', (response) => {
      window.location.pathname = response.nameRoom;
  });
});

createPrivate.addEventListener('click', function(e) {
  e.preventDefault();
  console.log("ouiuo");
  socket.emit('create private room', (response) => {
      window.location.pathname = response.nameRoom;
  });
});


joinPrivate.addEventListener('click', function(e) {
  e.preventDefault();
  console.log('private');
  nameRoom = inputNameRoom.value;
  socket.emit('join room private', nameRoom, (response) => {
    if (response.status == 'not found'){
      alert("Could not join room. (noSuchRoom)")
      console.log("ui");
    } else {
      window.location.pathname = nameRoom;
      console.log("non");
    }; 
  });

});





