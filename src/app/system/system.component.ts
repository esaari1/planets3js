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

import * as moment from 'moment';
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { AU_TO_KM, DEG_TO_RAD, RAD_TO_DEG, TROPICAL_YEAR, epsilon } from '../constants';

@Component({
  selector: 'system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef;

  scale = 0.000001;
  planetScale = 0.001;

  pointer = new THREE.Vector2();

  ngOnInit() {
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
  }

  ngAfterViewInit() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(0, 4000, 7000);

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

    animate();

    function animate() {
      raycaster.setFromCamera(t.pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      scene.children.forEach(c => {
        c.children.forEach(c2 => {
          c2.material.color.setRGB(1, 1, 1);
        })
      })

      if (intersects.length > 0) {
        intersects.forEach(i => {
          i.object.material.color.setRGB(0, 0, 1);
        });
      }

      requestAnimationFrame(animate);
      controls.update();
      composer.render();
    }
  }

  onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  sun() {
    const sphere = new THREE.SphereGeometry(695500.0 * this.scale * 10, 50, 50);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sphere, material);
    return sun;
  }

  path(orbit) {
    const material = new THREE.LineDashedMaterial({
      color: 0xFFFFFF,
      linewidth: 1,
    });

    const vertices = [];

    const numPoints = orbit.Period * TROPICAL_YEAR;

    const epoch = moment([1990, 0, 1]);
    const now = moment(new Date());
    let day = now.diff(epoch, 'days');

    for (let i = 0; i < numPoints; i++) {
      const curr = this.calculateLocation(day, orbit);
      vertices.push(curr.x, curr.y, curr.z);
      day++;
    }

    vertices.push(vertices[0], vertices[1], vertices[2]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const mesh = new THREE.Line(geometry, material);

    const group = new THREE.Group();
    group.add(mesh);

    const sphere = new THREE.SphereGeometry(orbit.Radius * this.planetScale, 50, 50);
    const material2 = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const planet = new THREE.Mesh(sphere, material2);
    planet.position.set(vertices[0], vertices[1], vertices[2]);

    group.add(planet);

    return group;
  }

  calculateLocation(days: number, orbit) {
    // Calculate the mean anomaly
    const M = (360.0 / TROPICAL_YEAR) * (days / orbit.Period) + orbit.LongAtEpoch - orbit.LongOfPerihelion;

    // Find solution for Kepler's Law
    const E = this.kepler(M, orbit.eccentricity);

    // Find tan(v/2)
    const tanV = Math.pow(((1.0 + orbit.Eccentricity) / (1.0 - orbit.Eccentricity)), 0.5) * Math.tan(E / 2.0);

    // Take inverse tangent and multiply by 2 to get v. Convert from radians to degrees.
    const v = Math.atan(tanV) * 2.0 * RAD_TO_DEG;

    // Calculate heleocentric longitude
    let l = v + orbit.LongOfPerihelion;
    l = this.adjustBearing(l);

    // Calculate length of radius vector
    const r = (orbit.SemiMajorAxis * (1.0 - Math.pow(orbit.Eccentricity, 2.0))) / (1.0 + orbit.Eccentricity * Math.cos(v * DEG_TO_RAD));

    // Calculate the heleocentric latitude
    let latitude = Math.asin(Math.sin((l - orbit.AscendingNode) * DEG_TO_RAD) * Math.sin(orbit.Inclination * DEG_TO_RAD));
    latitude = latitude * RAD_TO_DEG;

    // Calculate projected heleocentric longitude
    const x = Math.cos((l - orbit.AscendingNode) * DEG_TO_RAD);
    const y = Math.sin((l - orbit.AscendingNode) * DEG_TO_RAD) * Math.cos(orbit.Inclination * DEG_TO_RAD);
    let longitude = Math.atan2(y, x);
    longitude = longitude * RAD_TO_DEG + orbit.AscendingNode;
    longitude = this.adjustBearing(longitude);

    // Calculate length of projected radius vector
    let radius = r * Math.cos(latitude * DEG_TO_RAD);
    radius = radius * AU_TO_KM * this.scale;

    latitude = latitude * DEG_TO_RAD;
    longitude = longitude * DEG_TO_RAD;
    const cosLat = Math.cos(latitude);
    return new THREE.Vector3(cosLat * Math.cos(longitude) * radius, Math.sin(latitude) * radius, -cosLat * Math.sin(longitude) * radius);
  }

  kepler(M: number, eccentricity: number): number {
    M = this.adjustBearing(M);
    M = M * DEG_TO_RAD;
    let E = M;
    let g = E - (eccentricity * Math.sin(E)) - M;

    while (g > epsilon) {
      const deltaE = g / (1.0 - eccentricity * Math.cos(E));
      E = E - deltaE;
      g = E - (eccentricity * Math.sin(E)) - M;
    }
    return E;
  }

  adjustBearing(b: number): number {
    while (b < 0) {
      b += 360.0;
    }
    while (b > 360.0) {
      b -= 360.0;
    }

    return b;
  }
}
