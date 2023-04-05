import { Component, ElementRef, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { setupUniforms } from '../constants';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';

@Component({
  selector: 'app-jupiter',
  templateUrl: './jupiter.component.html',
  styleUrls: ['./jupiter.component.scss']
})
export class JupiterComponent {

  @ViewChild('canvas') canvas: ElementRef;

  atmosphere = {
    Kr: 0.0025,
    Km: 0.0010,
    ESun: 20.0,
    g: -0.950,
    innerRadius: 100,
    outerRadius: 101,
    wavelength: [0.650, 0.570, 0.475],
    scaleDepth: 0.25,
    mieScaleDepth: 0.1
  };

  light: THREE.Vector3;
  surface: THREE.Mesh;
  sky: THREE.Mesh;

  ngOnInit() {
    this.light = this.setupLight();
    this.surface = this.setupSurface();
    this.sky = this.setupSky();
  }

  ngAfterViewInit() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 190);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas.nativeElement
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const controls = new OrbitControls(camera, renderer.domElement);

    scene.add(this.light);
    scene.add(this.surface);
    scene.add(this.sky);

    const t = this;
    animate();

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
  }

  updateLight(light: THREE.Vector3) {
    //this.surface.material.uniforms.v3LightPosition.value = light;
    this.sky.material.uniforms.v3LightPosition.value = light;
    this.light.position.x = light.x;
    this.light.position.y = light.y;
    this.light.position.z = light.z;
  }

  setupLight() {
    const light = new THREE.DirectionalLight({
      position: new THREE.Vector3(1, 1, 0)
    });

    return light;
  }

  setupSurface() {
    const diffuse = new THREE.TextureLoader().load('./assets/images/jupiter2_4k.jpg');
    // const normalMap = new THREE.TextureLoader().load('./assets/images/Mars-normalmap_4k.jpg');

    // const uniforms = setupUniforms(this.atmosphere);
    // uniforms['tDiffuse'] = {
    //   value: diffuse
    // };
    // uniforms['tNormalMap'] = {
    //   value: normalMap
    // };

    // const material = new THREE.ShaderMaterial({
    //   uniforms: uniforms,
    //   vertexShader: mieV,
    //   fragmentShader: mieF,
    // });

    const material = new THREE.MeshStandardMaterial({
      map: diffuse
    });

    const surface = new THREE.Mesh(new THREE.SphereGeometry(100, 128, 64), material);

    return surface;
  }

  setupSky() {
    const geometry = new THREE.SphereGeometry(101, 500, 500);

    const material = new THREE.ShaderMaterial({
      vertexShader: rayleighV,
      fragmentShader: rayleighF,
      uniforms: setupUniforms(this.atmosphere),
      side: THREE.BackSide,
      transparent: true
    });

    return new THREE.Mesh(geometry, material);
  }
}
