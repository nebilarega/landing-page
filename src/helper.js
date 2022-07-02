const modelsMovenment = (specificModel) => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  specificModel.children[0].rotation.y += 0.01 * deltaTime;
};
const generateCup = (scene) => {
  const particleGeometery = new THREE.BufferGeometry();
  const circle = 60;
  const height = 30;
  const positions = new Float32Array(circle * height * 3);
  let mainCounter = 0;
  const posSize = circle * height * 3;
  for (let i = 0; i < height; i++) {
    let counter = 0;
    for (let j = 0; j < posSize / height; j += 3) {
      positions[mainCounter] =
        0.7 *
        (i / height) *
        Math.sin((Math.PI * 2 * counter) / circle).toFixed(2);
      positions[mainCounter + 1] = 0.7 * Math.pow(i / height, 3) - 0.5;
      positions[mainCounter + 2] =
        0.7 *
          (i / height) *
          Math.cos((Math.PI * 2 * counter) / circle).toFixed(2) -
        0.5;
      counter += 1;
      mainCounter += 3;
    }
  }
  particleGeometery.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const particleMaterial = new THREE.PointsMaterial();
  particleMaterial.size = 1;
  particleMaterial.sizeAttenuation = false;
  // particleMaterial.color = new THREE.Color(0xffffff);
  const particleSystem = new THREE.Points(particleGeometery, particleMaterial);
  scene.add(particleSystem);
};
