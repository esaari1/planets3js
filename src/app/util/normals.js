import * as THREE from 'three';

export function calculateNormal(points, normals, i1, i2, i3) {
    const p1 = new THREE.Vector3(points[i1 * 3], points[i1 * 3 + 1], points[i1 * 3 + 2]);
    const p2 = new THREE.Vector3(points[i2 * 3], points[i2 * 3 + 1], points[i2 * 3 + 2]);
    const p3 = new THREE.Vector3(points[i3 * 3], points[i3 * 3 + 1], points[i3 * 3 + 2]);

    p2.sub(p1).normalize();
    p3.sub(p1).normalize();

    const normal = new THREE.Vector3();
    normal.crossVectors(p2, p3).normalize();

    for (let i = 0; i < 3; i++) {
        normals[i1 * 3 + i] = normals[i2 * 3 + i] = normals[i3 * 3 + i] = normal[i];
    }

    return normal;
}
