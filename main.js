
// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = window.innerWidth / window.innerHeight;
const WIDTH = 20;
const HEIGHT = WIDTH / ASPECT
const NEAR = 1;
const FAR = 100;

// animation speed
const SPEED = 0.01;
const models = []
let model

// current page index
let currentScroll = 0;

// "timer" for scroll and touch events
let ticking = false;

// scroll and touch
let lastScroll
let updatedScroll
let touchStart
let touchEnd
let updatedTouch

// animal image position
let RIGHT, LEFT, DOWN, UP, MODEL;

if (ASPECT > 1) {
    RIGHT = WIDTH / 8
    LEFT = -WIDTH / 8
    DOWN = -(HEIGHT / 8 / ASPECT)
    UP = (HEIGHT / 8 / ASPECT)
    MODEL = -2.7/ ASPECT
} else {
    RIGHT = 1
    LEFT = -1
    DOWN = -1/ASPECT/1.8
    UP = 1/ASPECT/1.8
    MODEL = -1.2 / ASPECT
}

let  camera, controls, scene, renderer;
const finalItems = []

const headerContainer = document.querySelector("#title");
const descContainer = document.querySelector("#desc");

// page data
const ANIMALS = [
    {
        location: 1,
        posX: RIGHT,
        posY: DOWN,
        title: "Bear",
        desc: "Big and fluffy",
        picture: "bear.png",
        color: new THREE.Color("rgb(200, 0, 200)"),
        model: "./models/bear.dae"
    },
    {
        location: 40,
        posX: LEFT,
        posY: UP,
        title: "Bird",
        desc: "Tweet",
        picture: "bird.png",
        model: "./models/bird.dae",
        color: new THREE.Color("rgb(255, 0, 75)")
    },
    {
        location: 40,
        posX: RIGHT,
        posY: DOWN,
        title: "Fox",
        desc: "Rawr",
        picture: "marten.png",
        color: new THREE.Color("rgb(0, 200, 200)"),
        model: "./models/bear.dae"
    },
    {
        location: 40,
        posX: LEFT,
        posY: DOWN,
        title: "Chipmunk",
        desc: "Small but dangerous",
        picture: "squirrel.png",
        color: new THREE.Color("rgb(150, 200, 0)"),
        model: "./models/bear.dae"
    }
]

function setText(title, desc) {
    headerContainer.innerHTML = title
    descContainer.innerHTML = desc
}

function webglAvailable() {
    try {
        var canvas = document.createElement("canvas");
        return !!
            window.WebGLRenderingContext && 
            (canvas.getContext("webgl2") || canvas.getContext("webgl") || 
                canvas.getContext("experimental-webgl"));
    } catch(e) { 
        return false;
    } 
}

function tweenObject(object, target, id, display) {
    new TWEEN.Tween(object.item.position).to({
        x: target.x,
        y: target.y,
        z: target.z
    }, 400)
        .onUpdate(function () {
            if (display) {
                finalItems[id].item.visible = true
            } else {
                finalItems[id].model.visible = false
            }
        })
        .onComplete(function () {
            if (!display) {
                finalItems[id].item.visible = false
            }
            if (display) {
                finalItems[id].model.visible = true
                setText(ANIMALS[id].title, ANIMALS[id].desc)
            }
        })
        .easing(TWEEN.Easing.Sinusoidal.InOut).start();
}

function zoom(objectId) {

    const backwards = new THREE.Vector3(ANIMALS[currentScroll].posX, ANIMALS[currentScroll].posY, -20);
    const forwards = new THREE.Vector3(ANIMALS[currentScroll].posX, ANIMALS[currentScroll].posY, 40);
    const present = new THREE.Vector3(ANIMALS[objectId].posX, ANIMALS[objectId].posY, 1);

    if (objectId !== currentScroll && objectId <= finalItems.length - 1 && objectId > currentScroll) {
        tweenObject(finalItems[currentScroll], backwards, currentScroll, false)
    }
    else if (objectId !== currentScroll && objectId >= 0 && objectId < currentScroll) {
        tweenObject(finalItems[currentScroll], forwards, currentScroll, false)
    }
    tweenObject(finalItems[objectId], present, objectId, true)
    currentScroll = objectId

}

