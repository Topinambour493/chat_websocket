 
var socket = io();

socket.emit('deplace room', window.location.pathname.substring(1), localStorage.getItem('nickname'))

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var message = document.getElementById('message');
var room = window.location.pathname.substring(1)


socket.emit("init game", room, (response) => {
  if (response.status == "second"){
    document.getElementById("loader").style.display = "none";
    socket.emit("start game", room);
  }
});


socket.on("choose piece", function(room, piece_id, players){
  console.log(piece_id, "socket choose")
  piece = document.getElementById(piece_id)
  piece.className+=" cursor_default";
  document.querySelector("header").append(piece.parentElement); 
  document.querySelector("#action").innerHTML="Place la pièce";
  pseudo = document.querySelector("#pseudo")
  if (pseudo.innerHTML==players[0]["nickname"]){
      pseudo.innerHTML=`${players[1]["nickname"]}`;
      pseudo.style.color=`${players[1]["color"]}`;
  } else {
      pseudo.innerHTML=`${players[0]["nickname"]}`;
      pseudo.style.color=`${players[0]["color"]}`;
  }
  lockJeu();
  if (pseudo.innerHTML == localStorage.getItem('nickname')){
    unlockJeu();
}

socket.on('place piece', function(room, locationPiece, piece_id, players){
  console.log(piece_id, "socket place ")
  //TODO: comprendre pourquoi la requete est effectué plusieurs foix 
  if (document.querySelector("header > .pion")){
    locationPiece_element = document.getElementById(piece_id)
    locationPiece_element.append(document.querySelector("header > .pion"));
    locationPiece_element.className+=" cursor_default";
    document.querySelector("#action").innerHTML="Choisis une pièce";
    if ( isWin(locationPiece) ){
      socket.emit('end game', room, "QUARTO!")
    } else if ( isEquality()){
      socket.emit('end game', room, "ÉGALITÉ!")
    }
  }

})

  
});

socket.on('start game', function(room, first_player){
  console.log("yiop")
  document.getElementById("loader").style.display = "none";
  mode = room["mode"]
  players = [
    {
      "color": "red",
      "nickname": room["users"][0][1]
    },
    {
      "color": "blue",
      "nickname": room["users"][1][1]
    }
  ]
  creation_pieces();
  fill_header(mode, first_player);
  nickname = localStorage.getItem('nickname')
  console.log(socket, "doubuy", first_player["nickname"]);
  animation(room, players);
  if (nickname == first_player["nickname"]){
    unlockJeu();
  }
});


socket.on("end game",function(room, message){
  document.querySelector("#jeu").innerHTML+=`<div id="quarto" class="centre">${message}</div>`;
  lockJeu();
  document.querySelector("#action").innerHTML=`\
      <div id="retour_menu">retour menu</div> \
  `;
  document.querySelector(`#retour_menu`).addEventListener('click',function(){
      retourMenu();
  });
});

function retourMenu(){
  window.location.pathname = "";
}





