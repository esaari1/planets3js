import * as THREE from 'three';

export interface Updateable {
    update(camera: THREE.Camera, time: number);
}

export function isUpdateable(a) {
    return 'update' in a;
}

export class Atmosphere extends THREE.Mesh implements Updateable {

    constructor(geometry = new THREE.BufferGeometry(), material = new THREE.MeshBasicMaterial(), cameraPos: THREE.Vector3) {
        super(geometry, material);
        this['material'].uniforms.fCameraHeight2.value = cameraPos.distanceToSquared(this['position']);
    }

    update(cameraPos: THREE.Vector3, time: number) {
        this['material'].uniforms.fCameraHeight2.value = cameraPos.distanceToSquared(this['position']);
    }
}

export class AnimatedMaterial extends THREE.Mesh implements Updateable {

    constructor(geometry = new THREE.BufferGeometry(), material = new THREE.MeshBasicMaterial()) {
        super(geometry, material);
    }

    update(cameraPos: THREE.Vector3, time: number) {
        this['material'].uniforms.time.value = time;
    }
}
