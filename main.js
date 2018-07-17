
// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = window.innerWidth / window.innerHeight;
const NEAR = 1;
const FAR = 100;

const ANIMALS = [
    { title: "Bear", desc: "Big and fluffy"},
    { title: "Bird", desc: "Tweet"},
    { title: "Marten", desc: "Rawr"},
    { title: "Chipmunk", desc: "Small but dangerous"}
]


var camera, controls, scene, renderer, stats;
var finalItems = []

let itemDisplayRange

let currentImage

var headerContainer = document.querySelector("#title");
var descContainer = document.querySelector("#desc");

init()
animate()

function checkItems() {
    var cameraPosition = controls.getPos();
    console.log(cameraPosition)
    finalItems.map((item, i) => {
        if (i !== currentImage) {
            
            if (cameraPosition.z >= item.rangeMin && cameraPosition.z <= item.rangeMax) {
                item.item.visible = true
                currentImage = i
                headerContainer.innerHTML = ANIMALS[i].title
                descContainer.innerHTML = ANIMALS[i].desc
            } else {
                item.item.visible = false
            }
        }
    })
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
    camera.position.z = 70;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 100
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = 1.5;
    controls.zoomSpeed = 0.2;
    controls.rotateSpeed = 0.1;
    controls.maxAzimuthAngle = 0.1;
    controls.minAzimuthAngle = -0.1;

    controls.addEventListener('change', render);

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
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    var items = []

      // CHIPMUNK
      var squirrelTexture = new THREE.TextureLoader().load("squirrel.png");
      var squirrelColor = new THREE.Color("rgb(150, 200, 0)");
  
      const squirrelBox = new THREE.Mesh(boxGeometry, [null, null, null, null, new THREE.MeshLambertMaterial(
          {
              color: squirrelColor,
              map: squirrelTexture,
              opacity: 0.9,
              transparent: true
          }), null]
      );


   squirrelBox.position.set(-10 / ASPECT, 0, 80);
   squirrelBox.scale.set(15, 15, 15);
    scene.add(squirrelBox);
    items.push({ item: squirrelBox })

    // BIRD
    var birdTexture = new THREE.TextureLoader().load("bird.png");
    var birdColor = new THREE.Color("rgb(255, 0, 75)");

    // MARTEN
    var martenTexture = new THREE.TextureLoader().load("marten.png");
    var martenColor = new THREE.Color("rgb(0, 200, 200)");

    const martenBox = new THREE.Mesh(boxGeometry, [null, null, null, null, new THREE.MeshLambertMaterial(
        {
            color: martenColor,
            map: martenTexture,
            opacity: 0.9,
            transparent: true
        }), null]
    );

    martenBox.position.set(5 / ASPECT, 0, 50);
    martenBox.scale.set(12, 12, 12);
    scene.add(martenBox);
    items.push({ item: martenBox })

    // BIRD
    var birdTexture = new THREE.TextureLoader().load("bird.png");
    var birdColor = new THREE.Color("rgb(255, 0, 75)");

    const birdBox = new THREE.Mesh(boxGeometry, [null, null, null, null, new THREE.MeshLambertMaterial(
        {
            color: birdColor,
            map: birdTexture,
            opacity: 0.9,
            transparent: true
        }), null]
    );

    birdBox.position.set(-9 / ASPECT, 4, 15);
    birdBox.scale.set(15, 15, 15);
    scene.add(birdBox);
    items.push({ item: birdBox })

    // BEAR
    var bearTexture = new THREE.TextureLoader().load("bear.png");
    var bearColor = new THREE.Color("rgb(200, 0, 200)");

    const bearBox = new THREE.Mesh(boxGeometry, [null, null, null, null, new THREE.MeshLambertMaterial(
        {
            color: bearColor,
            map: bearTexture,
            opacity: 0.9,
            transparent: true
        }), null]
    );

    bearBox.position.set(2.5 / ASPECT, -0.5, 1);
    bearBox.scale.set(5, 5, 5);

    scene.add(bearBox);
    items.push({ item: bearBox })


    itemDisplayRange = FAR / items.length


    items.reverse();
    items.map((item, i) => {
        if (i === 0) {
            finalItems.push({ ...item, rangeMin: 1, rangeMax: itemDisplayRange })
        } else {
            console.log(finalItems[(i - 1)])
            finalItems.push({ ...item, rangeMin: finalItems[(i - 1)].rangeMax + 1, rangeMax: finalItems[(i - 1)].rangeMax + itemDisplayRange })
        }
    })
    console.log(finalItems)

    window.addEventListener('resize', onWindowResize, false);
    render()
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}


function render() {
    setTimeout(() => {
        checkItems()
    }, 200);
    renderer.render(scene, camera);
}


function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update();
}

// Schedule the first frame.
