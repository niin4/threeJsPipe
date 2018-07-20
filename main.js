// Set some camera attributes.
const VIEW_ANGLE = 45
const ASPECT = window.innerWidth / window.innerHeight
const WIDTH = 20
const HEIGHT = WIDTH / ASPECT
const NEAR = 1
const FAR = 100
const CAMERA_START = 10

// animation speed
const SPEED = 0.02

//3d model placeholder for collada loader
let model

// current page index
let currentScroll = 0

// "timer" for scroll and touch events
let ticking = false

// scroll and touch
let lastScroll
let updatedScroll
let touchStart
let touchEnd
let updatedTouch

// animal image position
let RIGHT, LEFT, DOWN, UP, MODEL

if (ASPECT > 1) {
    RIGHT = WIDTH / 8
    LEFT = -WIDTH / 8
    DOWN = -(HEIGHT / 8 / ASPECT)
    UP = (HEIGHT / 8 / ASPECT)
    MODEL = -2.7 / ASPECT
} else {
    RIGHT = 1
    LEFT = -1
    DOWN = -1 / ASPECT / 1.8
    UP = 1 / ASPECT / 1.8
    MODEL = -1.2 / ASPECT
}

let camera, controls, scene, renderer

// array for 3d items and models
const finalItems = []

//containers for text
const headerContainer = document.querySelector("#title")
const descContainer = document.querySelector("#desc")

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
        color: new THREE.Color("rgb(255, 0, 75)"),
        model: "./models/bird.dae"
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

const setText = (title, desc) => {
    headerContainer.innerHTML = title
    descContainer.innerHTML = desc
}

// check if webgl or webgl2 available, otherwise use canvas renderer
const webglAvailable = () => {
    try {
        const canvas = document.createElement("canvas");
        return !!
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl2") || canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl"));
    } catch (e) {
        return false
    }
}

const tweenObject = (object, target, id, display) => {
    new TWEEN.Tween(object.item.position).to({
        x: target.x,
        y: target.y,
        z: target.z
    }, 400)
        .onUpdate(() => {
            if (display) {
                finalItems[id].item.visible = true
            } else {
                finalItems[id].model.visible = false
            }
        })
        .onComplete(() => {
            if (!display) {
                finalItems[id].item.visible = false
            }
            if (display) {
                finalItems[id].model.visible = true
                setText(ANIMALS[id].title, ANIMALS[id].desc)
            }
        })
        .easing(TWEEN.Easing.Sinusoidal.InOut).start()
}

const zoom = (objectId) => {

    const backwards = new THREE.Vector3(ANIMALS[currentScroll].posX, ANIMALS[currentScroll].posY, -20)
    const forwards = new THREE.Vector3(ANIMALS[currentScroll].posX, ANIMALS[currentScroll].posY, 40)
    const present = new THREE.Vector3(ANIMALS[objectId].posX, ANIMALS[objectId].posY, 1)

    if (objectId !== currentScroll && objectId <= finalItems.length - 1 && objectId > currentScroll) {
        tweenObject(finalItems[currentScroll], backwards, currentScroll, false)
    }
    else if (objectId !== currentScroll && objectId >= 0 && objectId < currentScroll) {
        tweenObject(finalItems[currentScroll], forwards, currentScroll, false)
    }
    tweenObject(finalItems[objectId], present, objectId, true)
    currentScroll = objectId

}

