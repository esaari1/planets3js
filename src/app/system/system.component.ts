import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

// @ts-ignore
import mercury from '../../assets/planets/mercury.json';
// @ts-ignore
import venus from '../../assets/planets/venus.json';
// @ts-ignore
import earth from '../../assets/planets/earth.json';
// @ts-ignore
import mars from '../../assets/planets/mars.json';
// @ts-ignore
import jupiter from '../../assets/planets/jupiter.json';
// @ts-ignore
import saturn from '../../assets/planets/saturn.json';
// @ts-ignore
import uranus from '../../assets/planets/uranus.json';
// @ts-ignore
import neptune from '../../assets/planets/neptune.json';
// @ts-ignore
import pluto from '../../assets/planets/pluto.json';
// @ts-ignore
import sunV from '../shaders/sun.vert';
// @ts-ignore
import sunF from '../shaders/sun.frag';
// @ts-ignore
import sunGlowV from '../shaders/sunGlow.vert';
// @ts-ignore
import sunGlowF from '../shaders/sunGlow.frag';

import moment from 'moment-es6';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

import { TROPICAL_YEAR } from '../constants';
import { calculateLocation } from './orbit';

@Component({
  selector: 'system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef;

  scale = 0.000001;
  planetScale = 0.0015;

  pointer = new THREE.Vector2();
  sunMesh;
  selectables = [];
  selectedObject = undefined;

  ngOnInit() {
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
  }

  ngAfterViewInit() {
    this.drawInnerSystem();
  }

  drawInnerSystem() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(0, 0, 200);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas.nativeElement
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    scene.add(this.path(mercury));
    scene.add(this.path(venus));
    scene.add(this.path(earth));
    scene.add(this.path(mars));
    scene.add(this.path(jupiter));
    scene.add(this.path(saturn));
    scene.add(this.path(uranus));
    scene.add(this.path(neptune));
    scene.add(this.path(pluto));
    scene.add(this.sun());

    const controls = new OrbitControls(camera, renderer.domElement);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new SMAAPass(scene, camera));

    const raycaster = new THREE.Raycaster();
    const t = this;

    const light = new THREE.PointLight(0xffffff, 1, 0);
    scene.add(light);

    let time = 0.0;

    animate();

    function animate() {
      t.sunMesh.material.uniforms.time.value = time;
      raycaster.setFromCamera(t.pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        intersects.forEach(i => {
          if (t.selectables.indexOf(i.object.uuid) >= 0) {
            if (t.selectedObject !== undefined && t.selectedObject.uuid !== i.object.uuid) {
              t.selectedObject.material.color.setRGB(1, 1, 1);
              t.selectedObject = undefined;
            }
            i.object.material.color.setRGB(0.3, 0.7, 0.8);
            t.selectedObject = i.object;
          }
        });
      } else {
        if (t.selectedObject !== undefined) {
          t.selectedObject.material.color.setRGB(1, 1, 1);
          t.selectedObject = undefined;
        }
      }

      requestAnimationFrame(animate);
      controls.update();
      composer.render();

      time += 0.0005;
    }
  }

  onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  onClick(event) {
    console.log(this.selectedObject);
  }

  sun() {
    const sphere = new THREE.SphereGeometry(695500.0 * this.scale * 25, 50, 50);
    const material = new THREE.ShaderMaterial({
      vertexShader: sunV,
      fragmentShader: sunF,
      uniforms: {
        time: {
          value: 1
        }
      },
      transparent: true
    });
    const sun = new THREE.Mesh(sphere, material);
    this.sunMesh = sun;

    const glow = new THREE.SphereGeometry(695500.0 * this.scale * 35, 50, 50);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: sunGlowV,
      fragmentShader: sunGlowF,
      //blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const glowMesh = new THREE.Mesh(glow, glowMat);

    const group = new THREE.Group();
    group.add(sun);
    group.add(glowMesh);

    return group;
  }

  path(orbit) {
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 40,
    });

    const vertices = [];
    const colors = [];

    const numPoints = orbit.Period * TROPICAL_YEAR;
    const colorPoints = numPoints * 2;

    const epoch = moment([1990, 0, 1]);
    const now = moment(new Date());
    let day = now.diff(epoch, 'days');

    for (let i = 0; i < numPoints; i++) {
      const curr = calculateLocation(day, orbit, this.scale);
      vertices.push(curr.x, curr.y, curr.z);

      const r = Math.min((colorPoints - i) / colorPoints + 0.2, 1.0);
      const g = Math.min((colorPoints - i) / colorPoints + 0.1, 1.0);
      colors.push(r, g, 1.0);
      day++;
    }

    vertices.push(vertices[0], vertices[1], vertices[2]);
    colors.push(colors[0], colors[1], colors[2]);

    // Orbit path
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mesh = new THREE.Line(geometry, material);

    const map = new THREE.TextureLoader().load(`./assets/images/${orbit.Texture}`);

    // Planet
    const radius = orbit.Radius * this.planetScale;
    const sphere = new THREE.SphereGeometry(radius, 50, 50);
    const material2 = new THREE.MeshStandardMaterial({ map: map });
    const planet = new THREE.Mesh(sphere, material2);
    planet.position.set(vertices[0], vertices[1], vertices[2]);
    planet.renderOrder = 1;

    let secs = now.get('hours') * 3600;
    secs += now.get('seconds') * 60;
    secs += now.get('seconds');

    const p = secs / (24 * 3600);
    planet.rotateY(-p * Math.PI * 2);

    const group = new THREE.Group();
    group.add(mesh);
    group.add(planet);
    this.selectables.push(planet.uuid);

    return group;
  }
}
