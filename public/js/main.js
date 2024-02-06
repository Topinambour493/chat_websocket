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