import * as THREE from 'three';

export interface CameraUpdateable {
    update(controls: THREE.OrbitControls);
}

export function isCameraUpdateable(a) {
    return a.isCameraUpdateable;
}

export class Atmosphere extends THREE.Mesh implements CameraUpdateable {

    constructor(geometry = new THREE.BufferGeometry(), material = new THREE.MeshBasicMaterial(), cameraPos: THREE.Vector3) {
        super(geometry, material);
        this['material'].uniforms.fCameraHeight2.value = cameraPos.distanceToSquared(this['position']);
        this['isCameraUpdateable'] = true;
    }

    update(controls: THREE.OrbitControls) {
        this['material'].uniforms.fCameraHeight2.value = controls.object.position.distanceToSquared(this['position']);
    }
}

export class PlanetMarker extends THREE.Group implements CameraUpdateable {

    pos: THREE.Vector3;

    constructor(name: string, color: string, position: THREE.Vector3) {
        super();
        this['isCameraUpdateable'] = true;
        this.createCircle(color);
        this.createLabel(name);
        this.pos = position;
    }

    createCircle(color: string) {
        const circle = new THREE.CircleGeometry(1.0, 30.0);

        // Remove center vertex
        const itemSize = 3;
        circle.setAttribute('position',
            new THREE.BufferAttribute(
                circle.attributes.position.array.slice(itemSize,
                    circle.attributes.position.array.length - itemSize
                ), itemSize
            )
        );
        circle.index = null;

        const material = new THREE.LineBasicMaterial({ color: color });

        super.add(new THREE.LineLoop(circle, material));
    }

    createLabel(name: string) {
        // Create texture
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(0, 0, 0, 100)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = "11px Arial";
        ctx.fillText(name.toUpperCase(), 0, 18);

        const texture = new THREE.CanvasTexture(canvas);

        const geometry = new THREE.PlaneGeometry(10, 3);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(7, 0);
        super.add(plane);
    }

    update(controls: THREE.OrbitControls) {
        const p = controls.getDistance() / controls.minDistance * 0.6;
        this['scale'].set(p, p, p);

        this['position'].set(0, 0, 0);
        super.lookAt(controls.object.position);
        this['position'].set(this.pos.x, this.pos.y, this.pos.z);
    }
}
