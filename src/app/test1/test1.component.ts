import { Component, ElementRef, ViewChild } from '@angular/core';

import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// @ts-ignore
import volumeV from '../shaders/volume.vert';
// @ts-ignore
import volumeF from '../shaders/volume.frag';

@Component({
  selector: 'test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.scss']
})
export class Test1Component {

  @ViewChild('canvas') canvas: ElementRef;

  settings = {
    sigma_a: 0.1,
    scatter: [0.8 * 255, 0.1 * 255, 0.5 * 255]
  }

  ngAfterViewInit() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas.nativeElement
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const controls = new OrbitControls(camera, renderer.domElement);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.572, 0.772, 0.921), side: THREE.DoubleSide })
    );
    plane.translateZ(-10);
    scene.add(plane);

    const volumeMat = new THREE.ShaderMaterial({
      vertexShader: volumeV,
      fragmentShader: volumeF,
      uniforms: {
        bgColor: {
          value: new THREE.Vector3(0.572, 0.772, 0.921)
        },
        scatter: {
          value: new THREE.Vector3(0.8, 0.1, 0.5)
        },
        sigma_a: {
          value: 0.1
        },
        sigma_s: {
          value: 0.1
        },
        density: {
          value: 1
        },
        radius2: {
          value: 5 * 5
        },
        lightDir: {
          value: new THREE.Vector3(1.0, 0.0, -3.0).normalize()
        },
        pi: {
          value: Math.PI
        }
      }
    });

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(5, 50, 50),
      volumeMat
    )
    scene.add(sphere);

    const gui = new dat.GUI();
    gui.add(this.settings, 'sigma_a', 0, 1, 0.01).onChange(() => {
      volumeMat.uniforms.sigma_a.value = this.settings.sigma_a;
    });
    gui.addColor(this.settings, 'scatter').onChange(() => {
      volumeMat.uniforms.scatter.value.x = this.settings.scatter[0] / 255;
      volumeMat.uniforms.scatter.value.y = this.settings.scatter[1] / 255;
      volumeMat.uniforms.scatter.value.z = this.settings.scatter[2] / 255;
    })

    animate();

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
  }
}
