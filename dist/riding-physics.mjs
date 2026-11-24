// Forgiving motorcycle handling: steering response, limited lateral grip,
// speed-dependent sensitivity and suspension load transfer. Own implementation.
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const damp=(value,target,rate,dt)=>value+(target-value)*(1-Math.exp(-rate*dt));
export function handlingState(){return {steer:0,lateralSpeed:0,heading:0,lean:0,throttle:0,bodyPitch:0};}
export function updateHandling(p,dt,input,bend,{grass=false,passenger=false}={}){
  const speed=p.speed,grip=(grass?.48:1)*(input.brake?.77:1)*(1-p.wheelie*.3);
  p.steer=damp(p.steer,clamp(input.steer||0,-1,1),passenger?5.3:6.5,dt);
  const steeringRate=(2.4+speed*.27)/(1+(speed/50)**2);
  const desired=(p.steer*steeringRate-bend*speed*speed*.19)*Math.min(1,speed/3);
  const lateralAcceleration=clamp((desired-p.lateralSpeed)*5.5*grip,-16*grip,16*grip);
  p.lateralSpeed+=lateralAcceleration*dt;
  if(speed<.1)p.lateralSpeed=damp(p.lateralSpeed,0,16,dt);
  p.offset+=p.lateralSpeed*dt;
  p.heading=damp(p.heading,Math.atan2(p.lateralSpeed,Math.max(speed,2)),7,dt);
  const turnForce=p.steer*speed*.48+bend*speed*speed*.55;
  const leanTarget=clamp(-Math.atan2(turnForce,9.81),-.99,.99)*Math.min(1,speed/5);
  p.lean=damp(p.lean,leanTarget,6,dt);
  p.bodyPitch=damp(p.bodyPitch,input.brake&&speed>1?.065:input.gas||input.boost?-.024:0,7,dt);
  // Excess corner speed makes the turn run wide; scrub a little speed rather
  // than instantly changing direction or treating every surface as tarmac.
  p.speed=Math.max(0,p.speed-(Math.abs(p.lateralSpeed)*.05+Math.abs(bend)*speed*speed*.008)*dt);
}
