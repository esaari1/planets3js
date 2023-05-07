import * as THREE from 'three';
import { CameraUpdateable, Selectable } from './interfaces';
import { shadeColor } from '../util/util';

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

export class PlanetMarker extends THREE.Group implements CameraUpdateable, Selectable {

    pos: THREE.Vector3;
    subGroup;
    line;
    name: string;
    color: string;
    selectedColor: string;

    constructor(name: string, color: string, position: THREE.Vector3) {
        super();
        this.color = color;
        this.selectedColor = shadeColor(color, 105);
        this.name = name;

        this['isCameraUpdateable'] = true;
        this.subGroup = new THREE.Group();
        super.add(this.subGroup);
        this.createCircle();
        this.createLabel(name);
        this.pos = position;
    }

    add(obj) {
        super.add(obj);
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

        const material = new THREE.LineBasicMaterial({ color: this.color });

        this.line = new THREE.LineLoop(circle, material)
        this.line['isSelectable'] = true;
        this.line['select'] = this.select.bind(this);
        this.line['unselect'] = this.unselect.bind(this);
        this.line['getPosition'] = this.getPosition.bind(this);
        this.line.name = this.name;
        this.subGroup.add(this.line);
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
        this.subGroup.add(plane);

        plane['isSelectable'] = true;
        plane['select'] = this.select.bind(this);
        plane['unselect'] = this.unselect.bind(this);
        plane.name = this.name;
    }

    update(controls: THREE.OrbitControls) {
        const p = controls.getDistance() / controls.minDistance * 0.6;
        this.subGroup.scale.set(p, p, p);

        this.subGroup.position.set(0, 0, 0);
        this.subGroup.lookAt(controls.object.position);
        this.subGroup.position.set(this.pos.x, this.pos.y, this.pos.z);
    }

    select() {
        this.line.material.color.set(this.selectedColor);
    }

    unselect() {
        this.line.material.color.set(this.color);
    }

    getPosition(): THREE.Vector3 {
        return this.pos;
    }
}
