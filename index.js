const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");


var users = []
var rooms = {}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/:roomId', (req, res) => {
  roomId = req.params.roomId;
  if (Object.keys(rooms).includes(roomId)){
    if (rooms[roomId].length < 2){
      res.sendFile(__dirname + '/chat.html');
    } else {
      res.sendFile(__dirname + '/full.html');
    }
  } else {
    res.sendFile(__dirname + '/not_found.html');
  }
});

function createNewRoom(length){
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Pick characers randomly
  let str = '';
  for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

async function disconnect(user_id){
  console.log(rooms);
  for (let [room, value] of Object.entries(rooms)) {
    var index = rooms[room].indexOf(user_id)
    if (index > -1){
      rooms[room].splice(index, 1);
      if (rooms[room].length == 0){
        delete rooms[room];
      }
    }
  }
  console.log(rooms);
}

io.on("connection", (socket) => {
  console.log(socket.id, " connected");


  socket.on("deplace room", (room) => {
    socket.join(room)
    if (Object.keys(rooms).includes(room) == false){
      rooms[room] = [] ;
    }
    rooms[room].push(socket.id)
  })
  
  socket.on('chat message', (room, msg) => {
    io.to(room).emit('chat message', msg);   
  });

  socket.on('disconnect', () => {
    console.log(socket.id, " disconnected")
    disconnect(socket.id)
  });

  socket.on('new room', (callback) => {
    do{
      var newRoom = createNewRoom(4);
    } while (Object.keys(rooms).includes(newRoom));
    rooms[newRoom] = [] 
    console.log(newRoom, " created");
    callback({
      nameRoom: newRoom
    });
  }); 

  socket.on('join room random', () => {
    var room = rooms[Math.floor(Math.random()*rooms.length)];
    console.log(room, "joined");
    io.emit('deplace room', room);
  }); 

  socket.on('join room', (room, callback) => {
    console.log(room, "input");
    console.log(rooms);
    if (Object.keys(rooms).includes(room)){
      callback({
        status: "ok"
      });
    } else {
      callback({
        status: "not found"
      });
    }}); 
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static(path.join(__dirname, "public")));