export const spin =({imageTobeAnimated}) =>{    
    console.log('module inside');
    imageTobeAnimated.css("transform", "rotate(360deg)");
    imageTobeAnimated.css("transition", "transform 2s");
    setTimeout(function () {
        imageTobeAnimated.css("transform", "rotate(0deg)");
        imageTobeAnimated.css("transition", "transform 2s");
    }, 3000);
}
export const pop =({imageTobeAnimated,currHeight,currWidth}) =>{
    console.log('module inside');
    imageTobeAnimated.css("height", `${currHeight + 7}%`);
    imageTobeAnimated.css("width", `${currWidth + 7}%`);
    imageTobeAnimated.css("transition", "width 2s,height 2s");
    setTimeout(function () {
        imageTobeAnimated.css("height", `${currHeight}%`);
        imageTobeAnimated.css("width", `${currWidth}%`);
        imageTobeAnimated.css("transition", "width 2s,height 2s");
    }, 3000);
}