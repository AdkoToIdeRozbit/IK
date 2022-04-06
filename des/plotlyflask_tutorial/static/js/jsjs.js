import * as THREE from "https://threejs.org/build/three.module.js"
import { TransformControls } from "./modules/TransformControls.js"
import { OrbitControls } from "./modules/OrbitControls.js"
import { GLTFLoader } from "./modules/GLTFLoader.js"
import { FontLoader } from "./modules/FontLoader.js"
import { CSS3DRenderer, CSS3DObject } from './modules/CSS3DRenderer.js'

window.onload = function () {
  var compute_button = document.getElementById('compute');
  compute_button.disabled = true;
  var save_button = document.getElementById('save_diagram');
  save_button.disabled = true;
}

var button = document.getElementsByClassName("code_button");
button[0].addEventListener("click", Code, false);

function Code() {
  var userInfo
  if (DH.length < 1) {
    userInfo = "nafing";
  }
  else userInfo = DH;
  console.log(DH)
  const request = new XMLHttpRequest()
  request.open('POST', `/processUserInfo/${JSON.stringify(userInfo)}`)
  request.send()
  console.log("sent")
}

var button = document.getElementById("save_diagram");
button.addEventListener("click", sendRobotID, false);
function sendRobotID() {
  var robot_id = $('.ID_text').text();
  const request = new XMLHttpRequest()
  request.open('POST', `/get_robot_id/${JSON.stringify(robot_id)}`)
  request.send()
}

var aha = document.getElementById("id_button");
aha.addEventListener("click", ID_function, false);

function ID_function() {
  var idd = document.getElementById("code").value

  if (idd.includes('ID:')) var id = idd.slice(3)
  else var id = idd
  var i = id.indexOf(';');
  var splits = [id.slice(0, i), id.slice(i + 1)];

  let inputs = splits[1].split(';')
  inputs.forEach(element => {
    if (element != '') inputtext.push(parseInt(element))
  });

  let lines_positions = splits[0].split(',')
  lines_positions = lines_positions.map(function (x) {
    if (x.includes("z") || x.includes("x") || x.includes("y") || x.length == 0 || x.includes("e")) return x
    else return parseFloat(x, 10);
  });

  for (let i = 0; i < JOINTS.length; i++) {
    CONTROLS[i].detach(AXES[i])
    scene.remove(CONTROLS[i])
    TRANSFORMS[i].detach(JOINTS[i])
    scene.remove(AXES[i])
    scene.remove(TRANSFORMS[i])
    scene.remove(JOINTS[i].children)
    scene.remove(JOINTS[i])
    scene.remove(LINES[i])
    scene2.remove(INPUTS[i])
    scene.remove(TEXTS[i])

    if (i == JOINTS.length - 1) {
      JOINTS = []
      LINES = []
      AXES = []
      TRANSFORMS = []
      INPUTS = []
      TEXTS = []
      CONTROLS = []
    }
  }

  let end = lines_positions.length
  for (let i = 0; i < (end / 7); i++) {
    if (lines_positions[3].includes("z")) createCylinder1(lines_positions[0], lines_positions[1], lines_positions[2], i + 1, lines_positions[4], lines_positions[5], lines_positions[6])
    else if (lines_positions[3].includes("y")) createCylinder3(lines_positions[0], lines_positions[1], lines_positions[2], i + 1, lines_positions[4], lines_positions[5], lines_positions[6])
    else if (lines_positions[3].includes("x")) createCylinder2(lines_positions[0], lines_positions[1], lines_positions[2], i + 1, lines_positions[4], lines_positions[5], lines_positions[6])
    else if (lines_positions[3].includes("e")) createSphere(lines_positions[0], lines_positions[1], lines_positions[2], i + 1, lines_positions[4], lines_positions[5], lines_positions[6])
    for (let i = 0; i < 7; i++) lines_positions.splice(0, 1)
  }
  if (JOINTS.length > 1) {
    var compute_button = document.getElementById('compute');
    compute_button.disabled = false;
    var save_button = document.getElementById('save_diagram');
    save_button.disabled = false;
  }

}


var buttons = document.getElementById("discard_button");
buttons.addEventListener("click", onButtonClick, false);

