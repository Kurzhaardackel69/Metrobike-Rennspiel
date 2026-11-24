import test from 'node:test';
import assert from 'node:assert/strict';
import {trackData} from '../dist/world.js';
import {Race,clamp} from '../dist/race-core.mjs';
for(const id of ['kart','star'])for(const powerClass of [2,4]){
  test(`${id}, ${powerClass} kW: closed track has finite positions, continuous tangents and a complete three-lap race`,()=>{
    const track=trackData(id);
    assert.ok(track.length>800);
    assert.ok(track.sample(0).p.distanceTo(track.sample(1).p)<1e-8);
    assert.ok(track.sample(.99999).tangent.dot(track.sample(.00001).tangent)>.99);
    for(let i=0;i<500;i++){const t=i/500;const sample=track.sample(t);assert.ok([...sample.p,...sample.tangent,...sample.side,track.curvature(t)].every(Number.isFinite));assert.ok(Math.abs(sample.tangent.length()-1)<1e-8);}
    // Drive the real track with a simple lane-keeping controller, including bots,
    // collisions and boost pads. The player must cross three full finish lines.
    const race=new Race(track,track.curvature,{powerClass});
    for(let step=0;step<22000&&!race.player.finished;step++){
      const p=race.player,curve=track.curvature(p.progress/track.length);
      const steer=clamp((curve*p.speed*p.speed*.19-p.offset*2)/(2.5+p.speed*.34),-1,1);
      race.update(.01,{gas:true,steer,boost:race.player.boost>.6});
    }
    assert.ok(race.player.finished,`Did not finish ${id}`);
    assert.equal(race.player.laps.length,3);
    assert.ok(race.player.laps.every(t=>t>10));
    assert.ok(race.player.finishTime<150);
    assert.ok(race.position>=1&&race.position<=6);
  });
}
