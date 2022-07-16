///// IMPORT
import './main.css'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container);

///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#c8f0f9')

///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)
scene.add(camera)



///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true}) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div


///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(1)
})

///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
document.body.onscroll = objectMovement;

///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82)
scene.add(ambient);

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-69,44,14)
scene.add(sunLight);

//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false //disable orbit controls to animate the camera
     setOrbitControlsLimits() //enable controls limits
    new TWEEN.Tween(camera.position.set(0,4,-35 )).to({ // from camera position
        x: -65, //desired x position to go
        y: 5, //desired y position to go
        z: -95 //desired z position to go
    }, 6500) // time take to animate
    .delay(1000).easing(TWEEN.Easing.Quartic.InOut).start() // define delay, easing
    .onComplete(function () { //on finish animation
        controls.enabled = true //enable orbit controls
        TWEEN.remove(this) // remove the animation from memory
    })
}

introAnimation() // call intro animation on start

//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits(){
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 15
    controls.maxDistance = 60
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI /2.5
}

//// OBJECT CREATION
const verticesOfCube = [
    -1, -1, -1,    1, -1, -1,    1,  1, -1,    -1,  1, -1,
    -1, -1,  1,    1, -1,  1,    1,  1,  1,    -1,  1,  1,
];
const indicesOfFaces = [
    2, 1, 0,    0, 3, 2,
    0, 4, 7,    7, 3, 0,
    0, 1, 5,    5, 4, 0,
    1, 2, 6,    6, 5, 1,
    2, 3, 7,    7, 6, 2,
    4, 5, 6,    6, 7, 4,
];
const radius = 9;
const detail = 10;
const geometry = new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, radius, detail);
const material = new THREE.MeshStandardMaterial({
    color: 0xff6367, wireframe: true
});
const torusMesh = new THREE.Mesh(geometry,material);
scene.add(torusMesh);

//// Stars
function addStars() {
    const geom = new THREE.OctahedronGeometry(0.3,0);
    const mat = new THREE.MeshStandardMaterial({color: 'red'});
    const star = new THREE.Mesh(geom,mat);

    const[x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(90));
    star.position.set(x,y,z);
    scene.add(star);
}

Array(900).fill().forEach(addStars);


//// ADD BACKGROUND
scene.fog = new THREE.Fog(scene.background, 42.5, 70);
var division = 100;
var limit = 200;
var grid = new THREE.GridHelper(limit * 2, division, "magenta", "purple");

var moveable = [];
for (let i = 0; i <= division; i++) {
    moveable.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
}
grid.geometry.addAttribute('moveable', new THREE.BufferAttribute(new Uint8Array(moveable), 1));
grid.material = new THREE.ShaderMaterial({
    uniforms: {
        time: {
            value: 0
        },
        limits: {
            value: new THREE.Vector2(-limit, limit)
        },
        speed: {
            value: 5
        }
    },
    vertexShader: `
    uniform float time;
    uniform vec2 limits;
    uniform float speed;
    
    attribute float moveable;
    
    varying vec3 vColor;
  
    void main() {
      vColor = color;
      float limLen = limits.y - limits.x;
      vec3 pos = position;
      if (floor(moveable + 0.5) > 0.5){ // if a point has "moveable" attribute = 1 
        float dist = speed * time;
        float currPos = mod((pos.z + dist) - limits.x, limLen) + limits.x;
        pos.z = currPos;
      } 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
    }
  `,
    fragmentShader: `
    varying vec3 vColor;
  
    void main() {
      gl_FragColor = vec4(vColor, 1.);
    }
  `,
    vertexColors: THREE.VertexColors
});

scene.add(grid);



//// object MOVEMENT FUNCTION
function objectMovement(){
    torusMesh.rotation.x += 0.05;
    torusMesh.rotation.y += 0.05;
    torusMesh.rotation.y += 0.05;
}

//// RENDER LOOP FUNCTION
function renderLoop() {
    TWEEN.update() // update animations
    controls.update() // update orbit controls
    renderer.render(scene, camera) // render the scene using the camera
    requestAnimationFrame(renderLoop) //loop the render function
}

renderLoop() //start rendering
