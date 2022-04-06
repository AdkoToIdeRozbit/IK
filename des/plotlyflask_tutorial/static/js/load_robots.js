import * as THREE from "https://threejs.org/build/three.module.js"
import { OrbitControls } from "./modules/OrbitControls.js"
import { GLTFLoader } from "./modules/GLTFLoader.js"
import { FontLoader } from "./modules/FontLoader.js"



$('body').append('<canvas id=kanvas></canvas>')
var canvas = $('#kanvas')
canvas.height(window.innerHeight)
canvas.width(window.innerWidth)
canvas = document.querySelector(`#kanvas`)
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.domElement.style.zIndex = -1
renderer.setPixelRatio(window.devicePixelRatio);
const Width = window.innerWidth / 3;
const Height = window.innerHeight / 3;
renderer.setSize(Width, Height);

window.onload = function () {
  $(".kontainer li").each(function (index) {
    var id = $(this).text().slice(9)
    var note_id = `.${this.className}`
    note_id = note_id.slice(16)

    $(`<div id=divRobot${index} class=divRobot${index} class=divRobot></div>`).insertBefore($(`.button${note_id}`))
    $(`#divRobot${index}`).addClass('divRobot')
    ID_function(id, index)
    $(`.${this.className}`).addClass('group-items')
    $(`.${this.className}`).append('<hr>');

  });
};

var scenes = []

function ID_function(id, index) {
  COUNT = 0
  globalThis.scene = new THREE.Scene();
  scene.userData.element = document.querySelector(`#divRobot${index}`)
  //console.log(scene.userData.element)
  globalThis.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
  camera.userData.notDestroy = true
  camera.position.set(0.56, 63.3, 142.23);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.userData.camera = camera
  globalThis.controls = new OrbitControls(scene.userData.camera, scene.userData.element);
  scene.userData.controls = controls;

  let hemiLight = new THREE.AmbientLight(0xffffff, 0.20);
  hemiLight.userData.notDestroy = true
  scene.add(hemiLight);
  let dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(30, 50, 30);
  scene.add(dirLight);
  dirLight.userData.notDestroy = true
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.left = -70;
  dirLight.shadow.camera.right = 70;
  dirLight.shadow.camera.top = 70;
  dirLight.shadow.camera.bottom = -70;

  globalThis.JOINTS = []
  globalThis.INPUTS = []
  globalThis.i = 0
  globalThis.CONTROLS = []
  globalThis.AXES = []
  globalThis.LINES = []
  globalThis.inputtext = []
  globalThis.TEXTS = []
  globalThis.loader = new FontLoader();

  var i = id.indexOf(';');
  var splits = [id.slice(0, i), id.slice(i + 1)];

  let inputs = splits[1].split(';')
  inputs.forEach(element => {
    if (parseInt(element) > 0) inputtext.push(parseInt(element))
  });
  let lines_positions = splits[0].split(',')
  lines_positions = lines_positions.map(function (x) {
    if (x.includes("z") || x.includes("x") || x.includes("y") || x.length == 0 || x.includes("e")) return x
    else return parseFloat(x, 10);
  });

  let end = lines_positions.length
  for (let i = 0; i < (end / 7); i++) {
    if (lines_positions[3].includes("z")) createCylinder1(lines_positions[0], lines_positions[1], lines_positions[2], i + 1, lines_positions[4], lines_positions[5], lines_positions[6])
    else if (lines_positions[3].includes("y")) createCylinder3(lines_positions[0], lines_positions[1], lines_positions[2], i + 1, lines_positions[4], lines_positions[5], lines_positions[6])
    else if (lines_positions[3].includes("x")) createCylinder2(lines_positions[0], lines_positions[1], lines_positions[2], i + 1, lines_positions[4], lines_positions[5], lines_positions[6])
    else if (lines_positions[3].includes("e")) createSphere(lines_positions[0], lines_positions[1], lines_positions[2], i + 1, lines_positions[4], lines_positions[5], lines_positions[6])
    for (let i = 0; i < 7; i++) lines_positions.splice(0, 1)
  }
  let pos = { x: 0, y: -1, z: 3 };
  let scale = { x: 120, y: 2, z: 120 };

  let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(),
    new THREE.MeshPhongMaterial({ color: 0xf9c834 }));
  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(scale.x, scale.y, scale.z);
  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;
  blockPlane.userData.notDestroy = true
  scene.add(blockPlane);

  blockPlane.userData.ground = true
  blockPlane.userData.name = 'plane'
  JOINTS_SCENES.push(COUNT)
  JOINTS_TEXTS.push(COUNT - 1)
  scenes.push(scene);
  animate()
}