function onButtonClick() {

  if (JOINTS.length != 0) {
    CONTROLS[CONTROLS.length - 1].detach(AXES[AXES.length - 1]);
    scene.remove(CONTROLS[AXES.length - 1]);
    TRANSFORMS[AXES.length - 1].detach(JOINTS[JOINTS.length - 1]);
    scene.remove(AXES[AXES.length - 1]);
    scene.remove(TRANSFORMS[TRANSFORMS.length - 1]);
    scene.remove(JOINTS[JOINTS.length - 1].children);
    scene.remove(JOINTS[JOINTS.length - 1]);
    scene.remove(LINES[LINES.length - 1]);
    scene2.remove(INPUTS[INPUTS.length - 1]);
    scene.remove(TEXTS[TEXTS.length - 1]);
    JOINTS.pop();
    LINES.pop();
    AXES.pop();
    TRANSFORMS.pop();
    INPUTS.pop();
    TEXTS.pop();
    CONTROLS.pop();
    DH.pop();
    i = i - 1

    if (JOINTS.length < 2) {
      var compute_button = document.getElementById('compute');
      compute_button.disabled = true;
      var save_button = document.getElementById('save_diagram');
      save_button.disabled = true;
    }
  }
  else return
}

const scene = new THREE.Scene()
const scene2 = new THREE.Scene()

var JOINTS = []

const canvas = document.querySelector('#bg')
const div = document.querySelector('#div')

const Width = window.innerWidth * 0.65;
const Height = window.innerHeight * 0.8;

const camera = new THREE.PerspectiveCamera(30, Width / Height, 1, 1500);
camera.userData.notDestroy = true
camera.position.set(0.56, 63.3, 142.23);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas, alpha: true },);
const renderer2 = new CSS3DRenderer({ element: div })

var vector = new THREE.Vector3();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(Width, Height);

renderer2.domElement.style.zIndex = 3;
renderer.domElement.style.zIndex = -3;

renderer2.setSize(Width, Height);

renderer.domElement.style.position = 'absolute';
//renderer2.domElement.style.position = 'absolute';

renderer.shadowMap.enabled = true;

$('.threejs').append(renderer2.domElement)
$('#div').append(renderer.domElement)


//document.body.appendChild(renderer2.domElement);
//document.body.appendChild(renderer.domElement);

let INPUTS = []

function create_input(x, y, z, i) {
  var input = document.createElement('div')
  if (typeof (inputtext[i]) == 'undefined') input.innerHTML = `<input placeholder=length class=ad id=${i}in>`
  else input.innerHTML = `<input placeholder=length class=ad id=${i}in value=${inputtext[i]}>`
  const object = new CSS3DObject(input)
  object.scale.set(0.2, 0.2, 0.2)
  object.position.x = x
  object.position.y = y - 3
  object.position.z = z
  //object.position.set(0,20,0);
  INPUTS.splice(i, 1)
  INPUTS.splice(i, 0, object)
  scene2.add(object)

}

function onWindowResize() {
  renderer.setSize(window.innerWidth * 0.65, window.innerHeight * 0.8);
  renderer2.setSize(window.innerWidth * 0.65, window.innerHeight * 0.8);
}
window.addEventListener('resize', onWindowResize);

let radius = 3.7;
let height = 7
let cylinder1 = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
cylinder1.castShadow = true
cylinder1.receiveShadow = true
cylinder1.userData.name = 'joint1'
cylinder1.userData.click1 = true
cylinder1.userData.notDestroy = true
scene.add(camera)
camera.add(cylinder1)
var a = camera.getWorldDirection(vector)
var angle = scale(a.y, -1, 1, Math.PI / 2, -Math.PI / 2)
cylinder1.rotation.x = angle;
cylinder1.position.set((-$('.go').width() / 10) - ((750 - $('.go').height()) / 10), 70, - 300)

let cylinder2 = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
cylinder2.castShadow = true
cylinder2.receiveShadow = true
cylinder2.userData.name = 'joint2'
cylinder2.userData.notDestroy = true
cylinder2.userData.click2 = true
scene.add(camera)
camera.add(cylinder2)
console.log($('.go').height())
var angle = scale(a.z, 1, -1, Math.PI, 0)
cylinder2.position.set((-$('.go').width() / 10) - ((750 - $('.go').height()) / 10), 55, - 300)
cylinder2.rotation.z = 3.14 / 2
cylinder2.rotation.y = 3.14 / 2

