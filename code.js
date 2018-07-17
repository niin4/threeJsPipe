"use strict";

function loadImage(url, callback) {
    var image = new Image();
    image.src = url;
    image.onload = callback;
    return image;
}

function loadImages(urls, callback) {
    var images = [];
    var imagesToLoad = urls.length;

    // Called each time an image finished
    // loading.
    var onImageLoad = function () {
        --imagesToLoad;
        // If all the images are loaded call the callback.
        if (imagesToLoad == 0) {
            callback(images);
        }
    };

    for (var ii = 0; ii < imagesToLoad; ++ii) {
        var image = loadImage(urls[ii], onImageLoad);
        images.push(image);
    }
}

function main() {
    loadImages([
        "bear.png",
        "bird.png"
    ], render);
}

function render(images) {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
    gl.useProgram(program);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.enable (gl.BLEND); 
    //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    //gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, images[0].width, images[0].height);

    // provide texture coordinates for the rectangle.
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
    ]), gl.STATIC_DRAW);

    // create 2 textures
    var textures = [];
    for (var ii = 0; ii < images.length; ++ii) {

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

        // add the texture to the array of textures.
        textures.push(texture);
    }

    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    // lookup the sampler locations.
    var u_image0Location = gl.getUniformLocation(program, "u_image0");
    var u_image1Location = gl.getUniformLocation(program, "u_image1");

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);



    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset)

    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset)

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set which texture units to render with.
    gl.uniform1i(u_image0Location, 0);  // texture unit 0
    gl.uniform1i(u_image1Location, 1);  // texture unit 1

    

    // Set each texture unit to use a particular texture.
    //gl.colorMask(true, false, false, true);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);


    
    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

main();
