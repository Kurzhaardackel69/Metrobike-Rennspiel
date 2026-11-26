// Original side-view arcade motocross model. Only the server advances riders.
import {hornState,updateHorn} from './horn.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const MX_LENGTH=1100,MX_VERSION=4,MX_MAX_PLAYERS=5;
export function terrainHeight(x){const blend=clamp((x-25)/25,0,1),wave=1.4*Math.sin(x*.041)+.65*Math.sin(x*.103);let jumps=0;for(let c=85;c<MX_LENGTH;c+=95)jumps+=3.2*Math.exp(-(((x-c)/8)**2));return (wave+jumps)*blend;}
export function terrainSlope(x){return (terrainHeight(x+.1)-terrainHeight(x-.1))/.2;}
const angleDifference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function mxPlayer(id,name,color=0){return {id,name,color,x:8,y:terrainHeight(8)+.8,vx:0,vy:0,angle:0,omega:0,grounded:true,crashTime:0,crashes:0,bestX:8,finished:false,finishTime:null,boost:1,shotCooldown:0,previousReset:false,...hornState(),input:{}};}
export function mxInput(value={}){if(!value||typeof value!=='object')value={};return {gas:value.gas===true,brake:value.brake===true,boost:value.boost===true,fire:value.fire===true,horn:value.horn===true,reset:value.reset===true,steer:Number.isFinite(value.steer)?clamp(value.steer,-1,1):0};}
export function crashMx(p){if(p.crashTime>0||p.finished)return false;p.crashTime=1.65;p.crashes++;p.vx=0;p.vy=2;return true;}
export function updateMxPlayer(p,dt,time,events=[]){dt=clamp(dt,0,.04);if(p.finished)return;const i=p.input||{};p.shotCooldown=Math.max(0,p.shotCooldown-dt);
  if(updateHorn(p,dt,i.horn,p.crashTime<=0))events.push({type:'horn',playerId:p.id});
  if(i.reset&&!p.previousReset)crashMx(p);p.previousReset=!!i.reset;
  if(p.crashTime>0){p.crashTime=Math.max(0,p.crashTime-dt);p.angle+=dt*3;if(!p.crashTime){p.x=Math.max(8,Math.floor(p.bestX/100)*100);p.y=terrainHeight(p.x)+.8;p.angle=Math.atan(terrainSlope(p.x));p.omega=p.vy=0;p.vx=3;p.grounded=true;}return;}
  const boosting=i.boost&&p.boost>.04&&!i.brake;p.boost=clamp(p.boost+(boosting?-.28:.085)*dt,0,1);const target=boosting?31:24;
  if(i.brake)p.vx=Math.max(0,p.vx-18*dt);else if(i.gas||boosting)p.vx=Math.min(target,p.vx+(p.grounded?8.5:2)*dt);else p.vx=Math.max(0,p.vx-1.5*dt);
  const slope=terrainSlope(p.x);if(p.grounded)p.vx=clamp(p.vx-slope*7*dt,0,target);
  const curvature=(terrainSlope(p.x+.3)-terrainSlope(p.x-.3))/.6;
  if(p.grounded&&curvature*p.vx*p.vx< -10){p.grounded=false;p.vy=slope*p.vx+1.1;}
  p.x+=p.vx*dt;
  if(p.grounded){p.y=terrainHeight(p.x)+.8;p.vy=terrainSlope(p.x)*p.vx;const targetAngle=Math.atan(terrainSlope(p.x))+(i.steer||0)*.34;p.angle+=angleDifference(targetAngle,p.angle)*(1-Math.exp(-dt*10));p.omega=0;}
  else{p.vy-=15*dt;p.y+=p.vy*dt;p.omega+=((i.steer||0)*8-p.omega*1.7)*dt;p.angle+=p.omega*dt;const ground=terrainHeight(p.x)+.8;if(p.y<=ground&&p.vy<=terrainSlope(p.x)*p.vx){if(Math.abs(angleDifference(p.angle,Math.atan(terrainSlope(p.x))))>1.18||Math.abs(p.omega)>7){crashMx(p);events.push({type:'crash',playerId:p.id});}else{p.grounded=true;p.y=ground;p.vy=0;p.omega=0;}}}
  p.bestX=Math.max(p.bestX,p.x);if(p.x>=MX_LENGTH){p.x=MX_LENGTH;p.finished=true;p.finishTime=time;p.vx=0;events.push({type:'finish',playerId:p.id});}
}
export function updateMxRace(players,dt,time){const events=[];for(const p of players)updateMxPlayer(p,dt,time,events);for(const p of players){if(p.finished||p.crashTime>0||!p.input.fire||p.shotCooldown>0)continue;p.shotCooldown=.65;const target=players.filter(b=>b!==p&&!b.finished&&!b.crashTime&&b.x>p.x&&b.x-p.x<38&&Math.abs(b.y-p.y)<3).sort((a,b)=>a.x-b.x)[0];events.push({type:'shot',playerId:p.id,x:p.x,y:p.y,targetX:target?.x||p.x+35,targetY:target?.y||p.y});if(target&&crashMx(target))events.push({type:'hit',playerId:target.id,by:p.id});}return events;}
export function renderLanes(players,localId){const others=players.filter(p=>p.id!==localId);return [...others.map((p,i)=>({...p,front:false,lane:others.length-i})),...players.filter(p=>p.id===localId).map(p=>({...p,front:true,lane:0}))];}
export function mxSnapshot(p){const {id,name,color,x,y,vx,vy,angle,grounded,crashTime,crashes,finished,finishTime,boost,horns,omega,bestX,hornCooldown,previousHorn,previousReset}=p;return {id,name,color,x,y,vx,vy,angle,grounded,crashTime,crashes,finished,finishTime,boost,horns,omega,bestX,hornCooldown,previousHorn,previousReset};}
// Computer-Gegner für das 2D-Zeitfahren: Gas nach Können, Boost in Schüben, in der Luft auf die Landung ausrichten.
export const MX_SKILLS={easy:{gas:.55,boost:0,fire:.002},normal:{gas:.7,boost:.2,fire:.004},hard:{gas:1,boost:.6,fire:.007}};
export function mxBotInput(p,players,time,skill=MX_SKILLS.normal,random=Math.random){const phase=(p.color||0)*1.7,gas=Math.sin(time*.9+phase)*.5+.5<=skill.gas-(p.color%2)*.03;p.botBoost=skill.boost>0&&(p.botBoost?p.boost>1.02-skill.boost:p.boost>.98);let steer=0;if(!p.grounded)steer=clamp(3*(Math.atan(terrainSlope(p.x+p.vx*.25))-p.angle)-.5*p.omega,-1,1);
 const target=players.some(b=>b!==p&&!b.bot&&!b.finished&&!b.crashTime&&b.x>p.x&&b.x-p.x<38&&Math.abs(b.y-p.y)<3);return {gas,boost:p.botBoost,steer,fire:target&&random()<skill.fire};}
