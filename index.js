const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
const path = require("path");

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
            if (rooms[roomId]["type"] === "local" || rooms[roomId]["users"].length < 2) {
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

async function disconnect(user_id) {
    for (let [room, value] of Object.entries(rooms)) {
        if (rooms[room]["users"][0] === user_id) {
            rooms[room]["users"].splice(0, 1);
            if (rooms[room]["users"].length === 0) {
                delete rooms[room];
            }
        } else if ((rooms[room]["users"][1] === user_id)) {
            rooms[room]["users"].splice(1, 1);
            if (rooms[room]["users"].length === 0) {
                delete rooms[room];
                socket.leave(room)
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

    socket.on("revenge accepted", (room, mode) => {
        console.log("baba", rooms[room]["nextRoom"])
        if (rooms[room]["nextRoom"] === undefined){
            let newRoom;
            do {
                newRoom = createNewRoom(4);
            } while (Object.keys(rooms).includes(newRoom));
            rooms[room]["nextRoom"] = newRoom
            rooms[newRoom] = {"users": [], "type": "private", "mode": mode, "name": newRoom};
        } else {
            socket.leave(room);
            // io.to(room["name"]).emit("test")
        }
        newRoom = rooms[room]["nextRoom"]
        console.log(newRoom, " created");
        io.to(room).emit('revenge', newRoom);
    })

    socket.on("revenge refused", (room) => {
        console.log("not revenge", room)
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
        rooms[newRoom] = {"users": [], "type": "private", "mode": mode, "name": newRoom};
        console.log(newRoom, " created");
        callback({
            nameRoom: newRoom
        });
    });

    socket.on('create local room', (mode, callback) => {
        let newRoom;
        do {
            newRoom = createNewRoom(4);
        } while (Object.keys(rooms).includes(newRoom));
        rooms[newRoom] = {"users": [], "type": "local", "mode": mode, name: newRoom};
        console.log(newRoom, " created");
        callback({
            nameRoom: newRoom
        });
    });

    socket.on('join room private', (room, callback) => {
        if (Object.keys(rooms).includes(room)) {
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
        console.log("deplace", room)
        rooms[room]["users"].push([socket.id, nickname]);
        console.log(rooms[room])
    })




    socket.on("join public room", (mode, callback) => {
        let newRoom;
        for (let [room, value] of Object.entries(rooms)) {
            if (rooms[room]["users"].length === 1 &&
                rooms[room]["type"] === 'public' &&
                rooms[room]["mode"] === mode) {
                callback({
                    nameRoom: room
                });
            }
        }
        do {
            newRoom = createNewRoom(4);
        } while (Object.keys(rooms).includes(newRoom));
        rooms[newRoom] = {"users": [], "type": "public", "mode": mode, name: newRoom};
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
                "nickname": roomDict["users"][0][1],
                "user_id":  roomDict["users"][0][0]
            },
            {
                "color": "blue",
                "nickname": roomDict["users"][1][1],
                "user_id":  roomDict["users"][1][0]
            }
        ]
        console.log(room);
        let first_player = players[Math.floor(Math.random() * 2)];
        io.to(room).emit('start game', roomDict, first_player);
    });


    socket.on("choose piece", (room, piece_id, players) => {
        console.log(piece_id, "choose")
        io.to(room["name"]).emit("place piece", room, piece_id, players);
    });


    socket.on("place piece", (room, locationPiece, piece_id, players) => {
        console.log(piece_id, "place piece on")
        io.to(room["name"]).emit("choose piece", room, locationPiece, piece_id, players);
    });

    socket.on("end game", (room, message) => {
        io.to(room["name"]).emit("end game", room, message);
    })

    socket.on("get players in room", (room, callback) => {
        console.log("nb players : ", rooms[room]["users"].length)
        callback({
            nb_players: rooms[room]["users"].length
        });
    })

    socket.on("propose revenge", (room) => {
        console.log("propose revenge", room)
        socket.to(room).emit("revenge proposal", room);
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