const init = () => {
    // Get the DOM element to attach to
    const container =
        document.querySelector('#container');

    // Create a WebGL renderer, camera
    // and a scene
    renderer = webglAvailable() ? new THREE.WebGLRenderer({ alpha: true }) : new THREE.CanvasRenderer({ alpha: true })
    renderer.setClearColor(0x000000, 0)

    camera =
        new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            ASPECT,
            NEAR,
            FAR
        );

    // starting position for camera
    camera.position.z = CAMERA_START

    controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = false;
    controls.screenSpacePanning = true
    controls.minDistance =  CAMERA_START
    controls.maxDistance = FAR
    controls.maxPolarAngle = Math.PI / 2
    controls.minPolarAngle = 1.5
    controls.zoomSpeed = 0.4
    controls.rotateSpeed = 0.1
    controls.maxAzimuthAngle = 0.1
    controls.minAzimuthAngle = -0.1

    controls.addEventListener('change', render)

    // LOADING 3D
    const loadingManager = new THREE.LoadingManager(() => {
        ANIMALS.map((a, i) => {
            const object = new THREE.Object3D()
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
    })

    const loader = new THREE.ColladaLoader(loadingManager)

    // CONTROL BUTTONS
    const controlsContainer = document.querySelector("#controls")
    ANIMALS.map((animal, i) => {
        let div = document.createElement('div')
        div.className = 'controls__item'
        div.innerHTML = `<a class="controls__button" data-object=${i}>&diams;</a>`
        controlsContainer.appendChild(div)
    })

    const links = document.querySelectorAll('.controls__button')
    for (item of links) {
        item.addEventListener('click', event => {
            zoom(parseInt(event.target.dataset.object))
        })
    }



    // INITIALIZE SCENE
    scene = new THREE.Scene()
    scene.add(camera)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    // LIGHT
    const pointLight = new THREE.PointLight(0xFFFFFF)
    pointLight.position.x = 10
    pointLight.position.y = 50
    pointLight.position.z = 130
    scene.add(pointLight)

    // CREATE ANIMALS
    const boxGeometry = new THREE.BoxGeometry(1, 1, 0.00001)

    const createAnimal = animal => {
        const texture = new THREE.TextureLoader().load(animal.picture)

        const box = new THREE.Mesh(boxGeometry, [null, null, null, null, new THREE.MeshLambertMaterial(
            {
                color: animal.color,
                map: texture,
                opacity: 0.9,
                transparent: true
            }), null]
        );

        box.position.set(animal.posX, animal.posY, animal.location);
        box.scale.set(6, 6, 1);

        if (animal.model) {
            loader.load(animal.model, function (collada) {
                model = collada.scene;
                animal.model = model
            });
        }

        box.visible = false
        scene.add(box);
        finalItems.push({ item: box })
    }

    ANIMALS.map(animal => createAnimal(animal))

    finalItems[0].item.visible = true
    setText(ANIMALS[0].title, ANIMALS[0].desc)

    // ATTACH EVENT LISTENERS
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener("wheel", e => {
        if (!ticking) {
            updatedScroll = e.deltaY;
        }
    })
    container.addEventListener('touchstart', onTouchStart, false)
    container.addEventListener('touchend', onTouchEnd, false)

    render()
}

const onTouchStart = e => {
    if (!ticking) {
        touchStart = e.targetTouches[0].pageY
    }
}

const onTouchEnd = e => {
    if (!ticking) {
        touchEnd = e.changedTouches[0].pageY
        updatedTouch = touchEnd - touchStart
    }
}

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

const updateTouch = () => {
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
        setTimeout(function () { ticking = false }, 500)
    }
}

const updateScroll = () => {
    if (!ticking) {
        ticking = true
        if (updatedScroll > 0) {
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
        setTimeout(function () { ticking = false }, 1000)
    }
}

const rotate = animal => {
    animal.rotation.y += SPEED
}

const render = () => {
    renderer.render(scene, camera)
}

const animate = () => {
    TWEEN.update()
    requestAnimationFrame(animate)

    // rotate 3d model if current item has it
    if (finalItems[currentScroll]) {
        if (finalItems[currentScroll].model) {
            rotate(finalItems[currentScroll].model)
        }
    }

    // check if user did long touch
    if (updatedTouch > 150 || updatedTouch < -150 && !ticking) {
        updateTouch()
    }

    // check for scroll
    if (lastScroll !== updatedScroll && !ticking) {
        updateScroll()
    }

    renderer.render(scene, camera)
    controls.update()
}

init()
animate()
