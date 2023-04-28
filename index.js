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
  for (let [room, value] of Object.entries(rooms)) {
    if (rooms[room]["users"][0] == user_id){
      rooms[room]["users"].splice(0, 1);
      if (rooms[room]["users"].length == 0){
        delete rooms[room];
      }
    } else if ((rooms[room]["users"][1] == user_id)){
      rooms[room]["users"].splice(1, 1);
      if (rooms[room]["users"].length == 0){
        delete rooms[room];
      }
    }
  }
}

io.on("connection", (socket) => {
  console.log(socket.id, " connected");

  socket.on('disconnect', () => {
    console.log(socket.id, " disconnected")
    disconnect(socket.id)
  });

  socket.on('create private room', ( mode, callback) => {
    do{
      var newRoom = createNewRoom(4);
    } while (Object.keys(rooms).includes(newRoom));
    rooms[newRoom] = {"users":[],"type":"private", "mode":mode, name: newRoom}; 
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

  socket.on("deplace room", (room, nickname) => {
    socket.join(room)
    rooms[room]["users"].push([socket.id, nickname]);
  })

  socket.on("join public room", (mode, callback) => {
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
    rooms[newRoom] = {"users":[],"type":"public", "mode": mode, name: newRoom}; 
    callback({
      nameRoom: newRoom
    });
  });
  
  socket.on('init game',(room, callback) => {    if (rooms[room]["users"].length == 1){
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
    roomDict = rooms[room]
    players = [
      {
        "color": "red",
        "nickname": roomDict["users"][0][1]
      },
      {
        "color": "blue",
        "nickname": roomDict["users"][1][1]
      }
    ]
    console.log(room);
    first_player = players[Math.floor(Math.random() * 2)];
    io.to(room).emit('start game', roomDict, first_player);
  });



  socket.on("choose piece", (room, piece_id, players) => {
    console.log(piece_id, "choose")
    io.to(room["name"]).emit("choose piece", room, piece_id, players);
  });
  

  socket.on("place piece", (room, locationPiece, piece_id, players) => {
    console.log(piece_id, "place")
    io.to(room["name"]).emit("place piece", room, locationPiece, piece_id, players);
  });

  socket.on("end game", (room, message) => {
    io.to(room["name"]).emit("end game", room, message);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static(path.join(__dirname, "public")));