let cylinder3 = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
cylinder3.castShadow = true
cylinder3.receiveShadow = true
cylinder3.userData.name = 'joint3'
cylinder3.userData.click3 = true
cylinder3.userData.notDestroy = true
scene.add(camera)
camera.add(cylinder3)
var angle = scale(a.z, -1, 1, Math.PI / 2, -Math.PI / 2)
cylinder3.position.set((-$('.go').width() / 10) - ((750 - $('.go').height()) / 10), 40, - 300)
cylinder3.rotation.z = 3.14 / 2

let geometry = new THREE.SphereGeometry(4, 32, 16);
let material = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
const sphere = new THREE.Mesh(geometry, material);
sphere.receiveShadow = true
sphere.castShadow = true
sphere.userData.sphere = true
sphere.userData.notDestroy = true
scene.add(camera)
camera.add(sphere)
sphere.position.set((-$('.go').width() / 10) - ((750 - $('.go').height()) / 10), 25, - 300)


const orbit = new OrbitControls(camera, renderer2.domElement);
orbit.addEventListener('change', onPositionChange);

function onPositionChange() {
  var a = camera.getWorldDirection(vector)
  var angle1 = scale(a.y, -1, 1, Math.PI / 2, -Math.PI / 2)
  var angle2 = scale(a.z, -1, 1, -Math.PI / 2, Math.PI / 2)
  cylinder1.rotation.x = angle1;
  cylinder2.rotation.y = angle2;
  cylinder3.rotation.y = angle2 - 3.14 / 2;
}

function scale(number, inMin, inMax, outMin, outMax) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

//scene.background = new THREE.Color(0xbfd1e5);

function animate() {
  renderer.render(scene, camera);
  renderer2.render(scene2, camera);
  requestAnimationFrame(animate);
}

// ambient light
let hemiLight = new THREE.AmbientLight(0xffffff, 0.20);
hemiLight.userData.notDestroy = true
scene.add(hemiLight);

//Add directional light
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

function createFloor() {
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
}

var i = 0
var CONTROLS = []
var AXES = []

function create_axes(cylinder, i, rotx, roty, rotz) {
  const loader = new GLTFLoader()
  loader.load('../static/glb/axes.glb', function (gltf) {
    let root = gltf.scene;
    scene.add(root)
    cylinder.children = root
    root.parent = cylinder
    root.scale.set(1.5, 1.5, 1.5)
    root.position.set(- 11.5, 0, 0)
    root.userData.name = `${i}`
    let controls = new TransformControls(camera, renderer2.domElement)
    controls.setMode('rotate')
    controls.setSize(controls.size - 0.7)
    controls.attach(root)
    controls.setRotationSnap(Math.PI / 2)
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

    scene.add(controls)
    AXES.splice(i, 0, root)
    CONTROLS.splice(i, 0, controls)
    add_event_listener_rotate(controls, root)

  });
}

function alerts(text) {
  $('.alrt').remove()
  $('.close').remove()
  $('.alertDiv').append($(`<div class=alrt role=alert>${text}</div>`));
  $('.alrt').addClass('alert alert-warning alert-dismissible fade show');
  $('.alrt').append('<button type=button class=close data-dismiss=alert aria-label=Close></button>');
  $('.close').append('<span aria-hidden="true">&times;</span>');

}


function createCylinder1(x, y, z, u, rotx, roty, rotz) {
  if (typeof JOINTS[JOINTS.length - 2] != "undefined" && JOINTS[JOINTS.length - 1].userData.end) {
    alerts('End-effector must be the last part of the chain.')
  }
  else {
    i = i + 1

    let radius = 3.7;
    let height = 7
    var pos
    if (u) {
      pos = { x: x, y: y, z: z };
      i = u
    }
    else pos = { x: 0, y: height / 2, z: 0 };

    // threejs
    let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
    cylinder.position.set(pos.x, pos.y, pos.z)
    cylinder.castShadow = true
    cylinder.receiveShadow = true
    cylinder.userData.draggable = true
    cylinder.userData.one = true

    if (typeof JOINTS[i - 2] != "undefined") {
      let x1 = JOINTS[i - 2].position.x
      let y1 = JOINTS[i - 2].position.y
      let z1 = JOINTS[i - 2].position.z
      let x2 = pos.x
      let y2 = pos.y
      let z2 = pos.z
      let X1 = [x1, y1, z1]
      let X2 = [x2, y2, z2]
      if (X1.length === X2.length && X1.every(function (element) { return X2.includes(element); })) {
        i = i - 1
        return
      }
    } //prevents from having multiple joints at the same location

    cylinder.userData.name = `${i}`
    create_axes(cylinder, i - 1, rotx, roty, rotz)
    JOINTS.push(cylinder)
    scene.add(cylinder)
    let transform = new TransformControls(camera, renderer2.domElement)
    transform.setSize(transform.size - 0.3);
    transform.attach(cylinder)
    scene.add(transform)
    transform.translationSnap = 3.5
    TRANSFORMS.push(transform)
    add_event_listener(transform, cylinder)
    if (JOINTS.length > 1) connect_joints(JOINTS[JOINTS.length - 1], JOINTS[JOINTS.length - 2], i - 2)
  }
}

