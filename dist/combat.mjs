export const GUN_RANGE=52,MAGAZINE=6,SHOT_INTERVAL=.48,RELOAD_TIME=1.7,CRASH_TIME=3.4;
const wrap=(n,d)=>((n%d)+d)%d;
export function findTarget(player,bots,length){let chosen=null;
  bots.forEach((bot,index)=>{if(bot.finished||bot.downTime>0||bot.immunity>0)return;const forward=wrap(bot.progress-player.progress+length/2,length)-length/2,side=bot.offset-player.offset;
    const along=forward*Math.cos(player.heading||0)+side*Math.sin(player.heading||0),across=side*Math.cos(player.heading||0)-forward*Math.sin(player.heading||0);
    if(along>1.5&&along<GUN_RANGE&&Math.abs(across)<1.25+along*.045&&(!chosen||along<chosen.distance))chosen={index,distance:along,forward};
  });return chosen;
}
export function combatState(){return {ammo:MAGAZINE,shotCooldown:0,reloadTime:0,recoilTime:0,shots:0,hits:0};}
export function updateCombat(race,dt,fire){const p=race.player;p.recoilTime=Math.max(0,p.recoilTime-dt);p.shotCooldown=Math.max(0,p.shotCooldown-dt);
  if(p.reloadTime>0){p.reloadTime=Math.max(0,p.reloadTime-dt);if(!p.reloadTime)p.ammo=MAGAZINE;}
  for(const shot of race.projectiles){shot.elapsed+=dt;if(!shot.resolved&&shot.elapsed>=shot.travel){shot.resolved=true;const b=race.bots[shot.targetIndex];if(b&&!b.finished&&!b.downTime&&!b.immunity){b.downTime=CRASH_TIME;b.crashSide=b.offset>=p.offset?1:-1;b.speed=0;p.hits++;race.events.push({type:'hit',index:shot.targetIndex,name:b.name});}}}
  race.projectiles=race.projectiles.filter(s=>s.elapsed<s.travel+.13);
  if(!fire||p.rescue||p.finished||p.shotCooldown>0||p.reloadTime>0||!p.ammo)return;
  const target=findTarget(p,race.bots,race.track.length);p.ammo--;p.shots++;p.shotCooldown=SHOT_INTERVAL;p.recoilTime=.55;
  race.projectiles.push({id:p.shots,elapsed:0,travel:(target?.distance||GUN_RANGE)/115,targetIndex:target?.index??-1,startProgress:p.progress,startOffset:p.offset,heading:p.heading,endProgress:p.progress+(target?.forward||GUN_RANGE*Math.cos(p.heading)),endOffset:target?race.bots[target.index].offset:p.offset+GUN_RANGE*Math.sin(p.heading),resolved:false});
  race.events.push({type:'shot',target:target?.index??-1});if(!p.ammo)p.reloadTime=RELOAD_TIME;
}
export function crashPose(remaining,side=1){const t=Math.max(0,Math.min(CRASH_TIME,CRASH_TIME-remaining)),fall=Math.min(1,t/.8),recover=t>2.6?Math.max(0,(CRASH_TIME-t)/.8):1;return {bikeRoll:side*1.35*fall*recover,x:side*2.1*fall*recover,y:Math.sin(Math.min(1,t/.65)*Math.PI)*1.1-.7*fall*recover,roll:side*1.55*fall*recover};}
