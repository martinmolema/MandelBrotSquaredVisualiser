/***
 * @summary A simple example how to use the canvas in combination with createImageData to cycle colors quickly
 * @Author: Martin Molema <martin@molema.org>
 * @created: 2020-05-14
 * @File: /example/index.js
 * @copyright 2020
 */

window.onload = InitPage;

const MAX_ITERATIONS = 500;
const maxRangeRGB = 16581375; // 255 * 255 * 255, 3 bytes colorcode */

const RGB_FILTER_R = (255 << 16);  // left most byte  : 1111 1111 0000 0000 0000 0000
const RGB_FILTER_G = (255 << 8);   // middle byte     : 0000 0000 1111 1111 0000 0000
const RGB_FILTER_B = (255);        // right most byte : 0000 0000 0000 0000 1111 1111

/**
 * Calculates one color using an iteration-count and an offset
 * @param iterations a number between 0 to MAX_ITERATIONS
 * @param offset a number between 0-100 indicating the percentage the palet colors should be shifted
 * @returns {{RGB_G: number, RGB_R: number, RGB_B: number}}
 */
function createColorFromIterations(iterations){

    let ratio       =  iterations / MAX_ITERATIONS;
    let ratedRatio  = Math.ceil(ratio * maxRangeRGB); // integer needed!

    // use the &-operator for bit-wise AND operation
    // use >>-operator for shifting; the parameter is the number of bits that need to shift.
    let RGB_R = (ratedRatio & RGB_FILTER_R) >> 16;
    let RGB_G = (ratedRatio & RGB_FILTER_G) >> 8;
    let RGB_B = (ratedRatio & RGB_FILTER_B);

    // create an anonymous object (the object property-names are generated from the variable-names
    return {RGB_R, RGB_G, RGB_B};
}

/**
 * Generates random numbers for each pixel on the canvas
 * @param iterations an array to be filled
 * @param width the width of the canvas
 * @param height the height of the canvas
 */
function initRandomIterations(iterations, width, height){
  for(let x=0;x<width;x++){
      for (let y=0;y<height;y++){
          let index = y*width + x;
          //iterations[index] = Math.ceil(Math.random() * width) % MAX_ITERATIONS;
          iterations[index] = Math.ceil(((x+y)/20) % MAX_ITERATIONS);
      }
  }
}

function createPalette(){
    // create the array for the palette
    palette = new Array(MAX_ITERATIONS + 1);
    for (var j = 0;j <= MAX_ITERATIONS; j++) {
        palette[j]= createColorFromIterations(j);
    }
}

//-----------------------------------------------------------------
//------------------------------- MAIN ----------------------------
//-----------------------------------------------------------------

/**
 * This function is used to build the page upon Window load
 */
function InitPage(){
    var canvas  = document.getElementById("mycanvas");
    var w = canvas.width;
    var h = canvas.height;

    var iterations = Array(w*h);
    initRandomIterations(iterations, w, h);

    var palette = createPalette();
    draw(canvas, iterations, 0);

    var slider = document.getElementById("paletslider");
    slider.addEventListener("input", (evt)=>{
        offset = parseInt( slider.value);
        draw(canvas, iterations, offset);
    });
}

/**
 * This function does the actual drawing of the image. It is not done by calling drawing functions
 * but by filling an array with pixels that is translated into a structure that the canvas can directly display
 * @param canvas
 * @param iterations
 * @param offset
 */
function draw(canvas, iterations, offset){
    var w = canvas.width;
    var h = canvas.height;
    var context = canvas.getContext('2d');
    var completeImage = context.createImageData(w, h);
    var imageRGBValues = completeImage.data;


    for (var x=0; x < w; x++){
        for(var y=0; y < h; y++){
            // calculate the index in the iterations array and get its value
            var index = (y * w) + x;
            var iter = iterations[index];

            // simply use an index for the palette instead of calling a function each time.
            const realOffset = Math.ceil((this.offset / 100.0) * this.maxIterations);
            var paletteIndex = (realOffset + iter) % MAX_ITERATIONS;
            var color = palette[paletteIndex]

            // calculate the index in the ImageData array
            let array_index = (y * w * 4 + x * 4);

            // assign the RGB values
            imageRGBValues[array_index + 0] = color.RGB_R; // red
            imageRGBValues[array_index + 1] = color.RGB_G; // green
            imageRGBValues[array_index + 2] = color.RGB_B; // blue

            // let's play with the opacity to create funny effects.
            imageRGBValues[array_index + 3] = 200; // 255 = full opacity
        }
    }

    // put the array on the canvas. this will clear previous images on the canvas so
    // no need to clear first
    context.putImageData(
        completeImage,  // array
        0, 0,
        0, 0,
        w, h
    );

}

