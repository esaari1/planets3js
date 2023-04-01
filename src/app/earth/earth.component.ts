import { Component, ElementRef, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as dat from 'dat.gui';

// @ts-ignore
import rayleighV from '../shaders/rayleigh.vert';
// @ts-ignore
import rayleighF from '../shaders/rayleigh.frag';
// @ts-ignore
import mieV from '../shaders/mie.vert';
// @ts-ignore
import mieF from '../shaders/mie.frag';

const DEG_TO_RAD = Math.PI / 180.0;

@Component({
  selector: 'app-earth',
  templateUrl: './earth.component.html',
  styleUrls: ['./earth.component.scss']
})
export class EarthComponent {

  @ViewChild('canvas') canvas: ElementRef;

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
  atmosphere;

  ngOnInit() {
    const gui = new dat.GUI();

    gui.add(this.settings, 'animate');

    const lightF = gui.addFolder('Light Rotation');
    lightF.open();
    lightF.add(this.settings.lightPosition, 'theta', 0, 360, 0.001).onChange(() => {
      this.updateLight();
    });
    lightF.add(this.settings.lightPosition, 'phi', -90, 90, 0.001).onChange(() => {
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
    this.atmosphere.material.uniforms.v3LightPosition.value = light;
  }

  calculateLight() {
    const theta = this.settings.lightPosition.theta * DEG_TO_RAD;
    const phi = this.settings.lightPosition.phi * DEG_TO_RAD;

    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);

    return new THREE.Vector3(x, y, z).normalize();
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

    this.atmosphere = this.setupAtmosphere();
    scene.add(this.atmosphere);

    //const stars = this.setupStars();
    //scene.add(stars);

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
    // const surfaceMat = new THREE.MeshPhongMaterial({
    //   //map: new THREE.TextureLoader().load('./assets/images/8081_earthmap4k.jpg'),
    //   normalMap: new THREE.TextureLoader().load('./assets/images/earth-normal.jpg'),
    //   specularMap: new THREE.TextureLoader().load('./assets/images/8081_earthspec4k-2.jpg'),
    //   specular: 0x222222,
    //   shininess: 40,
    //   normalScale: new THREE.Vector2(5, -5),
    //   color: 0x000000
    // });

    const material = new THREE.ShaderMaterial({
      uniforms: this.setupUniforms(),
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

  setupAtmosphere() {
    // const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(104.5, 128, 64), new THREE.ShaderMaterial({
    //   vertexShader: vAtmosphere,
    //   fragmentShader: fAtmosphere,
    //   blending: THREE.AdditiveBlending,
    //   uniforms: {
    //     lightDirection: {
    //       value: this.lightPos
    //     }
    //   }
    // }));

    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(102.5, 500, 500), new THREE.ShaderMaterial({
      vertexShader: rayleighV,
      fragmentShader: rayleighF,
      uniforms: this.setupUniforms(),
      side: THREE.BackSide,
      transparent: true
    }));

    return atmosphere;
  }

  setupStars() {
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 5.0
    });

    const starPoints = [];
    for (let i = 0; i < 5000; i++) {
      const theta = Math.random() * Math.PI * 2.0;
      const phi = Math.random() * Math.PI;

      const r = 1000.0;
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      starPoints.push(x, y, z);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPoints, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    return stars;
  }

  setupUniforms() {
    const atmosphere = {
      Kr: 0.0025,
      Km: 0.0010,
      ESun: 20.0,
      g: -0.950,
      innerRadius: 100,
      outerRadius: 102.5,
      wavelength: [0.650, 0.570, 0.475],
      scaleDepth: 0.25,
      mieScaleDepth: 0.1
    };

    const diffuse = new THREE.TextureLoader().load('./assets/images/8081_earthmap4k.jpg');
    const diffuseNight = new THREE.TextureLoader().load('./assets/images/8081_earthlights4k.jpg');
    const clouds = new THREE.TextureLoader().load('./assets/images/8081_earthhiresclouds4K.jpg');
    const normalMap = new THREE.TextureLoader().load('./assets/images/earth-normal.jpg');
    const specularMap = new THREE.TextureLoader().load('./assets/images/8081_earthspec4k-2.jpg');

    const uniforms = {
      v3LightPosition: {
        type: "v3",
        value: this.calculateLight()
      },
      v3InvWavelength: {
        type: "v3",
        value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
      },
      fCameraHeight: {
        type: "f",
        value: 190
      },
      fCameraHeight2: {
        type: "f",
        value: 190 * 190
      },
      fInnerRadius: {
        type: "f",
        value: atmosphere.innerRadius
      },
      fInnerRadius2: {
        type: "f",
        value: atmosphere.innerRadius * atmosphere.innerRadius
      },
      fOuterRadius: {
        type: "f",
        value: atmosphere.outerRadius
      },
      fOuterRadius2: {
        type: "f",
        value: atmosphere.outerRadius * atmosphere.outerRadius
      },
      fKrESun: {
        type: "f",
        value: atmosphere.Kr * atmosphere.ESun
      },
      fKmESun: {
        type: "f",
        value: atmosphere.Km * atmosphere.ESun
      },
      fKr4PI: {
        type: "f",
        value: atmosphere.Kr * 4.0 * Math.PI
      },
      fKm4PI: {
        type: "f",
        value: atmosphere.Km * 4.0 * Math.PI
      },
      fScale: {
        type: "f",
        value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
      },
      fScaleDepth: {
        type: "f",
        value: atmosphere.scaleDepth
      },
      fScaleOverScaleDepth: {
        type: "f",
        value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
      },
      g: {
        type: "f",
        value: atmosphere.g
      },
      g2: {
        type: "f",
        value: atmosphere.g * atmosphere.g
      },
      nSamples: {
        type: "i",
        value: 3
      },
      fSamples: {
        type: "f",
        value: 3.0
      },
      tDiffuse: {
        type: "t",
        value: diffuse
      },
      tDiffuseNight: {
        type: "t",
        value: diffuseNight
      },
      tClouds: {
        value: clouds
      },
      tNormalMap: {
        value: normalMap
      },
      tSpecularMap: {
        value: specularMap
      },
      tDisplacement: {
        type: "t",
        value: 0
      },
      tSkyboxDiffuse: {
        type: "t",
        value: 0
      },
      fNightScale: {
        type: "f",
        value: 1
      }
    };

    return uniforms;
  }

}
