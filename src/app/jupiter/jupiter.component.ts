import { Component, ElementRef, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { atmosphereUniforms } from '../util/util';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';
// @ts-ignore
import jupiter from '../../assets/planets/jupiter.json';

@Component({
  selector: 'jupiter',
  templateUrl: './jupiter.component.html',
  styleUrls: ['./jupiter.component.scss']
})
export class JupiterComponent {

  @ViewChild('canvas') canvas: ElementRef;

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
    //scene.add(this.sky);

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

    // const uniforms = atmosphereUniforms(this.atmosphere);
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
      uniforms: atmosphereUniforms(jupiter.atmosphere),
      side: THREE.BackSide,
      transparent: true
    });

    return new THREE.Mesh(geometry, material);
  }
}
