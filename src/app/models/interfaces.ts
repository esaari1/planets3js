import * as THREE from 'three';

export interface AnimateUpdateable {
    update(time: number);
}

export function isAnimateUpdateable(a) {
    return a.isAnimateUpdateable;
}

export interface CameraUpdateable {
    update(controls: THREE.OrbitControls);
}

export function isCameraUpdateable(a) {
    return a.isCameraUpdateable;
}

export interface Selectable {
    select();
    unselect();
}