function init() {

    // Get the DOM element to attach to
    const container =
        document.querySelector('#container');

    // Create a WebGL renderer, camera
    // and a scene
    renderer = webglAvailable() ? new THREE.WebGLRenderer({ alpha: true }) : new THREE.CanvasRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);

    camera =
        new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            ASPECT,
            NEAR,
            FAR
        );

    // starting position for camera
    camera.position.z = 10;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;
    controls.screenSpacePanning = true;
    controls.minDistance = 10;
    controls.maxDistance = 100
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = 1.5;
    controls.zoomSpeed = 0.4;
    controls.rotateSpeed = 0.1;
    controls.maxAzimuthAngle = 0.1;
    controls.minAzimuthAngle = -0.1;

    controls.addEventListener('change', render);

    // LOADING 3D
    var loadingManager = new THREE.LoadingManager(function () {
        ANIMALS.map((a, i) => {
            var object = new THREE.Object3D()
            object.add(a.model)
            let material = new THREE.MeshStandardMaterial({
                color: 0x000000,
                metalness: 0.1,
                roughness: 0.5
            })

            object.children[0].children.map(child => {
                child.material = material
            })
            object.scale.set(0.2, 0.2, 0.2)
            if (i !== 0) {
                object.visible = false
            }

            object.position.set(0, MODEL, 3)
            scene.add(object)
            finalItems[i].model = object
        })
    });

    var loader = new THREE.ColladaLoader(loadingManager);

    // CONTROL BUTTONS
    const controlsContainer = document.querySelector("#controls")
    ANIMALS.map((animal, i) => {
        let div = document.createElement('div')
        div.className = 'controls__item'
        div.innerHTML = `<a class="controls__button" data-object=${i} data-zoom=${animal.position}>	&diams;</a>`
        controlsContainer.appendChild(div)
    })

    var links = document.querySelectorAll('.controls__button');
    for (item of links) {
        item.addEventListener('click', function (event) {
            zoom(parseInt(event.target.dataset.object))
        })
    }



    // INITIALIZE SCENE
    scene = new THREE.Scene();
    scene.add(camera);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // LIGHT
    const pointLight =
        new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    scene.add(pointLight);


    // CREATE ANIMALS
    const boxGeometry = new THREE.BoxGeometry(1, 1, 0.00001);
    var items = []


    function createAnimal(animal) {
        // BEAR
        var texture = new THREE.TextureLoader().load(animal.picture);

        const box = new THREE.Mesh(boxGeometry, [null, null, null, null, new THREE.MeshLambertMaterial(
            {
                color: animal.color,
                map: texture,
                opacity: 0.9,
                transparent: true
            }), {
                color: animal.color
            }]
        );

        box.position.set(animal.posX, animal.posY, animal.location);
        box.scale.set(6, 6, 0.01);

        if (animal.model) {
            loader.load(animal.model, function (collada) {
                model = collada.scene;
                animal.model = model
            });
        }

        box.visible = false
        scene.add(box);
        items.push({ item: box })
    }

    ANIMALS.map(animal => createAnimal(animal))


    // INIT FINAL ITEMS ARRAY, ADD EXTRA INFO IF NEEDED
    items.map((item, i) => {
        if (i === 0) {
            finalItems.push({ ...item})
        } else {
            finalItems.push({ ...item})
        }
    })

    finalItems[0].item.visible = true
    setText(ANIMALS[0].title, ANIMALS[0].desc)


    // ATTACH EVENT LISTENERS
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener("wheel", function (e) {
        if (!ticking) {
            updatedScroll = e.deltaY;
        }
    })
    container.addEventListener('touchstart', onTouchStart, false);
    container.addEventListener('touchend', onTouchEnd, false);

    render()
}

function onTouchStart(e) {
    if (!ticking) {
        touchStart = e.targetTouches[0].pageY
    }
}

function onTouchEnd(e) {
    if (!ticking) {
        touchEnd = e.changedTouches[0].pageY
        updatedTouch = touchEnd - touchStart
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function updateTouch () {
    if (!ticking) {
        ticking = true
        if (updatedTouch < 0) {
            if (currentScroll !== ANIMALS.length - 1) {
                console.log('scrolling up')
                zoom(currentScroll + 1)
            }
        } else {
            if (currentScroll !== 0) {
                console.log('scrolling down')
                zoom(currentScroll - 1)
            }
        }
        updatedTouch = 0
    }
    setTimeout(function () { ticking = false }, 500)
}
function updateScroll(scroll_pos) {
    if (!ticking) {
        ticking = true
        if (scroll_pos > 0) {
            console.log('current:' + currentScroll)
            if (currentScroll !== ANIMALS.length - 1) {
                console.log('scrolling down')
                zoom(currentScroll + 1)
            }
        } else {
            if (currentScroll !== 0) {
                console.log('scrolling up')
                zoom(currentScroll - 1)
            }
        }
        lastScroll = updatedScroll
    }

    setTimeout(function () { ticking = false }, 1000)
}

function rotate(animal) {
    animal.rotation.y += SPEED * 2;
}

function render() {
    renderer.render(scene, camera);
}


function animate() {
    TWEEN.update();
    requestAnimationFrame(animate);

    // rotate 3d model if current item has it
    if (finalItems[currentScroll]) {
        if (finalItems[currentScroll].model) {
            rotate(finalItems[currentScroll].model)
        }
    }

    // check if user did long touch
    if (updatedTouch > 150 || updatedTouch < -150 && !ticking) {
        console.log('hi')
        updateTouch()
    }

    // check for scroll
    if (lastScroll !== updatedScroll && !ticking) {
        updateScroll(updatedScroll)
    }

    renderer.render(scene, camera);
    controls.update();
}


init()
animate()
