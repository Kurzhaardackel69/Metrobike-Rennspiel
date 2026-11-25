import {mxPlayer,mxInput,updateMxPlayer,terrainHeight} from './mx-physics.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const discontinuity=(a,b)=>a.crashes!==b.crashes||Math.abs(a.x-b.x)>5||Math.abs(a.y-b.y)>8;
function between(a,b,t){if(discontinuity(a,b))return {...(t<1?a:b)};return {...a,...(t>=1?b:{}),x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle:a.angle+angleDelta(b.angle,a.angle)*t,vx:a.vx+(b.vx-a.vx)*t,vy:a.vy+(b.vy-a.vy)*t};}
// Render opponents on a small, monotonic timeline between real server snapshots.
// Packet arrival and display refresh are deliberately independent clocks.
export class MxSnapshotBuffer{
 constructor({delay=.09,maxExtrapolation=.1}={}){this.delay=delay;this.maxExtrapolation=maxExtrapolation;this.reset();}
 reset(){this.frames=[];this.renderTime=-Infinity;this.clockOffset=null;}
 push(state,received){const last=this.frames.at(-1);if(last&&state.time<last.time)this.reset();const observed=state.time-received;this.clockOffset=this.clockOffset===null?observed:this.clockOffset+(observed-this.clockOffset)*.025;const frame={time:state.time,received,players:state.players.map(p=>({...p}))};if(this.frames.at(-1)?.time===frame.time)this.frames[this.frames.length-1]=frame;else this.frames.push(frame);while(this.frames.length>32)this.frames.shift();}
 sample(now){const latest=this.frames.at(-1);if(!latest)return [];const target=Math.min(latest.time+this.maxExtrapolation,now+this.clockOffset-this.delay);this.renderTime=Math.max(this.renderTime,target);const t=this.renderTime;
  for(let n=1;n<this.frames.length;n++){const a=this.frames[n-1],b=this.frames[n];if(t<=b.time){const u=clamp((t-a.time)/(b.time-a.time),0,1);return b.players.map(p=>{const before=a.players.find(v=>v.id===p.id);return before?between(before,p,u):{...p};});}}
  const dt=clamp(t-latest.time,0,this.maxExtrapolation);return latest.players.map(p=>{if(p.finished||p.crashTime>0)return {...p};const x=p.x+p.vx*dt;return {...p,x,y:p.grounded?terrainHeight(x)+.8:p.y+p.vy*dt-7.5*dt*dt,angle:p.angle+(p.omega||0)*dt};});
 }
}
// Predict only our own bike with the same fixed-step model as the server.
// Server snapshots retain authority over crashes, hits, checkpoints and results.
export class MxLocalPrediction{
 constructor(){this.reset();}
 reset(){this.player=null;this.error={x:0,y:0,angle:0};this.accumulator=0;this.time=0;}
 accept(authority,time,input={},oneWay=0){const old=this.sample(),next={...mxPlayer(authority.id,authority.name,authority.color),...authority,input:mxInput(input)};let ahead=clamp(oneWay,0,.12);while(ahead>1e-7){const dt=Math.min(1/60,ahead);updateMxPlayer(next,dt,time+dt);time+=dt;ahead-=dt;}
  this.player=next;this.time=time;this.accumulator=0;this.error=old&&!discontinuity(old,next)?{x:old.x-next.x,y:old.y-next.y,angle:angleDelta(old.angle,next.angle)}:{x:0,y:0,angle:0};
 }
 step(dt,input){if(!this.player)return;dt=clamp(dt,0,.1);this.player.input=mxInput(input);this.accumulator+=dt;while(this.accumulator>=1/60){this.time+=1/60;updateMxPlayer(this.player,1/60,this.time);this.accumulator-=1/60;}const decay=Math.exp(-dt*16);this.error.x*=decay;this.error.y*=decay;this.error.angle*=decay;}
 sample(){if(!this.player)return null;const p=this.player,t=this.accumulator;return {...p,x:p.x+this.error.x+(p.finished||p.crashTime?0:p.vx*t),y:p.y+this.error.y+(p.finished||p.crashTime?0:(p.grounded?terrainHeight(p.x+p.vx*t)+.8-p.y:p.vy*t)),angle:p.angle+this.error.angle};}
}
