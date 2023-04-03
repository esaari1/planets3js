import { Component, ElementRef, ViewChild } from '@angular/core';

import { setupUniforms } from '../constants';

import * as THREE from 'three';
import { OrbitControls } from '../OrbitControls.js';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';
// @ts-ignore
import mieV from '../shaders/mie.vert';
// @ts-ignore
import mieF from '../shaders/mie.frag';

@Component({
  selector: 'mars',
  templateUrl: './mars.component.html',
  styleUrls: ['./mars.component.scss']
})
export class MarsComponent {

  @ViewChild('canvas') canvas: ElementRef;

  atmosphere = {
    Kr: 0.0025,
    Km: 0.0010,
    ESun: 20.0,
    g: -0.950,
    innerRadius: 100,
    outerRadius: 101,
    wavelength: [0.41, 0.45, 0.5],
    scaleDepth: 0.25,
    mieScaleDepth: 0.1
  };

  surface: THREE.Mesh;
  sky: THREE.Mesh;

  ngOnInit() {
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
    this.surface.material.uniforms.v3LightPosition.value = light;
    this.sky.material.uniforms.v3LightPosition.value = light;
  }

  setupSurface() {
    const diffuse = new THREE.TextureLoader().load('./assets/images/Mars_4k.jpg');
    const normalMap = new THREE.TextureLoader().load('./assets/images/Mars-normalmap_4k.jpg');

    const uniforms = setupUniforms(this.atmosphere);
    uniforms['tDiffuse'] = {
      value: diffuse
    };
    uniforms['tNormalMap'] = {
      value: normalMap
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: mieV,
      fragmentShader: mieF,
    });

    const surface = new THREE.Mesh(new THREE.SphereGeometry(100, 128, 64), material);
    surface.geometry.computeTangents();

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
