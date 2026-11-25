import test from 'node:test';import assert from 'node:assert/strict';
import {MxSnapshotBuffer,MxLocalPrediction} from '../dist/mx-motion.mjs';
import {makeTerrainLookup,mxPixelRatio} from '../dist/mx-terrain.mjs';
import {mxPlayer,mxSnapshot,terrainHeight,MX_LENGTH} from '../dist/mx-physics.mjs';
const rider=(time,extra={})=>({...mxSnapshot(mxPlayer('a','A')),x:20+time*12,y:.8,vx:12,vy:0,...extra});
test('20 Hz snapshots with jitter produce continuous 60 Hz movement instead of packet-sized camera jumps',()=>{
 const buffer=new MxSnapshotBuffer(),packets=[];for(let i=0;i<100;i++){const time=i*.05;packets.push({time,at:time+.04+[0,.014,-.009,.008,-.004][i%5],players:[rider(time)]});}
 let last,raw,lastRaw,frameSteps=[],rawSteps=[];for(let n=0;n<300;n++){const now=n/60;while(packets.length&&packets[0].at<=now){const p=packets.shift();buffer.push(p,p.at);raw=p.players[0].x;}const p=buffer.sample(now)[0];if(now>1&&p&&last){frameSteps.push(p.x-last);rawSteps.push(raw-lastRaw);}last=p?.x;lastRaw=raw;}
 const spread=values=>Math.max(...values)-Math.min(...values);assert.ok(frameSteps.every(v=>v>.15&&v<.25));assert.ok(spread(frameSteps)<spread(rawSteps)*.1);console.log('Frame step spread:',spread(frameSteps).toFixed(4),'m; raw snapshot spread:',spread(rawSteps).toFixed(4),'m');
});
test('interpolation takes the short rotation path, bounds packet gaps and snaps checkpoint teleports',()=>{
 const b=new MxSnapshotBuffer({delay:0});b.push({time:0,players:[rider(0,{angle:3.1})]},0);b.push({time:.05,players:[rider(.05,{angle:-3.1})]},.05);assert.ok(Math.abs(Math.abs(b.sample(.025)[0].angle)-Math.PI)<.05);assert.ok(b.sample(5)[0].x<=21.81);
 b.reset();b.push({time:1,players:[rider(1,{x:90})]},1);b.push({time:1.05,players:[rider(1.05,{x:8,crashes:1})]},1.05);assert.equal(b.sample(1.025)[0].x,90);assert.equal(b.sample(1.05)[0].x,8);
});
test('own bike responds before the next packet and reconciles smoothly without overriding server results',()=>{
 const p=new MxLocalPrediction(),authority=mxSnapshot(mxPlayer('a','A'));p.accept(authority,0);p.step(1/60,{gas:true});assert.ok(p.sample().x>authority.x);for(let i=0;i<12;i++)p.step(1/60,{gas:true});const before=p.sample().x;p.accept({...authority,x:before-.3},.2,{gas:true});assert.ok(Math.abs(p.sample().x-before)<1e-8);for(let i=0;i<60;i++)p.step(1/60,{});assert.ok(Math.abs(p.error.x)<.001);
 p.accept({...authority,x:8,crashes:1,crashTime:1.5},2);assert.equal(p.sample().x,8);assert.ok(p.sample().crashTime>0);p.accept({...authority,x:MX_LENGTH,finished:true,finishTime:42},42);p.step(.1,{gas:true,boost:true});assert.equal(p.sample().x,MX_LENGTH);assert.equal(p.sample().finishTime,42);
});
test('cached terrain stays within a millimetre and limits backing pixels on large displays',()=>{
 const height=makeTerrainLookup();for(let x=-20;x<1120;x+=.031)assert.ok(Math.abs(height(x)-terrainHeight(x))<.001,`terrain at ${x}`);assert.ok(3840*2160*mxPixelRatio(3840,2160,2)**2<=2200001);assert.equal(mxPixelRatio(800,400,2),1.5);
});