function updateSize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
  }
}

var COUNT = 0

function render() {
  updateSize();
  renderer.setScissorTest(false);
  renderer.clear();
  renderer.setScissorTest(true);
  scenes.forEach(function (scene) {
    const element = scene.userData.element;
    const rect = element.getBoundingClientRect();
    //element.style.transform = `translateY(${window.scrollY}px)`;
    // check if it's offscreen. If so skip it
    if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
      rect.right < 0 || rect.left > renderer.domElement.clientWidth) {
      return; // it's off screen
    }

    // set the viewport
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = renderer.domElement.clientHeight - rect.bottom;
    renderer.setViewport(left, bottom - window.scrollY, width, height);
    renderer.setScissor(left, bottom - window.scrollY, width, height);
    const camera = scene.userData.camera;
    renderer.render(scene, camera);
  })
}
var toindex = 0
const loaderGLTF = new GLTFLoader()
function animate() {
  render()
  requestAnimationFrame(animate);
}

function modelLoader(url) {
  return new Promise((resolve, reject) => {
    loaderGLTF.load(url, data => resolve(data), null, reject);
  });
}

async function create_axes(cylinder, i, rotx, roty, rotz) {
  const gltfData = await modelLoader('../static/glb/axes.glb')
  //console.log(gltfData)
  let root = gltfData.scene;

  if (JOINTS_SCENES[toindex] == 0) toindex += 1
  scenes[toindex].add(root);

  var replace = JOINTS_SCENES[toindex] - 1
  JOINTS_SCENES.splice(toindex, 1, replace)
  cylinder.children = root
  root.parent = cylinder
  root.scale.set(1.5, 1.5, 1.5)
  root.position.set(- 11.5, 0, 0)
  if (cylinder.userData.three) root.position.set(0, 11.5, 0)

  if (rotx == '') rotx = 0
  if (roty == '') roty = 0
  if (rotz == '') rotz = 0
  if (rotx == 2) rotx = Math.PI / 2
  if (roty == 2) roty = Math.PI / 2
  if (rotz == 2) rotz = Math.PI / 2
  if (rotx == 3) rotx = Math.PI
  if (roty == 3) roty = Math.PI
  if (rotz == 3) rotz = Math.PI
  if (rotx == -2) rotx = -Math.PI / 2
  if (roty == -2) roty = -Math.PI / 2
  if (rotz == -2) rotz = -Math.PI / 2
  if (rotx == -3) rotx = -Math.PI
  if (roty == -3) roty = -Math.PI
  if (rotz == -3) rotz = -Math.PI
  if (rotx) {

    root.rotation.x = -cylinder.rotation.x + rotx
    root.rotation.y = -cylinder.rotation.y + roty
    root.rotation.z = -cylinder.rotation.z + rotz
  }
}

var JOINTS_SCENES = []
var JOINTS_TEXTS = []

function createCylinder1(x, y, z, u, rotx, roty, rotz) {
  i = i + 1
  COUNT += 1
  let radius = 3.7;
  let height = 7
  var pos = { x: x, y: y, z: z };

  let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
  cylinder.position.set(pos.x, pos.y, pos.z)
  cylinder.castShadow = true
  cylinder.receiveShadow = true
  cylinder.userData.draggable = true
  cylinder.userData.one = true

  cylinder.userData.name = `${i}`
  create_axes(cylinder, i - 1, rotx, roty, rotz,)
  JOINTS.push(cylinder)
  scene.add(cylinder)
  if (JOINTS.length > 1) connect_joints(JOINTS[JOINTS.length - 1], JOINTS[JOINTS.length - 2], i - 2)

}

