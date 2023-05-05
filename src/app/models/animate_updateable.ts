import * as THREE from 'three';

export interface AnimateUpdateable {
    update(time: number);
}

export function isAnimateUpdateable(a) {
    return a.isAnimateUpdateable;
}

export class AnimatedMaterial extends THREE.Mesh implements AnimateUpdateable {

    constructor(geometry = new THREE.BufferGeometry(), material = new THREE.MeshBasicMaterial()) {
        super(geometry, material);
        this['isAnimateUpdateable'] = true;
    }

    update(time: number) {
        this['material'].uniforms.time.value = time;
    }
}
