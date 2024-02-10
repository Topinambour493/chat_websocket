var joueur1 = {"color": "red", "nickname": "Joueur 1"};
var joueur2 = {"color": "blue", "nickname": "Joueur 2"};
var joueurs = [joueur1, joueur2];

// création des emplacements du plateau
table = document.querySelector("table")
locationPiece = 0;
for (let a = 0; a < 4; a++) {
    tr = document.createElement("tr")
    for (let b = 0; b < 4; b++) {
        tr.innerHTML += `<th><div id='locP${locationPiece}' class='emplacement_piece centre'></div></th>`;
        locationPiece++;
    }
    table.appendChild(tr);
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

function creation_pieces() {
    var colors = ["blanc", "noir"];
    var formes = ["carre", "rond"];
    var tailles = ["grand", "petit"];
    var trous = ["plein", "trou"];
    var piece;
    var pieces = document.getElementById("pieces")

    //création des pièces
    piece = 0;
    colors.forEach(color => {
        formes.forEach(forme => {
            tailles.forEach(taille => {
                trous.forEach(trou => {
                    pieces.querySelector(`#pieces_${color}`).innerHTML += `\ 
                        <div class="pion centre">\
                            <div id='p${piece}' class='${taille} ${forme} ${color} ${trou}'></div>\
                        </div>\
                    `;
                    if (trou === "trou") {
                        document.querySelector(`#p${piece}`).className += ' centre';
                        document.querySelector(`#p${piece}`).innerHTML = '<div class="trou_rond"></div>';
                    }
                    piece += 1;
                });
            });
        });
    });
}

function fill_header(first_player) {
    document.querySelector("#centre_header").innerHTML = `\
        <div class="centre"> \ 
            <div id="nickname">${first_player["nickname"]}</div> \
            <div id="action">Choisis une pièce</div> \
        </div> \
        <div id="piece-to-place"></div> \
    `;
    document.querySelector("#nickname").style.color = `${first_player["color"]}`;
}



