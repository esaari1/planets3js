import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { atmosphereUniforms } from '../util/util';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';
// @ts-ignore
import mieV from '../shaders/mie.vert';
// @ts-ignore
import mieF from '../shaders/earth.frag';
// @ts-ignore
import earth from '../../assets/planets/earth.json';

@Component({
  selector: 'earth',
  templateUrl: './earth.component.html',
  styleUrls: ['./earth.component.scss']
})
export class EarthComponent implements AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef;

  surface: THREE.Mesh;
  sky: THREE.Mesh;

  ngOnInit() {
    earth.atmosphere.innerRadius = 100;
    earth.atmosphere.outerRadius = 100 * earth.atmosphere.multiplier;
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
    const diffuse = new THREE.TextureLoader().load('./assets/images/8081_earthmap4k.jpg');
    const diffuseNight = new THREE.TextureLoader().load('./assets/images/8081_earthlights4k.jpg');
    const clouds = new THREE.TextureLoader().load('./assets/images/8081_earthhiresclouds4K.jpg');
    const normalMap = new THREE.TextureLoader().load('./assets/images/earth-normal.jpg');
    const specularMap = new THREE.TextureLoader().load('./assets/images/Ocean_Mask.png');

    const uniforms = atmosphereUniforms(earth.atmosphere);
    uniforms['tDiffuse'] = {
      value: diffuse
    };
    uniforms['tDiffuseNight'] = {
      value: diffuseNight
    };
    uniforms['tClouds'] = {
      value: clouds
    };
    uniforms['tNormalMap'] = {
      value: normalMap
    };
    uniforms['tSpecularMap'] = {
      value: specularMap
    }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: mieV,
      fragmentShader: mieF,
    });

    const surface = new THREE.Mesh(new THREE.SphereGeometry(100, 128, 64), material);
    surface.geometry.computeTangents();

    return surface;
  }

  setupClouds() {
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('./assets/images/8081_earthhiresclouds4K.jpg'),
      blending: THREE.CustomBlending,
      blendEquation: THREE.MaxEquation
    });

    const clouds = new THREE.Mesh(new THREE.SphereGeometry(102, 500, 500), material);
    return clouds;
  }

  setupSky() {
    const geometry = new THREE.SphereGeometry(102.5, 500, 500);

    const material = new THREE.ShaderMaterial({
      vertexShader: rayleighV,
      fragmentShader: rayleighF,
      uniforms: atmosphereUniforms(earth.atmosphere),
      side: THREE.BackSide,
      transparent: true
    });

    return new THREE.Mesh(geometry, material);
  }
}
