import * as THREE from 'three';
import { calculateNormal } from "./normals";
import { noise } from './perlin_noise';

export function perlin(sizeX, sizeY, detail, options) {
    const stepX = detail * sizeX;
    const stepY = detail * sizeY;

    const heights = new Array(stepY);
    for (let i = 0; i < stepY; i++) {
        heights[i] = new Array(stepX).fill(0);
    }

    const startX = -sizeX / 2;
    const endX = startX + sizeX;
    const startY = -sizeY / 2;
    const endY = startY + sizeY;
    const points = [];

    let minY = 1000;
    let maxY = -1000;

    for (let y = 0; y < stepY; y++) {
        const posY = startY + (endY - startY) * (y / (stepY - 1));

        for (let x = 0; x < stepX; x++) {
            const posX = startX + (endX - startX) * (x / (stepX - 1));
            let h = fractalNoise(posX + options.offsetX, posY + options.offsetY, options.octaves, options.lacunarity, options.persistence, options.scale, options.seed);

            points.push(posX, h * options.scale, posY);
            if (minY > h) {
                minY = h;
            }
            if (maxY < h) {
                maxY = h;
            }
        }
    }

    const faces = [];
    const normals = new Array(points.length);
    const vnormals = new Array(points.length / 3);

    for (let i = 0; i < vnormals.length; i++) {
        vnormals[i] = new THREE.Vector3(0, 0, 0);
    }

    for (let y = 0; y < stepY - 1; y++) {
        for (let x = 0; x < stepX - 1; x++) {
            const baseX = x + (stepX * y);
            faces.push(baseX, baseX + stepX, baseX + stepX + 1, baseX, baseX + stepX + 1, baseX + 1);

            let n = calculateNormal(points, normals, baseX, baseX + stepX, baseX + stepX + 1);
            vnormals[baseX].add(n);
            vnormals[baseX + stepX].add(n);
            vnormals[baseX + stepX + 1].add(n);

            n = calculateNormal(points, normals, baseX, baseX + stepX + 1, baseX + 1);
            vnormals[baseX].add(n);
            vnormals[baseX + stepX + 1].add(n);
            vnormals[baseX + 1].add(n);
        }
    }

    for (let i = 0; i < vnormals.length; i++) {
        vnormals[i].normalize();
        normals[i * 3] = vnormals[i].x;
        normals[i * 3 + 1] = vnormals[i].y;
        normals[i * 3 + 2] = vnormals[i].z;
    }

    return { points, faces, normals, minY, maxY };
}

export function fractalNoise(x, y, octaves, lacunarity, persistence, scale, seed) {
    let value = 0;

    let x1 = x;
    let y1 = y;

    let amplitude = .7;

    for (let i = 0; i < octaves; i++) {
        value += noise.perlin3(x1 / scale, y1 / scale, seed) * amplitude;

        y1 *= lacunarity;
        x1 *= lacunarity;

        amplitude *= persistence;
    }

    value = value * value;
    value = Math.max(-1, Math.min(1, value));
    return value;
}