var TRANSFORMS = []

function createCylinder2(x, y, z, u, rotx, roty, rotz) {
  if (typeof JOINTS[JOINTS.length - 2] != "undefined" && JOINTS[JOINTS.length - 1].userData.end) {
    alerts('End-effector must be the last part of the chain.')
  }
  else {
    i = i + 1

    let radius = 3.7;
    let height = 7
    var pos
    if (u) {
      pos = { x: x, y: y, z: z };
      i = u
    }
    else pos = { x: 0, y: height / 2, z: 0 };

    // threejs
    let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
    cylinder.position.set(pos.x, pos.y, pos.z)
    cylinder.castShadow = true
    cylinder.receiveShadow = true
    cylinder.userData.draggable = true
    cylinder.userData.two = true
    cylinder.rotation.x = 3.14 / 2

    if (typeof JOINTS[i - 2] != "undefined") {
      let x1 = JOINTS[i - 2].position.x
      let y1 = JOINTS[i - 2].position.y
      let z1 = JOINTS[i - 2].position.z
      let x2 = pos.x
      let y2 = pos.y
      let z2 = pos.z
      let X1 = [x1, y1, z1]
      let X2 = [x2, y2, z2]
      if (X1.length === X2.length && X1.every(function (element) { return X2.includes(element); })) {
        i = i - 1
        return
      }
    } //prevents from having multiple joints at the same location

    cylinder.userData.name = `${i}`
    create_axes(cylinder, i - 1, rotx, roty, rotz)
    JOINTS.push(cylinder)
    scene.add(cylinder)
    let transform = new TransformControls(camera, renderer2.domElement)
    transform.setSize(transform.size - 0.3);
    transform.attach(cylinder)
    scene.add(transform)
    transform.translationSnap = 3.5
    TRANSFORMS.push(transform)
    add_event_listener(transform, cylinder)
    if (JOINTS.length > 1) connect_joints(JOINTS[JOINTS.length - 1], JOINTS[JOINTS.length - 2], i - 2)
  }
}

function createCylinder3(x, y, z, u, rotx, roty, rotz) {
  if (typeof JOINTS[JOINTS.length - 2] != "undefined" && JOINTS[JOINTS.length - 1].userData.end) {
    alerts('End-effector must be the last part of the chain.')
  }
  else {
    i = i + 1

    let radius = 3.7;
    let height = 7
    var pos
    if (u) {
      pos = { x: x, y: y, z: z };
      i = u
    }
    else pos = { x: 0, y: height / 2, z: 0 };

    // threejs
    let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
    cylinder.position.set(pos.x, pos.y, pos.z)
    cylinder.castShadow = true
    cylinder.receiveShadow = true
    cylinder.userData.draggable = true
    cylinder.userData.three = true
    cylinder.rotation.z = 3.14 / 2

    if (typeof JOINTS[i - 2] != "undefined") {
      let x1 = JOINTS[i - 2].position.x
      let y1 = JOINTS[i - 2].position.y
      let z1 = JOINTS[i - 2].position.z
      let x2 = pos.x
      let y2 = pos.y
      let z2 = pos.z
      let X1 = [x1, y1, z1]
      let X2 = [x2, y2, z2]
      if (X1.length === X2.length && X1.every(function (element) { return X2.includes(element); })) {
        i = i - 1
        return
      }
    } //prevents from having multiple joints at the same location

    cylinder.userData.name = `${i}`
    create_axes(cylinder, i - 1, rotx, roty, rotz)
    JOINTS.push(cylinder)
    scene.add(cylinder)
    let transform = new TransformControls(camera, renderer2.domElement)
    transform.setSize(transform.size - 0.3);
    transform.attach(cylinder)
    scene.add(transform)
    transform.translationSnap = 3.5
    TRANSFORMS.push(transform)
    add_event_listener(transform, cylinder)
    if (JOINTS.length > 1) connect_joints(JOINTS[JOINTS.length - 1], JOINTS[JOINTS.length - 2], i - 2)
  }
}

