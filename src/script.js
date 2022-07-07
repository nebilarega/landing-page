import * as THREE from "three";
import "./styles.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  SMAAEffect,
  VignetteEffect,
  BloomEffect,
} from "postprocessing";
import gsap from "gsap";
let canvas, renderer, composer, cssrenderer, raycaster;
const totalSize = 2890764;
let loaded;
const pointer = new THREE.Vector2();
let scene;
let INTERSECTED;
const gltfLoader = new GLTFLoader();
let specificModel;
const clock = new THREE.Clock();
let previousTime = 0;
let movingParticleSystem;
let blade1,
  blade2,
  streetLight1,
  streetLight2,
  name,
  description,
  text,
  pole,
  shopLight,
  hammic,
  table,
  bilboardFace;

const lights = () => {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(2, 2, 1);
  directionalLight.castShadow = true;
  // directionalLight.angle = 0.5;
  directionalLight.distance = 10;
  //Set up shadow properties for the directionalLight
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 5;
  directionalLight.shadow.camera.right = 3;
  directionalLight.shadow.camera.left = -3;
  directionalLight.shadow.camera.top = 3;
  directionalLight.shadow.camera.bottom = -3;

  const pointLight1 = new THREE.PointLight(0x6ffffc, 1.5);
  pointLight1.position.set(-0.7, 1.2, -1);
  pointLight1.distance = 2;

  const pointLight2 = new THREE.PointLight(0xffffff, 1.5);
  pointLight2.position.set(0.8, 0.8, -0.3);
  pointLight2.distance = 1;

  const pointLight3 = new THREE.PointLight(0xffffff, 1.5);
  pointLight3.position.set(-1.2, 1.2, 0.5);
  pointLight3.distance = 3;

  const ponitLight4 = new THREE.PointLight(0xffffff, 0.8);
  ponitLight4.position.set(0, 1.8, 0);
  ponitLight4.distance = 3;

  const pointLightCeling = new THREE.PointLight(0xffffff, 0.4);
  pointLightCeling.position.set(-0.15, 0.3, -0.1);
  pointLightCeling.distance = 0.9;
  pointLightCeling.castShadow = true;

  const pointLightFloor = new THREE.PointLight(0xffffff, 4);
  pointLightFloor.position.set(0, 0, 0);
  pointLightFloor.distance = 1;
  const lightGroup = new THREE.Group();
  lightGroup.add(
    directionalLight,
    pointLight1,
    pointLight2,
    pointLight3,
    ponitLight4,
    pointLightCeling
  );
  return lightGroup;
};
const modelLoader = (
  url,
  scene,
  scale = { x: 1, y: 1, z: 1 },
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
  callback
) => {
  gltfLoader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      // model.traverse((child) => {
      //   if (child.isMesh) {
      //     child.castShadow = true;
      //     child.receiveShadow = true;
      //   }
      // });
      specificModel = model.getObjectByName("BigBowl");
      blade1 = model.getObjectByName("Blade");
      blade2 = model.getObjectByName("Blade2");
      name = model.getObjectByName("Name");
      description = model.getObjectByName("Description");
      streetLight1 = model.getObjectByName("StreetLight1");
      streetLight2 = model.getObjectByName("StreetLight2");
      shopLight = model.getObjectByName("ShopLight");
      text = model.getObjectByName("Text");
      pole = model.getObjectByName("Pole");
      hammic = model.getObjectByName("Hammic");
      table = model.getObjectByName("Table");
      bilboardFace = model.getObjectByName("BilboardFace");
      console.log(bilboardFace.position.x * 0.1);

      model.position.set(position.x, position.y, position.z);
      model.scale.set(scale.x, scale.y, scale.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);

      model.castShadow = true;
      model.children.forEach((child) => {
        if (typeof child === "object") {
          child.castShadow = true;
        } else {
          child.children.forEach((anotherChild) => {
            anotherChild.castShadow = true;
          });
        }
      });
      const specificPosition = {
        x: -0.32,
        y: 0.6,
        z: 0,
      };
      const specificScale = { x: 0.5, y: 0.4, z: 0.5 };
      const specificRotation = { x: 0, y: Math.PI / 4, z: 0 };
      callback(
        specificModel,
        scene,
        specificPosition,
        specificScale,
        specificRotation
      );
      scene.add(model);
      const camera = scene.userData.camera;
      window.addEventListener("pointerdown", (event) => {
        onPointerDown(event, scene, camera);
      });
      gsap.to(camera.position, { x: -0.2, y: 0.6, z: 2, duration: 1 });
      container.remove();
    },
    (xhr) => {
      loaded = (xhr.loaded / totalSize).toFixed(0);
      container.childNodes[0].textContent = `Loading ${loaded * 100}%`;
      // container.childNodes[0].textContent = `loading ${loaded * 100}%`;
      // console.log((xhr.loaded / totalSize) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
    }
  );
};

