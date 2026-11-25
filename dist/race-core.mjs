import {POWER_CLASSES,DIFFICULTIES,normalizeBikeConfig,normalizeRaceSettings} from './bike-config.mjs';
import {hornState,updateHorn} from './horn.mjs';
import {combatState,updateCombat} from './combat.mjs';
import {handlingState,updateHandling} from './riding-physics.mjs';
export const TOTAL_LAPS=3,MAX_SPEED=31,BOOST_SPEED=43,RESCUE_DURATION=5.6,DROP_RELEASE=2.6,DROP_LANDING=3.7;
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const wrap=(v,length)=>((v%length)+length)%length;
export function formatTime(seconds){if(!Number.isFinite(seconds))return '—';const c=Math.floor(Math.max(0,seconds)*100);return `${String(Math.floor(c/6000)).padStart(2,'0')}:${String(Math.floor(c/100)%60).padStart(2,'0')}.${String(c%100).padStart(2,'0')}`;}
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export function rescuePose(rescue){const t=rescue.elapsed,edge=rescue.startOffset,sign=Math.sign(edge)||1;
  if(t<1.05)return {phase:'falling',offset:edge+sign*t*1.5,height:-9*(t/1.05)**2,roll:sign*.4*t,bird:t>.65,carrying:false};
  if(t<2.5){const u=smooth((t-1.05)/1.45);return {phase:'lifting',offset:edge+sign*1.575,height:-9+12.5*u,roll:sign*.42*(1-u),bird:true,carrying:true};}
  if(t<4.1)return {phase:'hovering',offset:edge+sign*1.575,height:3.5,roll:0,bird:true,carrying:true};
  if(t<5){const u=smooth((t-4.1)/.9);return {phase:'returning',offset:(edge+sign*1.575)*(1-u),height:3.5+Math.sin(u*Math.PI)*.35,roll:0,bird:true,carrying:true};}
  const u=smooth((t-5)/.6);return {phase:'landing',offset:0,height:3.5*(1-u),roll:0,bird:true,carrying:u<.8};
}
export function droppingProgress(elapsed){return clamp((elapsed-DROP_RELEASE)/(DROP_LANDING-DROP_RELEASE),0,1);}
export class Race{
  constructor(track,curvature=()=>0,settings={powerClass:4}){
    this.track=track;this.curvature=curvature;this.time=0;this.config=normalizeBikeConfig(settings);this.settings=normalizeRaceSettings(settings);this.totalLaps=this.settings.laps;this.difficulty=DIFFICULTIES[this.settings.difficulty];this.classStats=POWER_CLASSES[this.config.powerClass];this.maxSpeed=MAX_SPEED*this.classStats.speedScale;this.boostSpeed=BOOST_SPEED*this.classStats.speedScale;
    this.player={...handlingState(),...combatState(),...hornState(),lastLapCrossing:0,name:this.settings.playerName,progress:0,offset:-1.6,speed:0,boost:1,boostActive:false,padTime:0,lap:1,laps:[],finished:false,finishTime:null,collisionCooldown:0,padIndex:-1,wheelie:0,stoppie:0,stoppieTime:0,previousBrake:false,rescue:null,helmetDirty:false,helmetImpactAge:99,falls:0,passengerReactionTime:0,passengerCooldown:0,lastPassengerStunt:null};
    this.bots=['Mika','Jules','Alex','Sam','Robin'].map((name,i)=>({name,progress:7+i*6,offset:(i%2?-1:1)*2.3,speed:0,cruise:(23.7+i*.7)*this.classStats.speedScale*this.difficulty.speed,phase:i*1.8,finished:false,finishTime:null,colorIndex:(i+1)%4}));
    this.events=[];this.projectiles=[];this.lastSplit=0;
  }
  get position(){return 1+this.bots.filter(b=>this.player.finished?b.finished&&b.finishTime<this.player.finishTime:b.progress>this.player.progress).length;}
  get standings(){return [this.player,...this.bots].sort((a,b)=>a.finished&&b.finished?a.finishTime-b.finishTime:b.progress-a.progress);}
  passengerReact(stunt){const p=this.player;if(!this.config.passenger||(p.passengerCooldown>0&&p.lastPassengerStunt===stunt))return;p.lastPassengerStunt=stunt;p.passengerCooldown=3;p.passengerReactionTime=1.2;this.events.push({type:'passenger',stunt});}
  resetPlayer(){const p=this.player;if(p.finished||p.rescue)return false;p.offset=0;p.speed*=.25;Object.assign(p,handlingState());p.wheelie=p.stoppie=p.stoppieTime=0;p.previousBrake=false;p.collisionCooldown=1;this.events.push({type:'reset'});return true;}
  updateBots(dt,collide=true){const p=this.player,finish=this.track.length*this.totalLaps;for(const b of this.bots){if(b.finished)continue;b.immunity=Math.max(0,(b.immunity||0)-dt);if(b.downTime>0){b.downTime=Math.max(0,b.downTime-dt);if(!b.downTime){b.immunity=1.5;b.speed=5;}continue;}const t=wrap(b.progress,this.track.length)/this.track.length,target=b.cruise-Math.min(4*this.classStats.speedScale,Math.abs(this.curvature(t))*80)*this.difficulty.corner+Math.sin(this.time*.8+b.phase)*1.6*this.classStats.speedScale;b.speed+=(target-b.speed)*Math.min(1,dt*this.difficulty.acceleration);b.progress+=b.speed*dt;b.offset=Math.sin(b.progress*.012+b.phase)*2.7;const gap=b.progress-p.progress;
      if(collide&&Math.abs(gap)<2.3&&Math.abs(b.offset-p.offset)<1&&p.speed>5&&p.collisionCooldown===0){p.speed*=.77;b.speed*=.88;p.offset+=p.offset>=b.offset?.55:-.55;p.collisionCooldown=1.2;this.events.push({type:'collision'});}
      if(b.progress>=finish){b.finished=true;b.finishTime=this.time;b.progress=finish;}
    }}
  update(dt,input={}){
    dt=clamp(dt,0,.05);this.events.length=0;const p=this.player,finish=this.track.length*this.totalLaps;if(p.finished)return;this.time+=dt;p.helmetImpactAge+=dt;p.passengerReactionTime=Math.max(0,p.passengerReactionTime-dt);p.passengerCooldown=Math.max(0,p.passengerCooldown-dt);p.collisionCooldown=Math.max(0,p.collisionCooldown-dt);
    const honked=updateHorn(p,dt,!!input.horn,!p.rescue);if(honked)this.events.push({type:'horn'});
    if(p.rescue){const r=p.rescue;r.elapsed+=dt;p.speed=0;p.boostActive=false;p.passengerReactionTime=0;Object.assign(p,handlingState());p.wheelie=p.stoppie=0;p.previousBrake=!!input.brake;r.pose=rescuePose(r);p.offset=r.pose.offset;
      if(!r.squawked&&r.elapsed>=1.08){r.squawked=true;this.events.push({type:'parrot'});}
      if(!r.released&&r.elapsed>=DROP_RELEASE){r.released=true;this.events.push({type:'dropping'});}
      if(!r.splatted&&r.elapsed>=DROP_LANDING){r.splatted=true;p.helmetDirty=true;p.helmetImpactAge=0;this.events.push({type:'splat'});}
      this.updateBots(dt,false);updateCombat(this,dt,false);
      if(r.elapsed>=RESCUE_DURATION){p.rescue=null;p.offset=0;p.speed=6;p.padIndex=-1;p.collisionCooldown=2;this.events.push({type:'rescued'});}return;
    }
    p.padTime=Math.max(0,p.padTime-dt);const manualBoost=!!input.boost&&p.boost>.025;p.boostActive=(manualBoost||p.padTime>0)&&!input.brake;p.boost=clamp(p.boost+(manualBoost&&!input.brake?-.29:.085)*dt,0,1);
    const gas=input.gas||input.boost,offroad=this.track.id!=='star'&&Math.abs(p.offset)>this.track.halfWidth;let maxSpeed=p.boostActive?this.boostSpeed:this.maxSpeed;if(offroad)maxSpeed*=.51;
    if(input.brake&&!p.previousBrake&&p.speed>12){p.stoppieTime=1;this.events.push({type:'stoppie'});this.passengerReact('stoppie');}p.previousBrake=!!input.brake;p.stoppieTime=Math.max(0,p.stoppieTime-dt);
    p.throttle+=(Number(!!gas&&!input.brake)-p.throttle)*(1-Math.exp(-dt*8));
    if(input.brake)p.speed=Math.max(0,p.speed-28*(1-Math.abs(p.lean)*.12)*dt);else if(gas)p.speed=Math.min(maxSpeed,p.speed+(p.boostActive?this.classStats.boostAcceleration:this.classStats.acceleration)*(.55+.45*p.throttle)*(this.config.passenger?.92:1)*dt);else p.speed=Math.max(0,p.speed-4.8*dt);
    if(p.speed>maxSpeed)p.speed=Math.max(maxSpeed,p.speed-22*dt);
    const previousWheelie=p.wheelie;const wheelieTarget=p.boostActive&&p.speed>4&&!input.brake?1:0;p.wheelie+=(wheelieTarget-p.wheelie)*Math.min(1,dt*6);if(previousWheelie<=.45&&p.wheelie>.45)this.passengerReact('wheelie');
    const stoppieTarget=input.brake&&p.stoppieTime>0&&p.speed>1?Math.min(1,p.speed/7):0;p.stoppie+=(stoppieTarget-p.stoppie)*Math.min(1,dt*12);
    const bend=this.curvature(wrap(p.progress,this.track.length)/this.track.length);updateHandling(p,dt,input,bend,{grass:offroad,passenger:this.config.passenger});
    const edge=this.track.halfWidth+(this.track.id==='star'?.65:4);
    if(this.track.id==='star'&&Math.abs(p.offset)>edge){p.rescue={elapsed:0,startOffset:p.offset,squawked:false,splatted:false};p.rescue.pose=rescuePose(p.rescue);p.falls++;p.speed=0;p.boostActive=false;p.padTime=0;p.padIndex=-1;this.events.push({type:'fall'});this.updateBots(dt,false);return;}
    if(Math.abs(p.offset)>edge){p.offset=Math.sign(p.offset)*edge;p.speed*=Math.pow(.965,dt*60);if(!p.collisionCooldown){this.events.push({type:'edge'});p.collisionCooldown=1.1;}}
    const previous=p.progress;p.progress=Math.max(0,p.progress+p.forwardStep);const section=wrap(p.progress,this.track.length)/this.track.length,padIndex=this.track.pads.findIndex(t=>Math.abs(section-t)<.006&&Math.abs(p.offset)<3.8);
    if(padIndex>=0&&p.padIndex!==padIndex){p.padTime=1.15;p.boost=clamp(p.boost+.12,0,1);this.events.push({type:'pad'});}p.padIndex=padIndex;this.updateBots(dt);updateCombat(this,dt,!!input.fire);
    const previousLap=Math.floor(previous/this.track.length),nextLap=Math.floor(p.progress/this.track.length);
    if(nextLap>previousLap&&nextLap>p.lastLapCrossing){p.lastLapCrossing=nextLap;const crossing=this.time-(p.progress-nextLap*this.track.length)/Math.max(p.speed,.01);p.laps.push(crossing-this.lastSplit);this.lastSplit=crossing;p.lap=Math.min(this.totalLaps,nextLap+1);this.events.push({type:'lap',lap:p.lap});if(p.progress>=finish){p.finished=true;p.progress=finish;p.finishTime=crossing;this.events.push({type:'finish'});}}
  }
}
