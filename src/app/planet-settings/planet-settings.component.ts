import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import * as dat from 'dat.gui';
import * as THREE from 'three';
import { DEG_TO_RAD, Rotation } from '../constants';

@Component({
  selector: 'planet-settings',
  template: ''
})
export class PlanetSettingsComponent implements OnInit {

  @Output() light: EventEmitter<THREE.Vector3> = new EventEmitter();
  @Output() camera: EventEmitter<Rotation> = new EventEmitter();
  @Output() animate: EventEmitter<boolean> = new EventEmitter();

  settings = {
    lightPosition: {
      theta: 0,
      phi: 90,
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

  ngOnInit() {
    const gui = new dat.GUI();

    gui.add(this.settings, 'animate').onChange(() => {
      this.animate.emit(this.settings.animate);
    });

    const lightF = gui.addFolder('Light Rotation');
    lightF.open();
    lightF.add(this.settings.lightPosition, 'theta', 0, 360, 0.001).onChange(() => {
      this.calculateLight();
    });
    lightF.add(this.settings.lightPosition, 'phi', 0, 180, 0.001).onChange(() => {
      this.calculateLight();
    });

    const cameraF = gui.addFolder('Camera Position');
    cameraF.open();
    cameraF.add(this.settings.cameraRotation, 'theta', 0, 360, 0.001).onChange(() => {
      this.camera.emit({ theta: this.settings.cameraRotation.theta, phi: this.settings.cameraRotation.phi });
    });
    cameraF.add(this.settings.cameraRotation, 'phi', -90, 90, 0.001).onChange(() => {
      this.camera.emit({ theta: this.settings.cameraRotation.theta, phi: this.settings.cameraRotation.phi });
    });

    this.calculateLight();
    this.camera.emit({ theta: this.settings.cameraRotation.theta, phi: this.settings.cameraRotation.phi });
  }

  calculateLight() {
    const theta = this.settings.lightPosition.theta * DEG_TO_RAD;
    const phi = this.settings.lightPosition.phi * DEG_TO_RAD;

    const s = new THREE.Spherical(1, phi, theta);
    const v = new THREE.Vector3();
    v.setFromSpherical(s).normalize();

    this.light.emit(v);
  }
}
