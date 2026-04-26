// robot3d.js – three.js setup and animation for the 3D robot

(() => {
  const canvas = document.getElementById('robot-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 3);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 7);
  scene.add(directional);

  // Load GLTF model – using a public expressive robot model
  const loader = new THREE.GLTFLoader();
  const modelUrl = 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb';
  let robot;
  loader.load(
    modelUrl,
    (gltf) => {
      robot = gltf.scene;
      robot.scale.set(0.8, 0.8, 0.8);
      robot.position.y = -0.5;
      scene.add(robot);
    },
    undefined,
    (error) => {
      console.error('Error loading robot model:', error);
    }
  );

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (robot) {
      // Idle rotation
      robot.rotation.y += delta * 0.2;
      // Gentle bobbing
      robot.position.y = -0.5 + Math.sin(clock.elapsedTime * 1.5) * 0.05;
    }
    renderer.render(scene, camera);
  }
  animate();

  // Resize handling
  function onWindowResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onWindowResize);

  // Mouse interactivity – subtle tilt based on mouse position
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) - 0.5; // -0.5 to 0.5
    const y = ((e.clientY - rect.top) / rect.height) - 0.5;
    if (robot) {
      robot.rotation.x = y * 0.2;
      robot.rotation.z = x * 0.2;
    }
  });
})();
