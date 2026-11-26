// 3D-Mehrspieler: Jeder Client fährt sein Bike selbst (race-core) und meldet seine Lage.
// Der Server prüft die Werte, vergibt Zielzeiten und verteilt Treffer und Hupen an alle.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const num=(v,a,b)=>Number.isFinite(v)?clamp(v,a,b):0;
export const NET3D_TRACKS=['kart','star'];
export function net3dSettings(value={}){const laps=Number(value?.laps);return {track:NET3D_TRACKS.includes(value?.track)?value.track:'kart',laps:Number.isInteger(laps)?clamp(laps,1,10):3};}
export function net3dPose(value={}){if(!value||typeof value!=='object')value={};return {progress:num(value.progress,0,1e5),offset:num(value.offset,-30,30),heading:num(value.heading,-Math.PI,Math.PI),speed:num(value.speed,0,80),lean:num(value.lean,-1.2,1.2),steer:num(value.steer,-1,1),wheelie:num(value.wheelie,0,1),stoppie:num(value.stoppie,0,1),down:num(value.down,0,5),lap:Math.round(num(value.lap,1,10))||1,finished:value.finished===true};}
// Gegner zwischen den Serverständen: mit eigener Geschwindigkeit weiterfahren und sanft zum gemeldeten Stand ziehen.
export function net3dProxy(player){return {id:player.id,name:player.name,colorIndex:clamp(Number(player.color)||0,0,3),progress:player.progress||0,offset:player.offset||0,speed:0,heading:0,lean:0,steer:0,wheelie:0,stoppie:0,downTime:0,finished:false,finishTime:null,target:null};}
export function net3dReceive(proxy,player,receivedAt){proxy.name=player.name;proxy.finished=!!player.finished;proxy.finishTime=player.finishTime??null;proxy.target={...net3dPose(player),receivedAt};if(proxy.target.down>proxy.downTime)proxy.downTime=proxy.target.down;}
export function net3dStep(proxy,dt,now){const t=proxy.target;if(!t)return;const ahead=t.finished||t.down>0?0:t.speed*clamp(now-t.receivedAt,0,.25),goal=t.progress+ahead,k=1-Math.exp(-dt*8);if(Math.abs(goal-proxy.progress)>25)proxy.progress=goal;else proxy.progress=Math.max(proxy.progress,proxy.progress+(goal-proxy.progress)*k);for(const key of ['offset','speed','lean','steer','wheelie','stoppie'])proxy[key]+=(t[key]-proxy[key])*k;proxy.heading=t.heading;proxy.downTime=Math.max(0,proxy.downTime-dt);}
