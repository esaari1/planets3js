import { Component, ElementRef, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

import { atmosphereUniforms } from '../constants';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';
// @ts-ignore
import saturnV from '../shaders/saturn.vert';
// @ts-ignore
import saturnF from '../shaders/saturn.frag';
// @ts-ignore
import ringsV from '../shaders/rings.vert';
// @ts-ignore
import ringsF from '../shaders/rings.frag';
// @ts-ignore
import saturn from '../../assets/planets/saturn.json';

@Component({
  selector: 'app-saturn',
  templateUrl: './saturn.component.html',
  styleUrls: ['./saturn.component.scss']
})
export class SaturnComponent {

  @ViewChild('canvas') canvas: ElementRef;

  surface: THREE.Mesh;
  rings: THREE.Mesh;
  sky: THREE.Mesh;
  ringsTexture;

  RINGS_INNER = 123.61;
  RINGS_OUTER = 232.66;

  ngOnInit() {
    this.ringsTexture = new THREE.TextureLoader().load('./assets/images/saturn-rings.png');

    this.surface = this.setupSurface();
    this.sky = this.setupSky();
    this.rings = this.setupRings();
  }

  ngAfterViewInit() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 350);
    //camera.up.set(0, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas.nativeElement
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const controls = new OrbitControls(camera, renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new SMAAPass(scene, camera));

    scene.add(this.surface);
    //   scene.add(this.sky);
    scene.add(this.rings);

    animate();

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      composer.render();
    }
  }

  updateLight(light: THREE.Vector3) {
    this.sky.material.uniforms.v3LightPosition.value = light;
    this.surface.material.uniforms.lightDir.value = light;
    this.rings.material.uniforms.lightDir.value = light;
  }

  setupSurface() {
    const diffuse = new THREE.TextureLoader().load(`./assets/images/${saturn.Texture}`);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: {
          value: diffuse
        },
        ringsTexture: {
          value: this.ringsTexture
        },
        lightDir: {
          value: new THREE.Vector3(0, 1, 1)
        },
        ringsNormal: {
          value: new THREE.Vector3(0, 1, 0)
        },
        ringsRadius: {
          value: new THREE.Vector2(this.RINGS_INNER, this.RINGS_OUTER)
        }
      },
      vertexShader: saturnV,
      fragmentShader: saturnF,
      transparent: true
    });

    const surface = new THREE.Mesh(new THREE.SphereGeometry(100, 128, 64), material);

    return surface;
  }

  setupSky() {
    const geometry = new THREE.SphereGeometry(saturn.atmosphere.outerRadius, 500, 500);

    const material = new THREE.ShaderMaterial({
      vertexShader: rayleighV,
      fragmentShader: rayleighF,
      uniforms: atmosphereUniforms(saturn.atmosphere),
      side: THREE.BackSide,
      transparent: true
    });

    return new THREE.Mesh(geometry, material);
  }

  setupRings() {
    const geometry = new THREE.RingGeometry(this.RINGS_INNER, this.RINGS_OUTER, 512);

    const pos = geometry.attributes.position;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      geometry.attributes.uv.setXY(i, v3.length() < 200 ? 0 : 1, 1);
    }

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: {
          value: this.ringsTexture
        },
        lightDir: {
          value: new THREE.Vector3(0, 1, 1).normalize()
        },
        radius2: {
          value: 100.0 * 100.0
        }
      },
      vertexShader: ringsV,
      fragmentShader: ringsF,
      transparent: true,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(-Math.PI / 2.0);
    return mesh;
  }
}
