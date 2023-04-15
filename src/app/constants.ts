import * as THREE from 'three';

// Number of days in a tropical year
export const TROPICAL_YEAR = 365.242191;

// Multiply to convert from astronomical units to kilometers
export const AU_TO_KM = 149598000;

export const DEG_TO_RAD = Math.PI / 180.0;
export const RAD_TO_DEG = 180.0 / Math.PI;

// Epoch is January 0, 1990.
export const EPOCH_YEAR = 1990;

export const epsilon = 0.000001;

export function atmosphereUniforms(atmosphere) {
    const uniforms = {
        v3LightPosition: {
            type: "v3",
            value: new THREE.Vector3(0, 0, 1)
        },
        v3InvWavelength: {
            type: "v3",
            value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
        },
        fCameraHeight2: {
            type: "f",
            value: 190 * 190
        },
        fInnerRadius: {
            type: "f",
            value: atmosphere.innerRadius
        },
        fOuterRadius: {
            type: "f",
            value: atmosphere.outerRadius
        },
        fOuterRadius2: {
            type: "f",
            value: atmosphere.outerRadius * atmosphere.outerRadius
        },
        fKrESun: {
            type: "f",
            value: atmosphere.Kr * atmosphere.ESun
        },
        fKmESun: {
            type: "f",
            value: atmosphere.Km * atmosphere.ESun
        },
        fKr4PI: {
            type: "f",
            value: atmosphere.Kr * 4.0 * Math.PI
        },
        fKm4PI: {
            type: "f",
            value: atmosphere.Km * 4.0 * Math.PI
        },
        fScale: {
            type: "f",
            value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
        },
        fScaleDepth: {
            type: "f",
            value: atmosphere.scaleDepth
        },
        fScaleOverScaleDepth: {
            type: "f",
            value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
        },
        g: {
            type: "f",
            value: atmosphere.g
        },
        g2: {
            type: "f",
            value: atmosphere.g * atmosphere.g
        },
        nSamples: {
            type: "i",
            value: 3
        },
        fSamples: {
            type: "f",
            value: 3.0
        },
        tDisplacement: {
            type: "t",
            value: 0
        },
        tSkyboxDiffuse: {
            type: "t",
            value: 0
        },
        fNightScale: {
            type: "f",
            value: 1
        }
    };

    return uniforms;
}
