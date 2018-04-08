var mouseDown = false;

$('document').ready(function(){

    $('.ctrl-zoom-in').on('mousedown', zoomInHandler);

    $('.ctrl-zoom-out').on('mousedown', zoomOutHandler);

    $('.ctrl-rotate-left').on('mousedown', rotateLeftHandler);

    $('.ctrl-rotate-right').on('mousedown', rotateRightHandler);


});

var zoomInHandler = function(e){

    mouseDown = true;
    ambiarc.zoomCamera(0.2, 0.5);
};


var zoomOutHandler = function(e){

    mouseDown = true;
    ambiarc.zoomCamera(-0.2, 0.5);
};


var zooming = function(zoomValue){
    if(mouseDown == true){
        ambiarc.zoomCamera(zoomValue, 0.5);
        window.requestAnimationFrame(zooming);
    }
};


var rotateLeftHandler = function(){
    mouseDown = true;
    ambiarc.rotateCamera(30, 0.5);
};


var rotateRightHandler = function(){
    mouseDown = true;
    ambiarc.rotateCamera(-30, 0.5);
}