const particulateModel = (
  model,
  scene,
  position = { x: 0, y: 0, z: 0 },
  scale = { x: 1, y: 1, z: 1 },
  rotation = { x: 0, y: 0, z: 0 }
) => {
  if (model) {
    model.scale.set(0.1, 0.1, 0.1);
    model.material.emissive = new THREE.Color(0x00e0ff);
    const sampleGeometry = model.geometry;
    const sampleMaterial = model.material;

    const surfaceMesh = new THREE.Mesh(sampleGeometry, sampleMaterial);
    const sampler = new MeshSurfaceSampler(surfaceMesh)
      .setWeightAttribute("color")
      .build();

    const _position = new THREE.Vector3();
    const particleGeometery = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 4000; i++) {
      sampler.sample(_position);
      vertices.push(_position.x, _position.y, _position.z);
    }
    particleGeometery.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({});
    particleMaterial.size = 0.5;
    particleMaterial.color = new THREE.Color(0x6ffffc);
    particleMaterial.sizeAttenuation = false;
    const particleSystem = new THREE.Points(
      particleGeometery,
      particleMaterial
    );
    particleSystem.scale.set(scale.x, scale.y, scale.z);
    particleSystem.position.set(position.x, position.y, position.z);
    particleSystem.rotation.set(rotation.x, rotation.y, rotation.z);
    if (particleSystem) {
      movingParticleSystem = particleSystem;
    }
    scene.add(particleSystem);
  }
};

const onPointerDown = (event, scene, camera) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (
      object.getObjectByName("Cube013") ||
      object.getObjectByName("Cube013_1") ||
      object.getObjectByName("Cube013_2")
    ) {
      window.open("https://github.com/nebilarega");
    } else if (
      object.getObjectByName("Cube014") ||
      object.getObjectByName("Cube014_1") ||
      object.getObjectByName("Cube014_2") ||
      object.getObjectByName("Cube014_3")
    ) {
      const pos = {
        x: bilboardFace.position.x,
        y: bilboardFace.position.y,
        z: bilboardFace.position.z,
      };
      camera.position.set(pos.x, pos.y, pos.z);
      const offset = new THREE.Vector3(0, 0, 1);
      // camera.position.addVectors(bilboardFace.position, offset);
      // camera.lookAt(bilboardFace.position);
      // console.log(bilboardFace.rotation);
    } else if (
      object.getObjectByName("Cube015") ||
      object.getObjectByName("Cube015_1") ||
      object.getObjectByName("Cube015_2")
    ) {
      window.open("https://github.com/nebilarega");
    }
    render();
  }
};

