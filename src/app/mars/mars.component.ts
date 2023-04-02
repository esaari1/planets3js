import { Component, ElementRef, ViewChild } from '@angular/core';

import { DEG_TO_RAD, setupUniforms } from '../constants';

import * as dat from 'dat.gui';
import * as THREE from 'three';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';
// @ts-ignore
import mieV from '../shaders/mie.vert';
// @ts-ignore
import mieF from '../shaders/mars.frag';

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

  settings = {
    lightPosition: {
      theta: 0,
      phi: 0,
      x: 0.5,
      y: 0.25,
      z: 0.5
    },
    cameraRotation: {
      theta: 0,
      phi: 23.4
    },
    animate: false
  };

  surface;
  sky;

  ngOnInit() {
    const gui = new dat.GUI();

    gui.add(this.settings, 'animate');

    const lightF = gui.addFolder('Light Rotation');
    lightF.open();
    lightF.add(this.settings.lightPosition, 'theta', 0, 360, 0.001).onChange(() => {
      this.updateLight();
    });
    lightF.add(this.settings.lightPosition, 'phi', 0, 180, 0.001).onChange(() => {
      this.updateLight();
    });

    const cameraF = gui.addFolder('Camera Position');
    cameraF.open();
    cameraF.add(this.settings.cameraRotation, 'theta', 0, 360, 0.001);
    cameraF.add(this.settings.cameraRotation, 'phi', -90, 90, 0.001);
  }

  updateLight() {
    const light = this.calculateLight();
    this.surface.material.uniforms.v3LightPosition.value = light;
    this.sky.material.uniforms.v3LightPosition.value = light;
  }

  calculateLight() {
    const theta = this.settings.lightPosition.theta * DEG_TO_RAD;
    const phi = this.settings.lightPosition.phi * DEG_TO_RAD;

    const s = new THREE.Spherical(1, phi, theta);
    const v = new THREE.Vector3();
    v.setFromSpherical(s);

    return v.normalize();
  }

  ngAfterViewInit() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas.nativeElement
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    this.surface = this.setupSurface();
    scene.add(this.surface);

    this.sky = this.setupSky();
    scene.add(this.sky);

    const t = this;
    animate();

    function animate() {
      requestAnimationFrame(animate);

      const eye = new THREE.Vector3(0, 0, 100.0 * 1.9);

      if (t.settings.animate) {
        t.settings.cameraRotation.theta += 0.05;
      }

      const euler = new THREE.Euler(
        -t.settings.cameraRotation.phi * DEG_TO_RAD,
        t.settings.cameraRotation.theta * DEG_TO_RAD, 0);
      const matrix = new THREE.Matrix4().makeRotationFromEuler(euler);
      eye.applyMatrix4(matrix);

      camera.position.x = eye.x;
      camera.position.y = eye.y;
      camera.position.z = eye.z;

      camera.rotation.x = -24.0 * DEG_TO_RAD;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      renderer.render(scene, camera);
    }
  }

  setupSurface() {
    const diffuse = new THREE.TextureLoader().load('./assets/images/Mars_4k.jpg');
    const normalMap = new THREE.TextureLoader().load('./assets/images/Mars-normalmap_4k.jpg');

    const uniforms = setupUniforms(this.atmosphere, this.calculateLight());
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
      uniforms: setupUniforms(this.atmosphere, this.calculateLight()),
      side: THREE.BackSide,
      transparent: true
    });

    return new THREE.Mesh(geometry, material);
  }
}
