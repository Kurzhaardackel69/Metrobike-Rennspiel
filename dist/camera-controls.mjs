export const CAMERA_VIEWS={
  chase:{label:'RENNKAMERA',forward:-8.1,side:0,height:3.7,lookAhead:8,fov:49},
  left:{label:'LINKE SEITE',forward:-1,side:-6,height:2.6,lookAhead:0,fov:49},
  right:{label:'RECHTE SEITE',forward:-1,side:6,height:2.6,lookAhead:0,fov:49},
  front:{label:'FRONTANSICHT',forward:6.5,side:0,height:2.7,lookAhead:0,fov:49},
  top:{label:'VOGELPERSPEKTIVE',forward:-.7,side:0,height:11,lookAhead:0,fov:53}
};
const arrows={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'front',ArrowUp:'top'};
export function cameraView(keys){let view='chase';for(const key of keys)if(arrows[key])view=arrows[key];return view;}
export function drivingInput(keys,touch={},steer=0){return {gas:keys.has('KeyW')||!!touch.gas,brake:keys.has('KeyS')||!!touch.brake,steer:steer||((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)),boost:keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('Space')||!!touch.boost};}
