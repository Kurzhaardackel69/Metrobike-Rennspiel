export const CAMERA_VIEWS={
  chase:{label:'RENNKAMERA',forward:-8.1,side:0,height:3.7,lookAhead:8,fov:49},
  left:{label:'LINKE SEITE',forward:-1,side:-6,height:2.6,lookAhead:0,fov:49},
  right:{label:'RECHTE SEITE',forward:-1,side:6,height:2.6,lookAhead:0,fov:49},
  front:{label:'FRONTANSICHT',forward:6.5,side:0,height:2.7,lookAhead:0,fov:49},
  top:{label:'VOGELPERSPEKTIVE',forward:-.7,side:0,height:11,lookAhead:0,fov:53}
};
const arrows={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'front',ArrowUp:'top'};
export function cameraView(keys){let view='chase';for(const key of keys)if(arrows[key])view=arrows[key];return view;}
export function touchStickInput(x,y){const clamp=v=>Math.max(-1,Math.min(1,v)),horizontal=clamp(x);return {steer:Math.abs(horizontal)<.08?0:horizontal,gas:y<-.22,brake:y>.22};}
export function drivingInput(keys,touch={},steer=0){const direction=steer||((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0));return {gas:keys.has('KeyW')||!!touch.gas,brake:keys.has('KeyS')||!!touch.brake,steer:direction===0?0:-direction,fire:keys.has('KeyF')||!!touch.fire,horn:keys.has('KeyH')||!!touch.horn,boost:keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('Space')||!!touch.boost};}
