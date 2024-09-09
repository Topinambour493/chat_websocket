let mode = document.getElementById("mode_jeu").innerHTML.split(" ")[1]

function animationLocal() {
    for (let piece = 0; piece < 16; piece++) {
        document.querySelector(`#p${piece}`).addEventListener('click', function () {
            if ((!document.querySelector("#piece-to-place > .pion")) && (document.querySelector(`#pieces #p${piece}`))) {
                document.querySelector("#action").innerHTML = "Place la pièce";
                lockPieces()
                unlockPlateau()
                document.querySelector("#piece-to-place").append(this.parentElement);
                this.className += " cursor_default";
                if (document.querySelector("#nickname").innerHTML === joueur1["nickname"]) {
                    document.querySelector("#nickname").innerHTML = `${joueur2["nickname"]}`;
                    document.querySelector("#nickname").style.color = `${joueur2["color"]}`;
                } else {
                    document.querySelector("#nickname").innerHTML = `${joueur1["nickname"]}`;
                    document.querySelector("#nickname").style.color = `${joueur1["color"]}`;
                }
            }
        });
    }

    for (let locationPiece = 0; locationPiece < 16; locationPiece++) {
        document.querySelector(`#locP${locationPiece}`).addEventListener('click', function () {
            if (document.querySelector("#piece-to-place > .pion") && getProperties_piece(locationPiece) == false) {
                document.querySelector(`#locP${locationPiece}`).append(document.querySelector("#piece-to-place > .pion"));
                document.querySelector(`#locP${locationPiece}`).className += " cursor_default";
                document.querySelector("#action").innerHTML = "Choisis une pièce";
                unlockPieces()
                lockPlateau()
                if (isWin(locationPiece, mode)) {
                    endGameLocal("QUARTO!");
                } else if (isEquality()) {
                    endGameLocal("ÉGALITÉ!");
                }
            }
        });
    }
}

function endGameLocal(message){
    lockPlateau();
    document.querySelector("#jeu").innerHTML+=`
        <div id="quarto" class="centre"> 
            <div>${message}</div> 
            <button class="button-19" id="revenge">revanche</button> 
            <a href="/" class="text-decoration-none button-19">retour menu</a> 
        </div>
    `;


    document.getElementById("revenge").addEventListener("click", function (){
        rejouer();
    })

}

function defineNameJoueursLocal() {
        joueur1["nickname"] = localStorage.getItem("nickname");
        joueur2["nickname"] = localStorage.getItem("nickname2")
}

function rejouer() {
    //supression des pièces déja créees
    for (let i = 0; i < 16; i++) {
        document.querySelector(`#p${i}`).parentElement.remove();
    }
    if (document.querySelector("#quarto")) {
        document.querySelector("#quarto").remove();
    }
    jouer();
}

function jouer() {
    creation_pieces();
    defineNameJoueursLocal()
    let first_player = joueurs[Math.floor(Math.random() * 2)];
    fill_header(first_player);
    unlockPieces();
    animationLocal();
}

jouer()