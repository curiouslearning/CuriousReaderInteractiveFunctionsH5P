function doBounce(element, times, distance, speed) {
    for(var i = 0; i < times; i++) {
        element.animate({marginTop: '-='+distance},speed)
            .animate({marginTop: '+='+distance},speed);
    }        
}
function doJiggle(imageTobeAnimated,interval = 100){
    setTimeout(() => {   
        imageTobeAnimated.css('transform', 'translate(1px, 1px) rotate(0deg)');
    }, interval * 0);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(-1px, -2px) rotate(-1deg)');
    }, interval * 1);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(-3px, 0px) rotate(1deg)');
    }, interval * 2);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(3px, 2px) rotate(0deg)');
    }, interval * 3);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(1px, -1px) rotate(1deg)');
    }, interval * 4);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(-1px, 2px) rotate(-1deg)');
    }, interval * 5);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(-3px, 1px) rotate(0deg)');
    }, interval * 6);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(3px, 1px) rotate(-1deg)');
    }, interval * 7);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(-1px, -1px) rotate(1deg)');
    }, interval * 8);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(1px, 2px) rotate(0deg)');
    }, interval * 9);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'translate(1px, -2px) rotate(-1deg)');
    }, interval * 10);
}
function doPulsing(imageTobeAnimated,interval = 100){
    console.log('i am pulsing');
     setTimeout(() => {   
        imageTobeAnimated.css('transform', 'scale(1, 1)');
    }, interval * 0);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
    }, interval * 1);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1, 1)');
    }, interval * 2);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
    }, interval * 3);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1, 1)');
    }, interval * 4);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
    }, interval * 5);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1, 1)');
    }, interval * 6);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
    }, interval * 7);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1, 1)');
    }, interval * 8);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
    }, interval * 9);
    setTimeout(() => {
        imageTobeAnimated.css('transform', 'scale(1, 1)');
    }, interval * 10);
}

export const spin =({imageTobeAnimated}) =>{     
    imageTobeAnimated.css("transform", "rotate(360deg)");
    imageTobeAnimated.css("transition", "transform 2s");
    setTimeout(function () {
        imageTobeAnimated.css("transform", "rotate(0deg)");
        imageTobeAnimated.css("transition", "transform 2s");
    }, 3000);
}
export const flip =({imageTobeAnimated}) =>{     
    imageTobeAnimated.css("transform", "rotateY(360deg)");
    imageTobeAnimated.css("transition", "transform 2s");
    setTimeout(function () {
        imageTobeAnimated.css("transform", "rotateY(0deg)");
        imageTobeAnimated.css("transition", "transform 2s");
    }, 3000);
}
export const pop =({imageTobeAnimated}) =>{ 
    imageTobeAnimated.css("transform", "scale(1.3)");
    imageTobeAnimated.css("transition", "transform 2s");
    setTimeout(function () {
        imageTobeAnimated.css("transform", "scale(1)");
        imageTobeAnimated.css("transition", "transform 2s");
    }, 3000);
}

export const bounce =({imageTobeAnimated}) =>{ 
      doBounce(imageTobeAnimated, 5, '15px', 300); 
}
export const jiggle =({imageTobeAnimated}) =>{ 
    doJiggle(imageTobeAnimated);
}
export const pulse =({imageTobeAnimated}) =>{ 
   doPulsing(imageTobeAnimated);
}
export const glow =({imageTobeAnimated, durationTime, glowColor}) =>{ 
    if(durationTime==undefined || durationTime == NaN){
        durationTime = 600;
    }else{
        durationTime = durationTime * 1000;
    }
    imageTobeAnimated.css("box-shadow", "0 0 20px 20px" + glowColor);
    imageTobeAnimated.css("transition", "border 0.3s linear, box-shadow 0.3s linear");
    setTimeout(function () {
        imageTobeAnimated.css("box-shadow", "0 0 20px 20px transparent");
        imageTobeAnimated.css("transition", "border 1s linear, box-shadow 1s linear");
    }, durationTime);
}
export const backgroundFade =({imageTobeAnimated,parent}) =>{ 
 parent.css('opacity', '0.4');
    parent.css("transition", "opacity 2s");
     setTimeout(function () {
        parent.css('opacity', '1');
        parent.css("transition", "opacity 2s");
        imageTobeAnimated.addClass(' element');
     },3000);
}