function createCylinder2(x, y, z, u, rotx, roty, rotz) {
  i = i + 1
  COUNT += 1
  let radius = 3.7;
  let height = 7
  var pos = { x: x, y: y, z: z };

  let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
  cylinder.position.set(pos.x, pos.y, pos.z)
  cylinder.castShadow = true
  cylinder.receiveShadow = true
  cylinder.userData.draggable = true
  cylinder.userData.two = true
  cylinder.rotation.x = 3.14 / 2

  cylinder.userData.name = `${i}`
  create_axes(cylinder, i - 1, rotx, roty, rotz)
  JOINTS.push(cylinder)
  scene.add(cylinder)
  if (JOINTS.length > 1) connect_joints(JOINTS[JOINTS.length - 1], JOINTS[JOINTS.length - 2], i - 2)

}

function createCylinder3(x, y, z, u, rotx, roty, rotz) {
  i = i + 1
  COUNT += 1
  let radius = 3.7;
  let height = 7
  var pos = { x: x, y: y, z: z };

  let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
  cylinder.position.set(pos.x, pos.y, pos.z)
  cylinder.castShadow = true
  cylinder.receiveShadow = true
  cylinder.userData.draggable = true
  cylinder.userData.three = true
  cylinder.rotation.z = 3.14 / 2

  cylinder.userData.name = `${i}`
  create_axes(cylinder, i - 1, rotx, roty, rotz)
  JOINTS.push(cylinder)
  scene.add(cylinder)
  if (JOINTS.length > 1) connect_joints(JOINTS[JOINTS.length - 1], JOINTS[JOINTS.length - 2], i - 2)

}

function createSphere(x, y, z, u, rotx, roty, rotz) {
  i = i + 1
  COUNT += 1
  var pos = { x: x, y: y, z: z };

  let geometry = new THREE.SphereGeometry(2, 32, 16);
  let material = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
  let sphere = new THREE.Mesh(geometry, material);
  sphere.receiveShadow = true
  sphere.castShadow = true


  create_axes(sphere, i - 1, rotx, roty, rotz)
  sphere.userData.name = `${i}`
  sphere.userData.end = true
  sphere.position.set(pos.x, pos.y, pos.z)
  scene.add(sphere)
  JOINTS.push(sphere)
  if (JOINTS.length > 1) connect_joints(JOINTS[JOINTS.length - 1], JOINTS[JOINTS.length - 2], i - 2)

}

function connect_joints(a, b, i) {
  var lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
  let endVector = new THREE.Vector3(a.position.x, a.position.y, a.position.z);
  let startVector = new THREE.Vector3(b.position.x, b.position.y, b.position.z);
  var linePoints = []
  linePoints.push(startVector, endVector);

  var tubeGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(linePoints),
    512,// path segments
    0.5,// THICKNESS
    8, //Roundness of Tube
    false //closed
  );

  let line = new THREE.Line(tubeGeometry, lineMaterial);
  scene.add(line)
  LINES.splice(i, 1)
  LINES.splice(i, 0, line)
  let x = ((b.position.x + a.position.x) / 2)
  let y = ((b.position.y + a.position.y) / 2) - 3
  let z = ((b.position.z + a.position.z) / 2) + 3
  create_text(x, y, z, inputtext[0])
  inputtext.shift()
  //create_input(x, y, z, i)
}

var indexdo = 0

function create_text(x, y, z, i) {
  loader.load('./static/fonts/Calisto MT_Italic.json', function (font) {
    const color = 0x006699;
    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      side: THREE.DoubleSide
    });
    const message = `${i}cm`;
    const shapes = font.generateShapes(message, 100);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);
    // make shape ( N.B. edge view not visible )
    var text = new THREE.Mesh(geometry, matLite);
    text.position.x = x
    text.position.y = y
    text.position.z = z

    text.scale.set(0.02, 0.02, 0.02)

    if (JOINTS_TEXTS[indexdo] == 0) indexdo += 1
    scenes[indexdo].add(text);
    var replace = JOINTS_TEXTS[indexdo] - 1
    JOINTS_TEXTS.splice(indexdo, 1, replace)


    TEXTS.splice(i, 1)
    TEXTS.splice(i, 0, text)
  }
  )
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);