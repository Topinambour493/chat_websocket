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
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/:roomId', (req, res) => {
  roomId = req.params.roomId;
  if (Object.keys(rooms).includes(roomId)){
    if (rooms[roomId]["users"].length < 2){
      res.sendFile(__dirname + '/views/quarto.html');
    } else {
      res.sendFile(__dirname + '/views/full.html');
    }
  } else {
    res.sendFile(__dirname + '/views/not_found.html');
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
    var index = rooms[room]["users"].indexOf(user_id)
    if (index > -1){
      rooms[room]["users"].splice(index, 1);
      if (rooms[room]["users"].length == 0){
        delete rooms[room];
      }
    }
  }
  console.log(rooms);
}

io.on("connection", (socket) => {
  console.log(socket.id, " connected");

  socket.on('disconnect', () => {
    console.log(socket.id, " disconnected")
    disconnect(socket.id)
  });

  socket.on('create private room', (callback) => {
    do{
      var newRoom = createNewRoom(4);
    } while (Object.keys(rooms).includes(newRoom));
    rooms[newRoom] = {"users":[],"type":"private", "mode":"oui"}; 
    console.log(newRoom, " created");
    callback({
      nameRoom: newRoom
    });
  }); 

  socket.on('join room private', (room, callback) => {
    if (Object.keys(rooms).includes(room)){
      callback({
        status: "ok"
      });
    } else {
      callback({
        status: "not found"
      });
    };
  }); 

  socket.on("deplace room", (room) => {
    socket.join(room)
    if (Object.keys(rooms).includes(room) == false){
      rooms[room] = {"users":[],"type":"private"};
    }
    console.log(rooms)
    rooms[room]["users"].push(socket.id)
  })

  socket.on("join public room", (mode, callback) => {
    console.log(rooms);
    for (let [room, value] of Object.entries(rooms)) {
      if (rooms[room]["users"].length == 1 && 
          rooms[room]["type"] == 'public' && 
          rooms[room]["mode"] == mode ){
        callback({
          nameRoom: room
        });
      }
    }
    do{
      var newRoom = createNewRoom(4);
    } while (Object.keys(rooms).includes(newRoom));
    rooms[newRoom] = {"users":[],"type":"public", "mode": mode}; 
    callback({
      nameRoom: newRoom
    });
  });
  
  socket.on('init chat',(room, callback) => {
    if (rooms[room]["users"].length == 1){
      callback({
        status: "first"
      })
    } else {
      callback({
        status: "second"
      })
    }
  });

  socket.on('start game', (room) => {
    io.to(room).emit('start game');
  });
  
  socket.on('chat message', (room, username, msg) => {
    io.to(room).emit('chat message',username, msg);   
  });

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static(path.join(__dirname, "public")));