// Free heading: curvature changes the reference frame, never world direction.
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const damp=(value,target,rate,dt)=>value+(target-value)*(1-Math.exp(-rate*dt));
export function handlingState(){return {steer:0,lateralSpeed:0,heading:0,lean:0,throttle:0,bodyPitch:0,forwardStep:0};}
export function maxYawRate(speed){return 2.65*speed/(speed+5)/(1+(speed/70)**2);}
export function updateHandling(p,dt,input,bend,{grass=false,passenger=false}={}){
  const speed=p.speed,grip=(grass?.55:1)*(input.brake?.82:1)*(1-p.wheelie*.28),command=clamp(input.steer||0,-1,1);
  p.steer=damp(p.steer,command,passenger?7:9,dt);
  const yaw=command===0?0:p.steer*maxYawRate(speed)*grip;
  const forward=speed*Math.cos(p.heading)*dt/Math.max(.45,1-bend*p.offset);
  const turn=yaw*dt-bend*forward,mid=p.heading+turn*.5;
  p.forwardStep=speed*Math.cos(mid)*dt/Math.max(.45,1-bend*p.offset);
  p.lateralSpeed=speed*Math.sin(mid);p.offset+=p.lateralSpeed*dt;
  p.heading=Math.atan2(Math.sin(p.heading+turn),Math.cos(p.heading+turn));
  const leanTarget=clamp(-Math.atan2(yaw*speed,9.81),-1.05,1.05)*Math.min(1,speed/5);
  p.lean=damp(p.lean,leanTarget,7,dt);
  p.bodyPitch=damp(p.bodyPitch,input.brake&&speed>1?.065:input.gas||input.boost?-.024:0,7,dt);
  p.speed=Math.max(0,p.speed-Math.abs(yaw)*speed*.025*dt);
}
