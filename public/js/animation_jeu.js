document.querySelector(`#mode_classique`).addEventListener('click',function(){
    mode="classique";
    defineNameJoueurs()
    jouer();
});

document.querySelector(`#mode_expert`).addEventListener('click',function(){
    mode="expert";
    defineNameJoueurs()
    jouer();
});

document.querySelector('#bouton_règles').addEventListener('click',function(e){
    document.querySelector("#règles_jeu").style.display="flex";
    e.stopPropagation();
});

document.querySelector('#règles_jeu').addEventListener(('mouseleave'),function(){
    document.querySelector("#règles_jeu").style.display="none";
});

document.querySelector('body').addEventListener(('click'),function(){
    document.querySelector("#règles_jeu").style.display="none";
});


function animation(room, players){
    for (let locationPiece=0;locationPiece<16;locationPiece++){
        document.querySelector(`#locP${locationPiece}`).addEventListener('click',function(){
            if (document.querySelector("header > .pion") && getProperties_piece(locationPiece)==false){
                console.log(locationPiece, this.id, "place makeinpiece")
                socket.emit("place piece", room, locationPiece, this.id, players);
            }
        });
    }

    for (let piece=0;piece<16;piece++){
        document.querySelector(`#p${piece}`).addEventListener('click',function(){
            if ( ( !document.querySelector("header > .pion") ) && ( document.querySelector(`#pieces #p${piece}`) ) ){
                socket.emit("choose piece", room,  this.id, players);
            }
        });
    }
}

function isEquality(){
    if ( ( document.querySelector("#pieces").children[0].childElementCount == 0 ) 
    && ( document.querySelector("#pieces").children[1].childElementCount == 0 ) ){
        return true;
    }
    return false;
}

//affiche la fin de partie et le menu pour en commencer ue nouvelle
function endGame(message){

    document.querySelector("#jeu").innerHTML+=`<div id="quarto" class="centre">${message}</div>`;
    lockJeu();
    document.querySelector("#action").innerHTML=`\
        <div id="mode_classique">rejouer mode classique</div> \
        <div id="mode_expert">rejouer mode expert</div> \
    `;
    document.querySelector(`#mode_classique`).addEventListener('click',function(){
        mode="classique";
        rejouer();
    });
    document.querySelector(`#mode_expert`).addEventListener('click',function(){
        mode="expert";
        rejouer();
    });
}


//plus possible de clickez dans la zone de jeu
function lockJeu(){
    document.querySelector("#jeu").style.pointerEvents="none";
}

// possible de clickez dans la zone de jeu
function unlockJeu(){
    document.querySelector("#jeu").style.pointerEvents="auto";
}

// renvoit les propriétés de la piece présente dans l'emplacement i, si il n'y pas de pièce, renvoit false
function getProperties_piece(i){
    let emplacement_piece=document.querySelector(`#locP${i}`);
    if (!emplacement_piece){return false;}
    if (emplacement_piece.innerHTML==""){return false;}
    let classPiece=emplacement_piece.querySelector(".pion > div").className.split(' ');
    classPiece.splice(4,(classPiece.length-4));
    return classPiece;
}

//renvoit false si il n'y a pas de points communs, sinon renvoit les points communs
function compare(points_communs,properties_piece){
    if (properties_piece==false){return false;}
    if (points_communs==false){return false;}
    for (let i=0;i<4;i++){
        if (properties_piece[i] != points_communs[i]){
            points_communs.splice(i,1,false);
        }
    }
    return points_communs;
}

// renvoit true si il y a au moins un point commun
function present(points_communs){
    if (points_communs==false){return false;}
    for (let i=0 ; i<points_communs.length ; i++){
        if (points_communs[i]!=false){
            return true;
        }
    }
    return false;
}

function showWinLine(a,b,c){
    for (let i = a ; i<b ; i+=c){
        document.querySelector(`#locP${i} > .pion > div`).style.border="0.7vmin solid red";
    }
}

//montre le carré de 2 par 2 avec i le coin haut-gauche en mettant des bordures rouges sur les pièces
function showWinSquare(i){
    document.querySelector(`#locP${i} > .pion > div`).style.border="0.7vmin solid red";
    document.querySelector(`#locP${i+1} > .pion > div`).style.border="0.7vmin solid red";
    document.querySelector(`#locP${i+4} > .pion > div`).style.border="0.7vmin solid red";
    document.querySelector(`#locP${i+5} > .pion > div`).style.border="0.7vmin solid red";
}

//regarde le carré de 2 par 2 avec i le coin haut-gauche
function lookWinSquare(i){
    let points_communs=getProperties_piece(i); 
    points_communs=compare(points_communs,getProperties_piece(i+1));
    points_communs=compare(points_communs,getProperties_piece(i+4));
    points_communs=compare(points_communs,getProperties_piece(i+5));
    if (present(points_communs)){showWinSquare(i);return true;}  
    return false;    

}

function lookWinLine(a,b,c){
    let points_communs=getProperties_piece(a);
    for (let i = a+c ; ((i<b) && present(points_communs)) ; i+=c){
        points_communs=compare(points_communs,getProperties_piece(i));
    }
    if (present(points_communs)){showWinLine(a,b,c);return true;}  
    return false;
}

function isWinSquares(locP){
    let win;

    //regarde le carré avec locP le coin haut-gauche
    if ( (locP%4 < 3) && (Math.floor(locP/4) < 3) ){
        win=lookWinSquare(locP);
        if (win){return true;}
    }

    //regarde le carré avec locP le coin haut-droit
    if ( (locP%4 > 0) && (Math.floor(locP/4) < 3) ){
        win=lookWinSquare(locP-1);
        if (win){return true;}
    }

    //regarde le carré avec locP le coin bas-gauche
    if ( (locP%4 < 3) && (Math.floor(locP/4) > 0) ){
        win=lookWinSquare(locP-4);
        if (win){return true;}
    }

    //regarde le carré avec locP le coin bas-droite
    if ( (locP%4 > 0) && (Math.floor(locP/4) < 3) ){
        win=lookWinSquare(locP-5);
        if (win){return true;}
    }
} 

function isWinLines(locP){
    //regarde sur la rangée horizontale
    let r=Math.floor(locP/4)*4;
    let win=lookWinLine(r,(r+4),1);
    if (win){return true;}

    // regarde sur la rangée verticale
    win=lookWinLine((locP%4),16,4);
    if (win){return true;}

    if (locP%5==0){
        //regarde sur la diagonale ↘
        win=lookWinLine(0,16,5);
        if (win){return true;}

    } else if (locP%3==0){
        // regarde sur la diagonale ↙
        win=lookWinLine(3,13,3);
        if (win){return true;}
    }
    return false;
}

function isWin(locP){
    if ( isWinLines(locP) ){
        return true;}
    if (mode=="expert"){
        if ( isWinSquares(locP) ){return true;}
    }
    return false;
}

function defineNameJoueurs(room){
    console.log(room)
    joueur1["pseudo"]=pseudoJ1=room["users"][0][1];
    joueur2["pseudo"]=pseudoJ2=room["users"][1][1]; 
    console.log(joueur2["pseudo"], joueur1["pseudo"])
}