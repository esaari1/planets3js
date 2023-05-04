import * as THREE from 'three';

export interface Updateable {
    update(controls: THREE.OrbitControls, time: number);
}

export function isUpdateable(a) {
    return 'update' in a;
}

export class Atmosphere extends THREE.Mesh implements Updateable {

    constructor(geometry = new THREE.BufferGeometry(), material = new THREE.MeshBasicMaterial(), cameraPos: THREE.Vector3) {
        super(geometry, material);
        this['material'].uniforms.fCameraHeight2.value = cameraPos.distanceToSquared(this['position']);
    }

    update(controls: THREE.OrbitControls, time: number) {
        this['material'].uniforms.fCameraHeight2.value = controls.object.position.distanceToSquared(this['position']);
    }
}

export class AnimatedMaterial extends THREE.Mesh implements Updateable {

    constructor(geometry = new THREE.BufferGeometry(), material = new THREE.MeshBasicMaterial()) {
        super(geometry, material);
    }

    update(controls: THREE.OrbitControls, time: number) {
        this['material'].uniforms.time.value = time;
    }
}

export class PlanetMarker extends THREE.Group implements Updateable {

    constructor(name: string) {
        super();
        this.createCircle();
        this.createLabel(name);
    }

    createCircle() {
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

        const material = new THREE.LineBasicMaterial({ color: 'rgb(75%, 70%, 100%)' });

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
        ctx.font = "15px Arial";
        ctx.fillText(name, 5, 20);

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

    update(controls: THREE.OrbitControls, time: number) {
        const p = controls.getDistance() / controls.minDistance * 0.7;
        this['scale'].set(p, p, p);
        super.lookAt(controls.object.position);
    }
}
