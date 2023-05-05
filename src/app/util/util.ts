import * as THREE from 'three';

export function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = (R * (100 + percent) / 100);
    G = (G * (100 + percent) / 100);
    B = (B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    R = Math.round(R)
    G = Math.round(G)
    B = Math.round(B)

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

export function atmosphereUniforms(atmosphere) {
    const uniforms = {
        v3LightPosition: {
            value: new THREE.Vector3(0, 0, 1)
        },
        v3InvWavelength: {
            value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
        },
        fCameraHeight2: {
            value: 190 * 190
        },
        fInnerRadius: {
            value: atmosphere.innerRadius
        },
        fOuterRadius: {
            value: atmosphere.outerRadius
        },
        fOuterRadius2: {
            value: atmosphere.outerRadius * atmosphere.outerRadius
        },
        fKrESun: {
            value: atmosphere.Kr * atmosphere.ESun
        },
        fKmESun: {
            value: atmosphere.Km * atmosphere.ESun
        },
        fKr4PI: {
            value: atmosphere.Kr * 4.0 * Math.PI
        },
        fKm4PI: {
            value: atmosphere.Km * 4.0 * Math.PI
        },
        fScale: {
            value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
        },
        fScaleDepth: {
            value: atmosphere.scaleDepth
        },
        fScaleOverScaleDepth: {
            value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
        },
        g: {
            value: atmosphere.g
        },
        g2: {
            value: atmosphere.g * atmosphere.g
        },
        fNightScale: {
            value: 1
        }
    };

    return uniforms;
}
