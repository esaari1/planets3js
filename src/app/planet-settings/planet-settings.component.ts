import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import * as dat from 'dat.gui';
import * as THREE from 'three';
import { DEG_TO_RAD } from '../util/constants';

@Component({
  selector: 'planet-settings',
  template: ''
})
export class PlanetSettingsComponent implements OnInit {

  @Output() light: EventEmitter<THREE.Vector3> = new EventEmitter();

  settings = {
    lightPosition: {
      theta: 45,
      phi: 90,
      x: 0.5,
      y: 0.25,
      z: 0.5
    }
  };

  ngOnInit() {
    const gui = new dat.GUI();

    const lightF = gui.addFolder('Light Rotation');
    lightF.open();
    lightF.add(this.settings.lightPosition, 'theta', 0, 360, 0.001).onChange(() => {
      this.calculateLight();
    });
    lightF.add(this.settings.lightPosition, 'phi', 0, 180, 0.001).onChange(() => {
      this.calculateLight();
    });

    this.calculateLight();
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