const init = () => {
  canvas = document.querySelector("#webgl");

  const scene1 = new THREE.Scene();
  scene1.userData.element = content;

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    20
  );
  camera.position.z = 5;
  camera.position.y = 0;
  camera.position.x = 0;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.maxDistance = 5;
  controls.minDistance = 1;
  controls.maxPolarAngle = Math.PI / 2 - 0.1;

  // camera.position.x = 0.5;
  scene1.userData.camera = camera;
  scene1.userData.controls = controls;

  scene1.userData.controls.update();

  modelLoader(
    "./models/NebilFinalModel2.glb",
    scene1,
    { x: 0.1, y: 0.1, z: 0.1 },
    { x: -0.2, y: 0, z: 0 },
    { x: 0, y: -Math.PI / 3, z: 0 },
    particulateModel
  );
  const horizontalPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({
      color: 0x0d091c,
      side: THREE.DoubleSide,
    })
  );

  horizontalPlane.position.set(0, 0, 0);
  horizontalPlane.rotation.set(Math.PI / 2, 0, 0);
  horizontalPlane.receiveShadow = true;
  scene1.add(horizontalPlane);

  scene1.add(lights());
  const fog = new THREE.Fog("0x0d091c", 10, 101);
  scene1.fog = fog;
  scene = scene1;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    powerPreference: "high-performance",
    antialias: false,
    stencil: false,
    depth: false,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0d091c, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const smaaEffect = new SMAAEffect();
  const noiseEffect = new NoiseEffect({ premultiply: true });
  const bloomEffect = new BloomEffect();

  bloomEffect.intensity = 1;
  bloomEffect.dithering = true;

  smaaEffect.edgeDetectionMaterial.edgeDetectionThreshold = 0.05;
  noiseEffect.blendMode.opacity.value = 0.75;

  const renderPass = new RenderPass(scene, camera);
  const effectPass = new EffectPass(camera, bloomEffect);

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(effectPass);
};

const updateSize = (camera) => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.updateProjectionMatrix();
  }
};
const animate = () => {
  render();
  requestAnimationFrame(animate);
};
const render = () => {
  const camera = scene.userData.camera;
  updateSize(camera);
  renderer.setClearColor(0x0d091c);
  renderer.setScissorTest(false);
  renderer.clear();

  renderer.setClearColor(0x0d091c);
  renderer.setScissorTest(true);
  renderer.shadowMap.enabled = true;

  if (movingParticleSystem) {
    movingParticleSystem.rotation.y = Date.now() * 0.0001;
  }
  if (blade1 && blade2) {
    blade1.rotation.y = Date.now() * 0.005;
    blade2.rotation.y = Date.now() * 0.005;
  }
  if (name && description) {
    name.material.emissive = new THREE.Color(0x00e0ff);
    description.material.emissive = new THREE.Color(0x00e0ff);
  }
  if (text) {
    text.material.emissive = new THREE.Color(0xff00ff);
  }
  if (pole) {
    pole.material.color = new THREE.Color(0x8a243d);
  }
  if (shopLight) {
    shopLight.material.color = new THREE.Color(0xffffff);
    shopLight.material.emissive = new THREE.Color(0xffffff);
  }
  if (hammic) {
    hammic.material.roughness = 1;
  }
  if (table) {
    table.material.roughness = 0.5;
    table.material.metalness = 0;
  }
  // get the element that is a place holder for where we want to
  // draw the scene
  const element = scene.userData.element;

  // get its position relative to the page's viewport
  const rect = element.getBoundingClientRect();

  // check if it's offscreen. If so skip it
  if (
    rect.bottom < 0 ||
    rect.top > renderer.domElement.clientHeight ||
    rect.right < 0 ||
    rect.left > renderer.domElement.clientWidth
  ) {
    return; // it's off screen
  }

  // set the viewport
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  const left = rect.left;
  const bottom = renderer.domElement.clientHeight - rect.bottom;

  renderer.setViewport(left, bottom, width, height);
  renderer.setScissor(left, bottom, width, height);

  const controls = scene.userData.controls;

  // console.log(controls);
  //camera.aspect = width / height; // not changing in this example
  //camera.updateProjectionMatrix();
  controls.update();

  composer.render();
};
const excute = () => {
  init();
  animate();
};
// while (loaded != 1);
document.onload = excute();