function createSphere(x, y, z, u, rotx, roty, rotz) {
  if (typeof JOINTS[JOINTS.length - 2] != "undefined" && JOINTS[JOINTS.length - 1].userData.end) {
    alerts('End-effector must be the last part of the chain.')
  }
  else {
    i = i + 1
    var pos
    if (u) {
      pos = { x: x, y: y, z: z };
      i = u
    }
    else pos = { x: 0, y: height / 2, z: 0 };


    let geometry = new THREE.SphereGeometry(2, 32, 16);
    let material = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    let sphere = new THREE.Mesh(geometry, material);
    sphere.receiveShadow = true
    sphere.castShadow = true

    if (typeof JOINTS[i - 2] != "undefined") {
      let x1 = JOINTS[i - 2].position.x
      let y1 = JOINTS[i - 2].position.y
      let z1 = JOINTS[i - 2].position.z
      let x2 = pos.x
      let y2 = pos.y
      let z2 = pos.z
      let X1 = [x1, y1, z1]
      let X2 = [x2, y2, z2]
      if (X1.length === X2.length && X1.every(function (element) { return X2.includes(element); })) {
        i = i - 1
        return
      }
    } //prevents from having multiple joints at the same location
    create_axes(sphere, i - 1, rotx, roty, rotz)
    sphere.userData.name = `${i}`
    sphere.userData.end = true
    sphere.position.set(pos.x, pos.y, pos.z)
    scene.add(sphere)
    JOINTS.push(sphere)
    let transform = new TransformControls(camera, renderer2.domElement)
    transform.setSize(transform.size - 0.3);
    transform.attach(sphere)
    scene.add(transform)
    transform.translationSnap = 3.5
    TRANSFORMS.push(transform)
    add_event_listener(transform, sphere)
    if (JOINTS.length > 1) connect_joints(JOINTS[JOINTS.length - 1], JOINTS[JOINTS.length - 2], i - 2)
  }
}

const raycaster = new THREE.Raycaster(); // create once
const clickMouse = new THREE.Vector2();  // create once
const moveMouse = new THREE.Vector2();   // create once
var draggable = new THREE.Object3D;

function intersect(pos = THREE.Vector2) {
  raycaster.setFromCamera(pos, camera);
  if (raycaster.intersectObjects(camera.children).length == 1)
    return raycaster.intersectObjects(camera.children);
  else return raycaster.intersectObjects(scene.children);
}

var LINES = []
var inputtext = []

function connect_joints(a, b, i) {
  if (!!a) {  //if a exisst we  draw
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
    let x = ((b.position.x + a.position.x) / 2) - 3
    let y = ((b.position.y + a.position.y) / 2)
    let z = ((b.position.z + a.position.z) / 2) + 3
    create_input(x, y, z, i)
    create_text(x, y, z, i)

  }
  else {
    if (i == LINES.length) {
      inputtext.splice(i - 1, 1)
      inputtext.splice(i - 1, 0, document.getElementById(`${i - 1}in`).value)
      scene2.remove(INPUTS[i - 1])
      INPUTS.splice(i - 1, 1)
      INPUTS.splice(i - 1, 0, '')
      scene.remove(TEXTS[i - 1])
      TEXTS.splice(i - 1, 1)
      TEXTS.splice(i - 1, 0, '')
      scene.remove(LINES[i - 1])
      LINES.splice(i - 1, 1)
      LINES.splice(i - 1, 0, '')

    }

    else {
      inputtext.splice(i, 1)
      inputtext.splice(i, 0, document.getElementById(`${i}in`).value)
      scene2.remove(INPUTS[i])
      INPUTS.splice(i, 1)
      INPUTS.splice(i, 0, '')
      scene.remove(TEXTS[i])
      TEXTS.splice(i, 1)
      TEXTS.splice(i, 0, '')
      scene.remove(LINES[i])
      LINES.splice(i, 1)
      LINES.splice(i, 0, '')

    }
  }
}

