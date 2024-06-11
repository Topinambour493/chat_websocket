const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
const path = require("path");
const fs = require('fs');

var logs = fs.createWriteStream('logs.txt');
var endLog = " "+  Date() + "\n"


let rooms = {}

app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);


app.get('/', (req, res) => {
    res.render('pages/index.ejs');
});

app.get('/:roomId', (req, res) => {
        let roomId = req.params.roomId;
        if (Object.keys(rooms).includes(roomId)) {
            if (rooms[roomId]["type"] === "local" || ( rooms[roomId]["users"].length < 2 && rooms[roomId]["status_game"] === "not started") ) {
                if (rooms[roomId]["users"].length === 1){
                    rooms[roomId]["status_game"] = "started"
                }
                res.render('pages/quarto.ejs', {type: rooms[roomId]["type"], mode: rooms[roomId]["mode"]});
            } else {
                res.render('pages/full.ejs');
            }
        } else {
            res.render('pages/not_found.ejs');
        }
    }
)
;

function createNewRoom(length) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // Pick characters randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}

function disconnect(user_id) {
    logs.write("disconnected " + rooms + endLog)
    for (let [room, value] of Object.entries(rooms)) {
        if (rooms[room]["users"].length === 1){
            if (rooms[room]["users"][0].id === user_id) {
                rooms[room]["users"].splice(0, 1);
                logs.write(room+ " deleted" + endLog)
                delete rooms[room];
            }
        } else if (rooms[room]["users"].length === 2){
            if (rooms[room]["users"][1].id === user_id) {
                rooms[room]["users"].splice(1, 1);
                io.to(room).emit("end game disconnected")
            }
        }
    }
}



io.on("connection", (socket) => {
    logs.write(socket.id+" connected"+endLog);

    socket.on('quit game', (room) => {
        logs.write("user quit "+  room+endLog)
        if (rooms[room]["users"].length === 1) {
            logs.write(room+ "deleted"+endLog);
            delete rooms[room];
            socket.leave(room)
        }
    })

    socket.on('disconnect', () => {
        logs.write(socket.id+ " disconnected"+endLog)
        disconnect(socket.id)
    });

    socket.on("revenge accepted", (room, mode) => {
        logs.write("revenge accepted " + rooms[room]["nextRoom"] + endLog)
        if (rooms[room]["nextRoom"] === undefined){
            let newRoom;
            do {
                newRoom = createNewRoom(4);
            } while (Object.keys(rooms).includes(newRoom));
            rooms[room]["nextRoom"] = newRoom
            rooms[newRoom] = {"users": [], "type": "private", "mode": mode, "name": newRoom, status_game: "not started"};
        } else {
            socket.leave(room);
            // io.to(room["name"]).emit("test")
        }
        newRoom = rooms[room]["nextRoom"]
        logs.write(newRoom+ " created"+ endLog);
        io.to(room).emit('revenge', newRoom);
    })

    socket.on("revenge refused", (room) => {
        logs.write("not revenge "+ room + endLog)
        socket.to(room).emit("not revenge");
    })

    socket.on('not revenge', (room) => {
        io.to(room).emit("not revenge")
    })

    socket.on('create private room', (mode, callback) => {
        let newRoom;
        do {
            newRoom = createNewRoom(4);
        } while (Object.keys(rooms).includes(newRoom));
        rooms[newRoom] = {"users": [], "type": "private", "mode": mode, "name": newRoom, status_game: "not started"};
        logs.write(newRoom+" created"+endLog);
        callback({
            nameRoom: newRoom
        });
    });

    socket.on('create local room', (mode, callback) => {
        let newRoom;
        do {
            newRoom = createNewRoom(4);
        } while (Object.keys(rooms).includes(newRoom));
        rooms[newRoom] = {"users": [], "type": "local", "mode": mode, name: newRoom, status_game: "not started"};
        logs.write(newRoom+ " created"+endLog);
        callback({
            nameRoom: newRoom
        });
    });

    socket.on('join room private', (room, callback) => {
        if (Object.keys(rooms).includes(room) && rooms[room]["status_game"] === 'not started') {
            callback({
                status: "ok"
            });
        } else {
            callback({
                status: "not found"
            });
        }
    });

    socket.on("deplace room", (room, nickname) => {
        socket.join(room)
        logs.write("deplace "+ room+ endLog)
        rooms[room]["users"].push({"id":socket.id, "nickname":nickname});
        logs.write(rooms[room]+endLog)
    })




    socket.on("join public room", (mode, callback) => {
        let newRoom;
        for (let [room, value] of Object.entries(rooms)) {
            if (rooms[room]["users"].length === 1 &&
                rooms[room]["type"] === 'public' &&
                rooms[room]["mode"] === mode &&
                rooms[room]["status_game"] === 'not started') {
                newRoom = room
            }
        }
        if (!newRoom){
            do {
                newRoom = createNewRoom(4);
            } while (Object.keys(rooms).includes(newRoom));
            rooms[newRoom] = {"users": [], "type": "public", "mode": mode, name: newRoom, status_game: "not started"};
        }
        callback({
            nameRoom: newRoom
        });
    });

    socket.on('init game', (room, callback) => {
        if (rooms[room]["users"].length === 1) {
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
        let roomDict = rooms[room]
        let players = [
            {
                "color": "red",
                "nickname": roomDict["users"][0].nickname,
                "user_id":  roomDict["users"][0].id
            },
            {
                "color": "blue",
                "nickname": roomDict["users"][1].nickname,
                "user_id":  roomDict["users"][1].id
            }
        ]
        logs.write(room + endLog);
        let first_player = players[Math.floor(Math.random() * 2)];
        io.to(room).emit('start game', roomDict, first_player);
    });


    socket.on("choose piece", (room, piece_id, players) => {
        io.to(room["name"]).emit("place piece", room, piece_id, players);
    });


    socket.on("place piece", (room, locationPiece, piece_id, players) => {
        io.to(room["name"]).emit("choose piece", room, locationPiece, piece_id, players);
    });

    socket.on("end game", (room, message) => {
        rooms[room.name].status_game = "ended";
        logs.write("end game "+ rooms[room.name]+endLog)
        io.to(room["name"]).emit("end game", room, message);
    })

    socket.on("get players in room", (room, callback) => {
        logs.write("nb players : "+ rooms[room]["users"].length + endLog)
        callback({
            nb_players: rooms[room]["users"].length
        });
    })

    socket.on("propose revenge", (room) => {
        if (rooms[room]["users"].length === 1){
            io.to(room).emit("not revenge");
        }
        socket.to(room).emit("revenge proposal", room);
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

