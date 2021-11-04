import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//galaxy
const parameters = {
    count: 10000,
    particleSize: 0.02,
    galaxyRadius: 5,
    galaxyBranches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
}
let particlesGeometry = null,
    particlesMaterials = null,
    particles = null;

const generateGalaxy = () => {

    //clear
    if (particles !== null) {
        particlesGeometry.dispose()
        particlesMaterials.dispose()
        scene.remove(particles)
    }

    particlesGeometry = new THREE.BufferGeometry();
    particlesMaterials = new THREE.PointsMaterial({
        size: parameters.particleSize,
        sizeAttenuation: true,
        depthWrite: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,

    });
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {

        const i3 = i * 3;
//position
        const radius = Math.random() * parameters.galaxyRadius;
        const branchesAngle = (i % parameters.galaxyBranches) / parameters.galaxyBranches * Math.PI * 2;
        const spinAngle = radius * parameters.spin

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1);

        positions[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ;

        //colors
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius/ parameters.galaxyRadius)


        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    particles = new THREE.Points(particlesGeometry, particlesMaterials);
    scene.add(particles)
}

generateGalaxy()

gui.add(parameters, 'count', 500, 50000, 100).onFinishChange(generateGalaxy);
gui.add(parameters, 'particleSize', .001, .1, .001).onFinishChange(generateGalaxy);
gui.add(parameters, 'galaxyRadius', .01, 20, .01).onFinishChange(generateGalaxy);
gui.add(parameters, 'galaxyBranches', 3, 20, 1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin', -5, 5, .001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness', 0, 2, .001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower', 0, 2, .001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()