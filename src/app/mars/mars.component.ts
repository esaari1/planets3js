import { Component, ElementRef, ViewChild } from '@angular/core';

import { atmosphereUniforms } from '../util/util';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';
// @ts-ignore
import mieV from '../shaders/mie.vert';
// @ts-ignore
import mieF from '../shaders/mie.frag';
// @ts-ignore
import mars from '../../assets/planets/mars.json';

@Component({
  selector: 'mars',
  templateUrl: './mars.component.html',
  styleUrls: ['./mars.component.scss']
})
export class MarsComponent {

  @ViewChild('canvas') canvas: ElementRef;

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
      t.surface.material.uniforms.fCameraHeight2.value = camera.position.distanceToSquared(t.surface.position);
      t.sky.material.uniforms.fCameraHeight2.value = camera.position.distanceToSquared(t.surface.position);

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
    const diffuse = new THREE.TextureLoader().load(`./assets/images/${mars.Texture}`);
    const normalMap = new THREE.TextureLoader().load('./assets/images/Mars-normalmap_4k.jpg');

    const uniforms = atmosphereUniforms(mars.atmosphere);
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
      uniforms: atmosphereUniforms(mars.atmosphere),
      side: THREE.BackSide,
      transparent: true
    });

    return new THREE.Mesh(geometry, material);
  }
}
