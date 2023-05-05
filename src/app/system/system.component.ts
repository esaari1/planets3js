import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

// @ts-ignore
import system from '../../assets/planets/system.json';
// @ts-ignore
import sunV from '../shaders/sun.vert';
// @ts-ignore
import sunF from '../shaders/sun.frag';
// @ts-ignore
import sunGlowV from '../shaders/sunGlow.vert';
// @ts-ignore
import sunGlowF from '../shaders/sunGlow.frag';
// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';
// @ts-ignore
import mieV from '../shaders/mie.vert';
// @ts-ignore
import mieF from '../shaders/mie.frag';

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

import { DEG_TO_RAD, TROPICAL_YEAR, atmosphereUniforms } from '../constants';
import { AnimatedMaterial, isAnimateUpdateable } from '../models/animate_updateable';
import { daysSinceEpoch, timeSinceEpoch } from '../util/time';
import { moonOrbit, planetOrbit } from './orbit';
import { Atmosphere, PlanetMarker, isCameraUpdateable } from '../models/camera_updateable';

@Component({
  selector: 'system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef;

  scene: THREE.Scene;
  camera: THREE.Camera;
  controls: OrbitControls;
  composer: EffectComposer;
  raycaster: THREE.Raycaster;

  selectables = [];
  selectedObject = undefined;
  time = 0.0;

  currentSystem = -1;

  colors = [
    '#9768ac',
    '#b07919',
    '#09c',
    '#9a4e19',
    '#da8b72',
    '#d5c187',
    '#68ccda',
    '#708ce3',
    '#f7f4df'
  ]

  ngOnInit() {
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('click', this.onClick.bind(this));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 10, 40000);

    this.raycaster = new THREE.Raycaster();

    const days = timeSinceEpoch(new Date(1979, 1, 26, 16, 0, 50));
    const pos = moonOrbit(system.sun, system.planets[2].moons[0], days);
    console.log(pos);
  }

  ngAfterViewInit() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas.nativeElement
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.minDistance = 100;
    this.controls.maxDistance = 30000;
    this.controls.addEventListener( 'change', this.controlsUpdate.bind(this) );
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new SMAAPass(this.scene, this.camera));

    this.renderScene();
  }

  controlsUpdate() {
    this.scene.traverse(this.cmeraCallback.bind(this));
  }

  cmeraCallback(e) {
    if (isCameraUpdateable(e)) {
      e.update(this.controls);
    }
  }

  renderScene() {
    if (this.currentSystem === -1) {
      this.drawInnerSystem();
    } else {
      this.drawSubsystem(system.planets[this.currentSystem]);
    }
  }

  drawInnerSystem() {
    this.camera.position.set(0, 200, 500);

    const day = daysSinceEpoch();
    system.planets.forEach((planet, i) => this.createPlanetMarker(day, planet, system.config.orbitScale, this.colors[i]));
    this.createSun();

    // Lights
    this.scene.add(new THREE.PointLight(0xffffff, 1, 0));
    this.scene.add(new THREE.AmbientLight(0x303030));

    this.animate();
  }

  drawSubsystem(subsystem) {
    this.camera.position.set(0, 100, 220);

    const day = daysSinceEpoch();
    const curr = planetOrbit(day, subsystem).multiplyScalar(-1).normalize();

    this.createPlanet(day, subsystem, subsystem.config.orbitScale, subsystem.config.planetScale, curr, true);

    subsystem.moons.forEach(moon => {
      this.createPlanet(day, moon, subsystem.config.orbitScale, subsystem.config.planetScale);
    });

    const light = new THREE.DirectionalLight();
    light.position.x = curr.x;
    light.position.y = curr.y;
    light.position.z = curr.z;
    this.scene.add(light);

    this.scene.add(new THREE.AmbientLight(0x303030));

    this.animate();
  }

  // Called for each object in the scene during animation loop.
  // Check if object implements Updateable interface and calls update if it does.
  animateCallback(e) {
    if (isAnimateUpdateable(e)) {
      e.update(this.time);
    }
  }

  animate() {
    this.scene.traverse(this.animateCallback.bind(this));

    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.composer.render();

    this.time += 0.00025;
  }

  onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    if (event.buttons === 0) {
      const mouseLoc = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      this.raycaster.setFromCamera(mouseLoc, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children);

      if (intersects.length > 0) {
        intersects.forEach(i => {
          if (this.selectables.indexOf(i.object.uuid) >= 0) {
            if (this.selectedObject !== undefined && this.selectedObject.uuid !== i.object.uuid) {
              this.selectedObject.material.color.setRGB(1, 1, 1);
              this.selectedObject = undefined;
            }
            i.object.material.color.setRGB(0.3, 0.7, 0.8);
            this.selectedObject = i.object;
          }
        });
      } else {
        if (this.selectedObject !== undefined) {
          this.selectedObject.material.color.setRGB(1, 1, 1);
          this.selectedObject = undefined;
        }
      }
    }
  }

  onClick(event) {
    //console.log(this.selectedObject);
  }

  createSun() {
    const sphere = new THREE.SphereGeometry(this.scalePlanet(695500.0, system.config.planetScale) * 0.02, 50, 50);
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
    const sun = new AnimatedMaterial(sphere, material);

    const glow = new THREE.SphereGeometry(this.scalePlanet(695500.0, system.config.planetScale) * 0.027, 50, 50);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: sunGlowV,
      fragmentShader: sunGlowF,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      //transparent: true
    });
    const glowMesh = new THREE.Mesh(glow, glowMat);

    const group = new THREE.Group();
    group.add(sun);
    group.add(glowMesh);

    this.scene.add(group);
  }

  createOrbit(config, scale, color) {
    // Line material
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 40,
    });

    const vertices = [];
    const colors = [];

    const numPoints = config.Period * TROPICAL_YEAR;

    let day = daysSinceEpoch();

    const rgb = this.hexToRgb(color);

    // Creste points and colors
    for (let i = 0; i < numPoints; i++) {
      const curr = this.scaleOrbit(planetOrbit(day, config), scale);
      vertices.push(curr.x, curr.y, curr.z);

      const v = i / numPoints + 0.15;
      colors.push(rgb.r * v, rgb.g * v, rgb.b * v);
      day++;
    }

    vertices.push(vertices[0], vertices[1], vertices[2]);
    colors.push(colors[0], colors[1], colors[2]);

    // Orbit path
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    this.scene.add(new THREE.Line(geometry, material));
  }

  scalePlanet(s, config) {
    return config.toLow + ((s - config.fromLow) * (config.toHigh - config.toLow) / (config.fromHigh - config.fromLow));
  }

  scaleOrbit(s: THREE.Vector3, scalar): THREE.Vector3 {
    return s.multiplyScalar(scalar);
    //return s.multiplyScalar(0.0002);
  }

  createPlanetMarker(day, config, orbitScale, color) {
    const position = this.scaleOrbit(planetOrbit(day, config), orbitScale);
    const mesh = new PlanetMarker(config.Name, color, position);
    this.scene.add(mesh);
    this.createOrbit(config, orbitScale, color);
    mesh['children'].forEach(c => this.selectables.push(c.uuid));
  }

  createPlanet(day, config, orbitScale, planetScale, lightDir = null, isTopLevel: boolean = false) {

    // Planet
    const radius = this.scalePlanet(config.Radius, planetScale);
    const sphere = new THREE.SphereGeometry(radius, 50, 50);

    let planet = undefined;
    let material = undefined;

    if (config.atmosphere && isTopLevel) {
      config.atmosphere.innerRadius = radius;
      config.atmosphere.outerRadius = radius * config.atmosphere.multiplier;

      const uniforms = atmosphereUniforms(config.atmosphere);
      uniforms['tDiffuse'] = {
        value: new THREE.TextureLoader().load(`./assets/images/${config.Texture}`)
      };
      uniforms['tNormalMap'] = {
        value: new THREE.TextureLoader().load('./assets/images/earth-normal.jpg')
      };

      material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: mieV,
        fragmentShader: mieF,
      });
      planet = new Atmosphere(sphere, material, this.camera.position);
    } else {
      material = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(`./assets/images/${config.Texture}`)
      });
      planet = new THREE.Mesh(sphere, material);
    }

    planet.geometry.computeTangents();

    // let secs = now.get('hours') * 3600;
    // secs += now.get('seconds') * 60;
    // secs += now.get('seconds');

    //const p = secs / (24 * 3600);
    //planet.rotateY(-p * Math.PI * 2);

    const group = new THREE.Group();
    group.add(planet);

    const location = planetOrbit(day, config);

    if (config.Rings) {
      group.add(this.createRings(config));
    }

    if (config.atmosphere && isTopLevel) {
      if (lightDir == null) {
        lightDir = location.multiplyScalar(-1).normalize();
      }

      planet.material.uniforms.v3LightPosition.value = lightDir;
      group.add(this.createAtmosphere(config.atmosphere, lightDir));
    }

    if (config.Tilt) {
      group.rotateX(config.Tilt * DEG_TO_RAD);
    }

    this.scene.add(group);

    if (!isTopLevel) {
      const curr = this.scaleOrbit(planetOrbit(day, config), orbitScale);
      group.position.set(curr.x, curr.y, curr.z);
      this.createOrbit(config, orbitScale, '');
    }
  }

  createRings(config) {
    const innerR = this.scalePlanet(config.Rings.Inner, system.config.planetScale);
    const outerR = this.scalePlanet(config.Rings.Outer, system.config.planetScale);
    const centerR = (innerR + outerR) / 2;
    const geometry = new THREE.RingGeometry(innerR, outerR, 512);

    const pos = geometry.attributes.position;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      geometry.attributes.uv.setXY(i, v3.length() < centerR ? 0 : 1, 1);
    }

    const material = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(`./assets/images/${config.Rings.Texture}`),
      // uniforms: {
      //   tDiffuse: {
      //     value: new THREE.TextureLoader().load(`./assets/images/${config.Rings.Texture}`)
      //   },
      //   lightDir: {
      //     value: new THREE.Vector3(0, 0, 0).normalize()
      //   },
      //   radius2: {
      //     value: config.Radius * config.Radius
      //   }
      // },
      // vertexShader: ringsV,
      // fragmentShader: ringsF,
      transparent: true,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(-Math.PI / 2.0);

    return mesh;
  }

  createAtmosphere(atmosphere, lightDir) {
    const geometry = new THREE.SphereGeometry(atmosphere.outerRadius, 500, 500);

    const uniforms = atmosphereUniforms(atmosphere);
    uniforms.v3LightPosition.value = lightDir;

    const material = new THREE.ShaderMaterial({
      vertexShader: rayleighV,
      fragmentShader: rayleighF,
      uniforms: uniforms,
      side: THREE.BackSide,
      transparent: true
    });

    return new Atmosphere(geometry, material, this.camera.position);
  }

  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  }
}
