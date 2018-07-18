
// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = window.innerWidth / window.innerHeight;
const WIDTH = 20;
const HEIGHT = WIDTH / ASPECT
const NEAR = 1;
const FAR = 100;
const SPEED = 0.01;
const models = []
let model
let currentScroll = 0;
let ticking = false;
let lastScroll
let updatedScroll

const RIGHT = WIDTH / 8;
const DOWN = -(HEIGHT / 8 / ASPECT)
const LEFT = -WIDTH / 8;
const UP = (HEIGHT / 8 / ASPECT)



const ANIMALS = [
    {
        posX: RIGHT,
        posY: DOWN,
        title: "Bear",
        desc: "Big and fluffy",
        position: 10,
        location: 1,
        picture: "bear.png",
        color: new THREE.Color("rgb(200, 0, 200)"),
        model: "./models/bear.dae"
    },
    {
        posX: LEFT,
        posY: UP,
        title: "Bird",
        desc: "Tweet",
        position: 45,
        location: 50,
        picture: "bird.png",
        model: "./models/bird.dae",
        color: new THREE.Color("rgb(255, 0, 75)")
    },
    {
        posX: RIGHT,
        posY: DOWN,
        title: "Fox",
        desc: "Rawr",
        picture: "marten.png",
        color: new THREE.Color("rgb(0, 200, 200)"),
        model: "./models/bear.dae",
        position: 70,
        location: 50
    },
    {
        posX: LEFT,
        posY: DOWN,
        title: "Chipmunk",
        desc: "Small but dangerous",
        picture: "squirrel.png",
        color: new THREE.Color("rgb(150, 200, 0)"),
        model: "./models/bird.dae",
        position: 100,
        location: 50
    }
]


var camera, clock, controls, scene, renderer, stats;
var finalItems = []

let itemDisplayRange

let currentImage

var headerContainer = document.querySelector("#title");
var descContainer = document.querySelector("#desc");

init()
animate()

function setText(title, desc) {
    headerContainer.innerHTML = title
    descContainer.innerHTML = desc
}

function fadeObject(object, value) {
    
}

function tweenCamera(object, target, id, display) {
    console.log(object)
    console.log(target)
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
        .onComplete(function() {
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

function checkItems() {
   /* var cameraPosition = controls.getPos();
    finalItems.map((item, i) => {
        if (i !== currentImage) {

            if (item.model) {
                item.model.visible = true
            }
            item.item.visible = true
            currentImage = i
            headerContainer.innerHTML = ANIMALS[i].title
            descContainer.innerHTML = ANIMALS[i].desc
        } else {
            if (item.model) {
                item.model.visible = false
            }
            item.item.visible = false
        }

    })*/
}

function zoom(objectId) {

    console.log(objectId)
    console.log(finalItems[objectId])
    console.log(ANIMALS[currentScroll])

    var position = controls.getPos();
    const backwards = new THREE.Vector3(ANIMALS[currentScroll].posX, ANIMALS[currentScroll].posY, -20);
    const forwards = new THREE.Vector3(ANIMALS[currentScroll].posX, ANIMALS[currentScroll].posY, 40);
    const present = new THREE.Vector3(ANIMALS[objectId].posX, ANIMALS[objectId].posY, 1);

    if (objectId !== currentScroll && objectId <= finalItems.length-1 && objectId > currentScroll) {
        tweenCamera(finalItems[currentScroll], backwards, currentScroll, false)
    }
    else if (objectId !== currentScroll && objectId >= 0 && objectId < currentScroll) {
        tweenCamera(finalItems[currentScroll], forwards, currentScroll, false)
    }

    tweenCamera(finalItems[objectId], present, objectId, true)
    currentScroll = objectId

}

function init() {

    // Get the DOM element to attach to
    const container =
        document.querySelector('#container');

    // Create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    
    camera =
        new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            ASPECT,
            NEAR,
            FAR
        );
        

        /*
    camera = new THREE.OrthographicCamera(
        WIDTH / -2,
        WIDTH / 2,
        HEIGHT / 2,
        HEIGHT / -2,
        NEAR,
        FAR
    )*/
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
    controls.zoomSpeed = 0.2;
    controls.rotateSpeed = 0.1;
    controls.maxAzimuthAngle = 0.1;
    controls.minAzimuthAngle = -0.1;

    controls.addEventListener('change', render);

    clock = new THREE.Clock();

    // loadingManager

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
            object.scale.set(0.3, 0.3, 0.3)
            if (i !== 0) {
                object.visible = false
            }

            object.position.set(0, DOWN * 1.5, 1)
            scene.add(object)
            finalItems[i].model = object
        })
    });

    // collada
    var loader = new THREE.ColladaLoader(loadingManager);

    // Set buttons
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

    scene = new THREE.Scene();

    // Add the camera to the scene.
    scene.add(camera);

    // Start the renderer.
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Attach the renderer-supplied
    // DOM element.
    container.appendChild(renderer.domElement);

    // LIGHT
    const pointLight =
        new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);
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

        box.scale.set(5, 5, 5);

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

    itemDisplayRange = FAR / items.length


    items.map((item, i) => {
        if (i === 0) {
            finalItems.push({ ...item, rangeMin: 1, rangeMax: itemDisplayRange })
        } else {
            finalItems.push({ ...item, rangeMin: finalItems[(i - 1)].rangeMax + 1, rangeMax: finalItems[(i - 1)].rangeMax + itemDisplayRange })
        }
    })

    finalItems[0].item.visible = true
    setText(ANIMALS[0].title, ANIMALS[0].desc)

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener("wheel", function (e) {
        if (!ticking) {
            updatedScroll = e.deltaY;
        }

    })
    render()
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
function updateScroll(scroll_pos) {
    if (!ticking) {
        ticking = true
    if (scroll_pos > 0) {
        console.log('current:' +currentScroll)
        if (currentScroll !== ANIMALS.length - 1) {
            console.log('scrolling down')
            zoom(currentScroll+1)
        }
    } else {
        if (currentScroll !== 0) {
            console.log('scrolling up')
            zoom(currentScroll-1)
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
    setTimeout(() => {
        checkItems()
    }, 100);
    renderer.render(scene, camera);
}


function animate() {
    TWEEN.update();
    requestAnimationFrame(animate);


    if (finalItems[currentScroll]) {
        if (finalItems[currentScroll].model) {
            rotate(finalItems[currentScroll].model)
        }
    }


    if (lastScroll !== updatedScroll && !ticking) {
        updateScroll(updatedScroll)
    }

    renderer.render(scene, camera);
    controls.update();
}

// Schedule the first frame.