function add_event_listener(element, object) {
  element.addEventListener('dragging-changed', function (event) {  //orbit controls and transform, indempendently
    orbit.enabled = !event.value;
    let index = object.userData.name - 1
    if (typeof JOINTS[index - 1] == "undefined") {  //first obj
      if (typeof JOINTS[index + 1] != "undefined") {   // has next one
        if (event.value == false) {
          connect_joints(JOINTS[index], JOINTS[index + 1], index) //create lines
          create_id()
          create_table()
        }
        else {
          connect_joints('', '', index)   //destroy them
        }
      }
    }

    else if (typeof JOINTS[index + 1] == "undefined") {   //last obj
      if (event.value == false) {
        connect_joints(JOINTS[index], JOINTS[index - 1], index - 1) //create lines
        create_table()
        create_id()
      }
      else {
        connect_joints('', '', index)   //destroy them
      }
    }

    else {
      if (event.value == false) { // somwhere in the middle
        connect_joints(JOINTS[index], JOINTS[index + 1], index)  //create lines
        connect_joints(JOINTS[index], JOINTS[index - 1], index - 1)  //create lines
        create_table()
        create_id()
      }
      else {
        connect_joints('', '', index)  //destroy 
        connect_joints('', '', index - 1)  //destroy 
      }
    }

  })
};


function hover() {
  // CAMERA.ATTACH MIGHT BE IMPORTANT, INSTEAD OF CAMERA.ADD


  //raycaster.setFromCamera(moveMouse, camera);
  //const intersects = raycaster.intersectObjects(camera.children);
  //intersects.object.material.transparent = true;
  //intersects.object.material.alphaTest = 0.5;
}

window.addEventListener('click', event => {
  if (draggable != null) {
    draggable = null
    return
  }

  // THREE RAYCASTER
  var offsets = document.getElementById('bg').getBoundingClientRect();
  clickMouse.x = ((event.clientX - offsets.left) / Width) * 2 - 1;
  clickMouse.y = -((event.clientY - offsets.top) / Height) * 2 + 1;

  const found = intersect(clickMouse);
  if (found.length > 0) {
    if (found[0].object.userData.draggable) {
      draggable = found[0].object
      //console.log(`found draggable ${draggable.userData.name}`)
    }
    if (JOINTS.length > 1) {
      var compute_button = document.getElementById('compute');
      compute_button.disabled = false;
      var save_button = document.getElementById('save_diagram');
      save_button.disabled = false;
    }
    if (found[0].object.userData.click1) {
      createCylinder1()
    }
    if (found[0].object.userData.click2) {
      createCylinder2()
    }
    if (found[0].object.userData.click3) {
      createCylinder3()
    }
    if (found[0].object.userData.sphere) {
      if (JOINTS.length < 1) {
        alerts('Chain must have at least one joint.')
      }

      else createSphere()
    }
  }
})

var TEXTS = []

const loader = new FontLoader();
function create_text(x, y, z, i) {
  loader.load('./static/fonts/Calisto MT_Italic.json', function (font) {
    const color = 0x006699;
    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      side: THREE.DoubleSide
    });
    const message = `X${i + 1}`;
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
    scene.add(text);
    TEXTS.splice(i, 1)
    TEXTS.splice(i, 0, text)

  }
  )
}

