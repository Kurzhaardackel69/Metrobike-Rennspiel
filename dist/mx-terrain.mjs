import {terrainHeight,MX_LENGTH} from './mx-physics.mjs';
// Static terrain is sampled once. All lanes reuse one projected path per frame.
export function makeTerrainLookup({step=.125,min=-128,max=MX_LENGTH+128}={}){const values=new Float32Array(Math.ceil((max-min)/step)+1);for(let n=0;n<values.length;n++)values[n]=terrainHeight(min+n*step);return x=>{const i=(x-min)/step,n=Math.floor(i);return n<0||n>=values.length-1?terrainHeight(x):values[n]+(values[n+1]-values[n])*(i-n);};}
export function mxPixelRatio(width,height,dpr=1){return Math.min(Math.max(.5,dpr),1.5,Math.sqrt(2200000/Math.max(1,width*height)));}
