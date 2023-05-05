import * as THREE from 'three';
import { AnimateUpdateable } from './interfaces';

export class AnimatedMaterial extends THREE.Mesh implements AnimateUpdateable {

    constructor(geometry = new THREE.BufferGeometry(), material = new THREE.MeshBasicMaterial()) {
        super(geometry, material);
        this['isAnimateUpdateable'] = true;
    }

    update(time: number) {
        this['material'].uniforms.time.value = time;
    }
}