function add_event_listener_rotate(element, object) {
  element.addEventListener('dragging-changed', function (event) {  // frames rotated  
    orbit.enabled = !event.value;

    if (event.value == false) {
      create_table()
      create_id()
    }
    else {
      if (object.parent.userData.one) {
        if (`${element.axis}` === "Y") element.setRotationSnap(Math.PI / 2)   // if X is dragged and joint 1
        else element.setRotationSnap(Math.PI)
      }

      else if (object.parent.userData.two) {
        if (`${element.axis}` === "Z") element.setRotationSnap(Math.PI / 2)   // if X is dragged and joint 1
        else element.setRotationSnap(Math.PI)
      }
      else if (object.parent.userData.three) {
        if (`${element.axis}` === "X") element.setRotationSnap(Math.PI / 2)   // if X is dragged and joint 1
        else element.setRotationSnap(Math.PI)
      }
    }
  });
  //element.addEventListener( 'change', renderer.render(scene, camera))
}
//document.getElementsByClassName("ID");
$(document).ready(function () {
  $("<table id=table class=table></table>").insertBefore($("#flex"));
  $('#table').addClass('table-hover')
  $('#table').addClass('table-dark')
  $('#table').append($('<thead id=thead><thead>'))
  $('#table').append($('<tbody id=tbody><tbody>'))
  $('#thead').append($('<tr id=tr></tr>'))
  $('#tr').append($('<th scope=col>#</th>'))
  $('#tr').append($('<th scope=col>Theta (θ)</th>'))
  $('#tr').append($('<th scope=col>Alpha (α)</th>'))
  $('#tr').append($('<th scope=col>R</th>'))
  $('#tr').append($('<th scope=col>D</th>'))
})

function create_id() {
  var string = ''
  var Rotation = ''

  for (let i = 0; i < JOINTS.length; i++) {
    if (typeof JOINTS[i].children.rotation != 'undefined') {

      let xrot = Math.round(JOINTS[i].children.rotation.x + JOINTS[i].rotation.x)
      let yrot = Math.round(JOINTS[i].children.rotation.y + JOINTS[i].rotation.y)
      let zrot = Math.round(JOINTS[i].children.rotation.z + JOINTS[i].rotation.z)

      if (xrot == 0) xrot = ''
      if (yrot == 0) yrot = ''
      if (zrot == 0) zrot = ''
      let type
      if (JOINTS[i].userData.one) type = 'z'
      else if (JOINTS[i].userData.two) type = 'x'
      else if (JOINTS[i].userData.three) type = 'y'
      else if (JOINTS[i].userData.end) type = 'e'
      Rotation += `${type},${xrot},${yrot},${zrot}`
    }
    //console.log(inputtext)
    //let input = parseInt(inputtext[i])

    var start = `${JOINTS[i].position.x},${JOINTS[i].position.y},${JOINTS[i].position.z},${Rotation}`
    string += start
    if (i == JOINTS.length - 1) {
      var inputs = ';'

      inputtext.forEach(element => {
        inputs += `${element};`

      });
      string += inputs
    }
    else string += ','

    Rotation = ''
  }

  var a = $(`#ID_text`).text().replace($(`#ID_text`).text(), 'ID: ' + string)
  $(`#ID_text`).text(a)
}


let DH_params = []

function create_table() {
  for (let i = 0; i < JOINTS.length - 1; i++) {
    if (typeof JOINTS[i].children.rotation != 'undefined') {
      if (document.getElementById(`${i}in`) > 0) {
        inputtext.splice(i, 1)
        inputtext.splice(i, 0, document.getElementById(`${i}in`).value)
      }
      DH_params = calculate_dh(i)
      let theta = DH_params[0]
      let alfa = DH_params[1]
      let r = DH_params[2]
      let d = DH_params[3]

      if ($(`#th${i}`).text()) {  // if there is a text change it
        if (theta > 0) var a = $(`#th${i}`).text().replace($(`#th${i}`).text(), `θ${i + 1} +${theta}°`)
        else if (theta < 0) var a = $(`#th${i}`).text().replace($(`#th${i}`).text(), `θ${i + 1} ${theta}°`)
        else var a = $(`#th${i}`).text().replace($(`#th${i}`).text(), `θ${i + 1}`)
        $(`#th${i}`).text(a)

        var a = $(`#al${i}`).text().replace($(`#al${i}`).text(), `${alfa}°`)
        $(`#al${i}`).text(a)

        var a = $(`#r${i}`).text().replace($(`#r${i}`).text(), `${r}cm`)
        $(`#r${i}`).text(a)

        var a = $(`#d${i}`).text().replace($(`#d${i}`).text(), `${d}cm`)
        $(`#d${i}`).text(a)
      }

      else {
        $('#tbody').append($('<tr>').prop({ id: `tr${i}` }))
        $(`#tr${i}`).append($('<th>').prop({ innerHTML: `${i + 1}`, scope: 'row' }))

        if (theta > 0) $(`#tr${i}`).append($('<td>').prop({ innerHTML: `θ${i + 1} +${theta}°`, id: `th${i}` }))
        else if (theta < 0) $(`#tr${i}`).append($('<td>').prop({ innerHTML: `θ${i + 1} ${theta}°`, id: `th${i}` }))
        else $(`#tr${i}`).append($('<td>').prop({ innerHTML: `θ${i + 1}`, id: `th${i}` }))

        $(`#tr${i}`).append($('<td>').prop({ innerHTML: `${alfa}°`, id: `al${i}` }))
        $(`#tr${i}`).append($('<td>').prop({ innerHTML: `${r}cm`, id: `r${i}` }))
        $(`#tr${i}`).append($('<td>').prop({ innerHTML: `${d}cm`, id: `d${i}` }))
      }
    }
  }
}

