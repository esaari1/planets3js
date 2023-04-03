import { Component, ElementRef, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from '../OrbitControls.js';

import { setupUniforms } from '../constants';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';

@Component({
  selector: 'app-saturn',
  templateUrl: './saturn.component.html',
  styleUrls: ['./saturn.component.scss']
})
export class SaturnComponent {

  @ViewChild('canvas') canvas: ElementRef;

  atmosphere = {
    Kr: 0.0025,
    Km: 0.0010,
    ESun: 20.0,
    g: -0.950,
    innerRadius: 100,
    outerRadius: 101.5,
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
    camera.position.set(0, 0, 350);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas.nativeElement
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.size = new THREE.Vector2(1024, 1024);

    const controls = new OrbitControls(camera, renderer.domElement);

    scene.add(this.light);
    scene.add(this.surface);
    //scene.add(this.sky);
    //scene.add(this.setupRings());
    const [mesh, mesh2] = this.setupRings();
    scene.add(mesh);
    scene.add(mesh2);

    const helper = new THREE.CameraHelper(this.light.shadow.camera);
    scene.add(helper);

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
    // this.light.position.x = light.x;
    // this.light.position.y = light.y;
    // this.light.position.z = light.z;

    this.light.shadow.camera.updateProjectionMatrix();
  }

  setupLight() {
    const light = new THREE.DirectionalLight({
      position: new THREE.Vector3(0, 200, 0)
    });

    light.castShadow = true;
    light.position.x = 300;
    light.position.y = -100;
    light.shadow.camera.far = 1000;
    light.shadow.camera.top = 300;
    light.shadow.camera.bottom = -300;
    light.shadow.camera.left = -300;
    light.shadow.camera.right = 300;

    return light;
  }

  setupSurface() {
    const diffuse = new THREE.TextureLoader().load('./assets/images/2k_saturn.jpg');
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

    const material = new THREE.MeshLambertMaterial({
      map: diffuse
    });

    const surface = new THREE.Mesh(new THREE.SphereGeometry(100, 128, 64), material);
    surface.castShadow = true;
    surface.receiveShadow = true;

    return surface;
  }

  setupSky() {
    const geometry = new THREE.SphereGeometry(this.atmosphere.outerRadius, 500, 500);

    const material = new THREE.ShaderMaterial({
      vertexShader: rayleighV,
      fragmentShader: rayleighF,
      uniforms: setupUniforms(this.atmosphere),
      side: THREE.BackSide,
      transparent: true
    });

    return new THREE.Mesh(geometry, material);
  }

  makeRing() {
    const rings = new THREE.TextureLoader().load('./assets/images/saturn-rings.png');
    const geometry = new THREE.RingGeometry(124, 233, 512);

    const pos = geometry.attributes.position;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      geometry.attributes.uv.setXY(i, v3.length() < 200 ? 0 : 1, 1);
    }

    const material = new THREE.MeshLambertMaterial({
      map: rings,
      transparent: true,
      alphsMap: rings,
      alphaTest: 0.5
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  setupRings() {

    const mesh = this.makeRing();
    const matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2.0);
    mesh.applyMatrix4(matrix);

    const mesh2 = this.makeRing();
    const matrix2 = new THREE.Matrix4().makeRotationX(Math.PI / 2.0);
    mesh2.applyMatrix4(matrix2);
    const t = new THREE.Matrix4().makeTranslation(0, -3, 0);
    mesh2.applyMatrix4(t);

    // const group = new THREE.Group();
    // group.add(mesh);
    // group.add(mesh2);

    return [mesh, mesh2];
  }
}
