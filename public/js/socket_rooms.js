var create_room = document.getElementById('create');
var join = document.getElementById('join');
var input = document.getElementById('room');


create_room.addEventListener('click', function(e) {
  e.preventDefault();
  socket.emit('new room', (response) => {
      window.location.pathname = response.nameRoom;
  });
});

join.addEventListener('click', function(e) {
  e.preventDefault();
  nameRoom = input.value;
  socket.emit('join room', nameRoom, (response) => {
    if (response.status == 'not found'){
      alert("Could not join room. (noSuchRoom)")
      console.log("ui");
    } else {
      window.location.pathname = nameRoom;
      console.log("non");
    }; 
  });

});