let xdir = new THREE.Vector3(1, 0, 0)
let ydir = new THREE.Vector3(0, 0, -1)
let zdir = new THREE.Vector3(0, 1, 0)
let DH = []

function calculate_dh(y) {    // each time controls are added or changed recalculate....

  xdir.applyEuler(JOINTS[y].children.rotation)
  xdir.applyEuler(JOINTS[y].rotation)
  let X0dir = xdir.clone()
  X0dir.round()
  ydir.applyEuler(JOINTS[y].children.rotation)
  ydir.applyEuler(JOINTS[y].rotation)
  let Y0dir = ydir.clone()
  Y0dir.round()
  zdir.applyEuler(JOINTS[y].children.rotation)
  zdir.applyEuler(JOINTS[y].rotation)
  let Z0dir = zdir.clone()
  Z0dir.round()

  xdir.set(1, 0, 0)
  ydir.set(0, 0, -1)
  zdir.set(0, 1, 0)

  xdir.applyEuler(JOINTS[y + 1].children.rotation)
  xdir.applyEuler(JOINTS[y + 1].rotation)
  let X1dir = xdir.clone()
  X1dir.round()
  ydir.applyEuler(JOINTS[y + 1].children.rotation)
  ydir.applyEuler(JOINTS[y + 1].rotation)
  let Y1dir = ydir.clone()
  Y1dir.round()
  zdir.applyEuler(JOINTS[y + 1].children.rotation)
  zdir.applyEuler(JOINTS[y + 1].rotation)
  let Z1dir = zdir.clone()
  Z1dir.round()

  xdir.set(1, 0, 0)
  ydir.set(0, 0, -1)
  zdir.set(0, 1, 0)

  let x0dir = X0dir.clone()
  let x1dir = X1dir.clone()
  let z0dir = Z0dir.clone()
  let z1dir = Z1dir.clone()

  var theta = x1dir.angleTo(x0dir)
  x1dir.applyAxisAngle(Z0dir, theta);
  x1dir.round()
  if (!x1dir.equals(x0dir)) theta *= -1
  theta = Math.round(theta * 57.2957795)

  var alfa = z0dir.angleTo(z1dir)
  z0dir.applyAxisAngle(X1dir, alfa);
  z0dir.round()
  if (!z0dir.equals(z1dir)) alfa *= -1
  alfa = Math.round(alfa * 57.2957795)

  let xbegin = LINES[y].geometry.parameters.path.points[0].x
  let xend = LINES[y].geometry.parameters.path.points[1].x
  let xvec = xend - xbegin

  let ybegin = LINES[y].geometry.parameters.path.points[0].y
  let yend = LINES[y].geometry.parameters.path.points[1].y
  let yvec = yend - ybegin

  let zbegin = LINES[y].geometry.parameters.path.points[0].z
  let zend = LINES[y].geometry.parameters.path.points[1].z
  let zvec = zend - zbegin

  var Linevec = new THREE.Vector3(xvec, yvec, zvec)

  var rvalue
  if (isNaN(parseFloat(inputtext[y]))) rvalue = 0
  else rvalue = parseFloat(inputtext[y])
  let rangle = Math.cos(X1dir.angleTo(Linevec))

  var r = Math.abs(Math.round(rangle * rvalue * 100) / 100)

  let dangle = Math.cos(Z0dir.angleTo(Linevec))
  //console.log(rvalue, dangle, Z0dir, Linevec)
  var d = Math.abs(Math.round(dangle * rvalue * 100) / 100)


  DH.splice(y, 1)
  DH.splice(y, 0, [theta, alfa, r, d])
  return [theta, alfa, r, d]
}

createFloor()
animate()

