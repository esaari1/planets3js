import { AU_TO_KM, DEG_TO_RAD, RAD_TO_DEG, TROPICAL_YEAR, epsilon } from "../constants";
import * as THREE from 'three';

export function calculateLocation(days: number, orbit, scale) {
    // Calculate the mean anomaly
    const M = (360.0 / TROPICAL_YEAR) * (days / orbit.Period) + orbit.LongAtEpoch - orbit.LongOfPerihelion;

    // Find solution for Kepler's Law
    const E = kepler(M, orbit.eccentricity);

    // Find tan(v/2)
    const tanV = Math.pow(((1.0 + orbit.Eccentricity) / (1.0 - orbit.Eccentricity)), 0.5) * Math.tan(E / 2.0);

    // Take inverse tangent and multiply by 2 to get v. Convert from radians to degrees.
    const v = Math.atan(tanV) * 2.0 * RAD_TO_DEG;

    // Calculate heleocentric longitude
    let l = v + orbit.LongOfPerihelion;
    l = adjustBearing(l);

    // Calculate length of radius vector
    const r = (orbit.SemiMajorAxis * (1.0 - Math.pow(orbit.Eccentricity, 2.0))) / (1.0 + orbit.Eccentricity * Math.cos(v * DEG_TO_RAD));

    // Calculate the heleocentric latitude
    let latitude = Math.asin(Math.sin((l - orbit.AscendingNode) * DEG_TO_RAD) * Math.sin(orbit.Inclination * DEG_TO_RAD));
    latitude = latitude * RAD_TO_DEG;

    // Calculate projected heleocentric longitude
    const x = Math.cos((l - orbit.AscendingNode) * DEG_TO_RAD);
    const y = Math.sin((l - orbit.AscendingNode) * DEG_TO_RAD) * Math.cos(orbit.Inclination * DEG_TO_RAD);
    let longitude = Math.atan2(y, x);
    longitude = longitude * RAD_TO_DEG + orbit.AscendingNode;
    longitude = adjustBearing(longitude);

    // Calculate length of projected radius vector
    let radius = r * Math.cos(latitude * DEG_TO_RAD);
    radius = radius * AU_TO_KM * scale;

    latitude = latitude * DEG_TO_RAD;
    longitude = longitude * DEG_TO_RAD;
    const cosLat = Math.cos(latitude);
    return new THREE.Vector3(cosLat * Math.cos(longitude) * radius, Math.sin(latitude) * radius, -cosLat * Math.sin(longitude) * radius);
}

function kepler(M: number, eccentricity: number): number {
    M = adjustBearing(M);
    M = M * DEG_TO_RAD;
    let E = M;
    let g = E - (eccentricity * Math.sin(E)) - M;

    while (g > epsilon) {
        const deltaE = g / (1.0 - eccentricity * Math.cos(E));
        E = E - deltaE;
        g = E - (eccentricity * Math.sin(E)) - M;
    }
    return E;
}

function adjustBearing(b: number): number {
    while (b < 0) {
        b += 360.0;
    }
    while (b > 360.0) {
        b -= 360.0;
    }

    return b;
}
