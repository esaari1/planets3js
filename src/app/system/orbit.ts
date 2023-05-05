import { AU_TO_KM, DAYS_TO_DEG, DEG_TO_RAD, RAD_TO_DEG, TROPICAL_YEAR, epsilon } from "../util/constants";
import * as THREE from 'three';
import { daysSinceEpoch } from "../util/time";

/**
 * Calculations taken from Practical Astronomy Wih Your Calculator (3rd Edition)
 * by Peter Duffett-Smith. Copyright (C) Cambridge University Press 1979.
 * Section 54 - Calculating the Coordinates of a Planet.
 */
export function planetOrbit(days: number, orbit) {
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
    radius = radius * AU_TO_KM;

    latitude = latitude * DEG_TO_RAD;
    longitude = longitude * DEG_TO_RAD;
    const cosLat = Math.cos(latitude);
    return new THREE.Vector3(cosLat * Math.cos(longitude) * radius, Math.sin(latitude) * radius, -cosLat * Math.sin(longitude) * radius);
}

export function sunPosition(config, days: number = undefined) {
    if (days === undefined) {
        days = daysSinceEpoch();
    }

    const N = adjustBearing(days * DAYS_TO_DEG);

    const M = adjustBearing(N + config.LongAtEpoch - config.LongOfPerigee);

    const Ec = 360.0 / Math.PI * config.Eccentricity * Math.sin(M * DEG_TO_RAD);

    // Geocentric ecliptic longitude
    const longitude = adjustBearing(N + Ec + config.LongAtEpoch);

    return eclipticToEquitorial(longitude, 0);
}

/**
 * Calculations taken from Practical Astronomy Wih Your Calculator (3rd Edition)
 * by Peter Duffett-Smith. Copyright (C) Cambridge University Press 1979.
 * Section 65
 */
export function moonOrbit(sunConfig, moonConfig, days: number = undefined) {
    const Ns = adjustBearing(days * DAYS_TO_DEG);
    const Ms = adjustBearing(Ns + sunConfig.LongAtEpoch - sunConfig.LongOfPerigee);

    const Ec = 360.0 / Math.PI * sunConfig.Eccentricity * Math.sin(Ms * DEG_TO_RAD);

    // sun longitude
    const longitudeSun = adjustBearing(Ns + Ec + sunConfig.LongAtEpoch);

    // mean longitude
    const l = adjustBearing(moonConfig.LongOffset * days + moonConfig.LongAtEpoch);

    // mean anomoly
    const Mm = adjustBearing(l - 0.1114041 * days - moonConfig.LongOfPerigee);

    // ascending node mean longitude
    const N = adjustBearing(moonConfig.LongOfNode - 0.0529539 * days);

    // evection correction
    const C = l - longitudeSun;
    const Ev = 1.2739 * Math.sin((2 * C - Mm) * DEG_TO_RAD);

    // annual equation and third correction
    const sinMs = Math.sin(Ms * DEG_TO_RAD);
    const Ae = 0.1858 * sinMs;
    const A3 = 0.37 * sinMs;

    const Mm2 = Mm + Ev - Ae - A3;

    // equation center and fourth corrections
    const Ec2 = 6.2886 * Math.sin(Mm2 * DEG_TO_RAD);
    const A4 = 0.214 * Math.sin(2 * Mm2 * DEG_TO_RAD);

    // corrected longitude
    let l2 = l + Ev + Ec2 - Ae + A4;

    // variation
    const V = 0.6583 * Math.sin(2 * (l2 - longitudeSun) * DEG_TO_RAD);
    l2 += V;

    const N2 = N - 0.16 * Math.sin(Ms * DEG_TO_RAD);

    const sl2n2 = Math.sin((l2 - N2) * DEG_TO_RAD)
    const y = sl2n2 * Math.cos(moonConfig.Inclination * DEG_TO_RAD);
    const x = Math.cos((l2 - N2) * DEG_TO_RAD);

    const atan = normalizedArctan(y, x);
    const longitude = adjustBearing(N2 + atan);
    const latitude = Math.asin(sl2n2 * Math.sin(moonConfig.Inclination * DEG_TO_RAD)) * RAD_TO_DEG;

    // From section 69 - get distance from earth to moon
    //Mm2 and Ec2
    const p = (1 - moonConfig.Eccentricity * moonConfig.Eccentricity) / (1 + moonConfig.Eccentricity * Math.cos((Mm2 + Ec2) * DEG_TO_RAD));

    console.log(Mm2, Ec2, p);

    return eclipticToEquitorial(longitude, latitude);
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

export function eclipticToEquitorial(longitude: number, latitude: number) {
    const epsilon = 23.441884 * DEG_TO_RAD;
    const cosEpsilon = Math.cos(epsilon);
    const sinEpsilon = Math.sin(epsilon);

    const longRadians = longitude * DEG_TO_RAD;
    const latRadians = latitude * DEG_TO_RAD;

    const sinDeclination = Math.sin(latRadians) * cosEpsilon + Math.cos(latRadians) * sinEpsilon * Math.sin(longRadians);
    const declination = Math.asin(sinDeclination) * RAD_TO_DEG;

    const y = Math.sin(longRadians) * cosEpsilon - Math.tan(latRadians) * sinEpsilon;
    const x = Math.cos(longRadians);

    let rightAscension = normalizedArctan(y, x);

    // Convert to hours
    rightAscension /= 15.0;

    return new THREE.Vector2(rightAscension, declination);
}

function normalizedArctan(y: number, x: number): number {
    let val = Math.atan2(y, x) * RAD_TO_DEG;

    if (x >= 0) {
        if (y >= 0) {
            while (val < 0) {
                val += 180;
            }
            while (val > 90) {
                val -= 180;
            }
        } else {
            while (val < 270) {
                val += 180;
            }
            while (val > 360) {
                val -= 180;
            }
        }
    } else {
        if (y >= 0) {
            while (val < 90) {
                val += 180;
            }
            while (val > 180) {
                val -= 180;
            }
        } else {
            while (val < 180) {
                val += 180;
            }
            while (val > 270) {
                val -= 180;
            }
        }
    }

    return val;
}