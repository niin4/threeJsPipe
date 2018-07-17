"use strict";
function main() {
    const m4 = twgl.m4;
    twgl.setDefaults({ attribPrefix: "a_" });
    const gl = twgl.getContext(document.getElementById("c"));
    console.log("using: " + gl.getParameter(gl.VERSION));  // eslint-disable-line
    if (!twgl.isWebGL2(gl)) {
        alert("Sorry, this example requires WebGL 2.0");  // eslint-disable-line
        return;
    }
    const size = 64;
    const sizeMinus1 = size - 1;
    const original = new Uint8Array(size * size * size * 4);
    const inverse = new Uint8Array(size * size * size * 4);
    const bw = new Uint8Array(size * size * size * 4);
    let offset = 0;
    for (let z = 0; z < size; ++z) {
        const zv = z * 255 / sizeMinus1;
        for (let y = 0; y < size; ++y) {
            const yv = y * 255 / sizeMinus1;
            for (let x = 0; x < size; ++x) {
                const xv = x * 255 / sizeMinus1;
                original[offset + 0] = xv;
                original[offset + 1] = yv;
                original[offset + 2] = zv;
                original[offset + 3] = 255;
                inverse[offset + 0] = 255 - xv;
                inverse[offset + 1] = 255 - yv;
                inverse[offset + 2] = 255 - zv;
                inverse[offset + 3] = 255;
                const m = Math.max(xv, yv, zv);
                bw[offset + 0] = m;
                bw[offset + 1] = m;
                bw[offset + 2] = m;
                bw[offset + 3] = 255;
                offset += 4;
            }
        }
    }
    let images;
    const textures = twgl.createTextures(gl, {
        image: {
            src: "bear.png",
            flipY: true,
            colorspaceConversion: gl.NONE,
        },
        original: {
            target: gl.TEXTURE_3D,
            src: original,
            gwrap: gl.CLAMP_TO_EDGE,
        },
        blackAndWhite: {
            target: gl.TEXTURE_3D,
            src: bw,
        },
        inverse: {
            target: gl.TEXTURE_3D,
            src: inverse,
        }
    }, (err, textures, imgs) => {
        images = imgs;
        requestAnimationFrame(render);  // eslint-disable-line
    });

    const vs = `
  #version 300 es
  in vec4 a_position;
  in vec2 a_texcoord;
  out vec2 v_texcoord;
  uniform mat4 u_worldViewProjection;
  void main() {
    v_texcoord = a_texcoord;
    gl_Position = u_worldViewProjection * a_position;
  }
  `;
    const fs = `
  #version 300 es
  precision mediump float;
  precision mediump sampler3D;
  in vec2 v_texcoord;
  uniform sampler2D u_image;
  uniform sampler3D u_colorCube1;
  uniform sampler3D u_colorCube2;
  uniform float u_mixAmount;
  out vec4 color;
  void main() {
    vec3 imageColor = texture(u_image, v_texcoord).rgb;
    vec3 cubeSize1 = vec3(textureSize(u_colorCube1, 0));
    vec4 color1 = texture(u_colorCube1, (imageColor * (cubeSize1 - 1.) + 0.5) / cubeSize1);
    vec3 cubeSize2 = vec3(textureSize(u_colorCube2, 0));
    vec4 color2 = texture(u_colorCube2, (imageColor * (cubeSize2 - 1.) + 0.5) / cubeSize2);
    color = mix(color1, color2, u_mixAmount);
  }
    `;
    const colorAdjustments = [
        "original",
        "blackAndWhite",
        "inverse",
        "sepia",
        "blacklightPoster",
        "orangeToGreen",
        "posterize",
        "sunset",
    ];
    const nameNode = document.createTextNode("waiting for textures");
    document.querySelector("#name").appendChild(nameNode);
    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    const bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);
    const uniforms = {
        u_image: textures.image,
        u_colorCube1: textures.original,
        u_colorCube2: textures.original,
        u_worldViewProjection: m4.identity(),
        u_mixAmount: 0,
    };
    function setTexture(uniform, colorNdx) {
        const textureName = colorAdjustments[colorNdx % colorAdjustments.length];
        uniforms[uniform] = textures[textureName];
    }
    function easeInOutSine(pos) {
        return (-0.5 * (Math.cos(Math.PI * pos) - 1));
    }
    let colorNdx = 0;
    let timer = 0;
    let then = 0;
    const duration = 3;
    let oldMix = -1;
    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;
        let draw = false;
        timer -= deltaTime;
        if (timer < 0) {
            colorNdx = (colorNdx + 1) % colorAdjustments.length;
            setTexture("u_colorCube1", colorNdx);
            setTexture("u_colorCube2", colorNdx + 1);
            nameNode.nodeValue = colorAdjustments[colorNdx];
            timer = duration;
            draw = true;
        }
        uniforms.u_mixAmount = 1 - easeInOutSine(Math.min(1, Math.max(0, timer)));
        if (uniforms.u_mixAmount !== oldMix) {
            oldMix = uniforms.u_mixAmount;
            draw = true;
        }
        draw |= twgl.resizeCanvasToDisplaySize(gl.canvas);
        if (draw) {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            const img = images.image;
            const imgAspect = img.width / img.height;
            const screenAspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const aspect = 1 / (screenAspect / imgAspect);
            const scale = aspect < 1 ? 1 : 1 / aspect;
            m4.ortho(-scale, scale, scale * -aspect, scale * aspect, -1, 1, uniforms.u_worldViewProjection);
            gl.useProgram(programInfo.program);
            twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
            twgl.setUniforms(programInfo, uniforms);
            twgl.drawBufferInfo(gl, bufferInfo);
        }
        requestAnimationFrame(render);
    }
}
main();