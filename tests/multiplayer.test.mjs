import test from 'node:test';
import assert from 'node:assert/strict';
import {createMxServer} from '../multiplayer/server.mjs';
import {mxPlayer,mxInput,updateMxPlayer,renderLanes,updateMxRace} from '../dist/mx-physics.mjs';
import {mxServerUrl,mxDefaultServer,mxConnectionMessage} from '../dist/mx-client.mjs';

test('LAN page uses its PC host instead of an old phone loopback bookmark and explains failed connections',()=>{
 assert.equal(mxDefaultServer({protocol:'http:',port:'8787',host:'192.168.189.101:8787'},'ws://127.0.0.1:8787/ws'),'ws://192.168.189.101:8787/ws');
 assert.equal(mxDefaultServer({protocol:'https:',port:'',host:'example.com'},'wss://race.example/ws'),'wss://race.example/ws');
 assert.match(mxConnectionMessage('ws://192.168.189.101:8787/ws',{code:1006}),/Gast-WLAN/);
 assert.match(mxConnectionMessage('ws://localhost',{code:1000,reason:'Raum abgelaufen'},true),/Raum abgelaufen/);
});

test('MX physics can finish, brakes stop, airborne lean changes rotation, and hits cause a crash',()=>{
 const p=mxPlayer('a','A');p.input={gas:true};for(let n=0;n<12000&&!p.finished;n++)updateMxPlayer(p,1/60,n/60);assert.equal(p.finished,true);assert.ok(p.finishTime>30);
 const b=mxPlayer('b','B');b.vx=20;b.input={brake:true};for(let n=0;n<120;n++)updateMxPlayer(b,1/60,n/60);assert.equal(b.vx,0);
 b.grounded=false;b.y=100;b.input={steer:1};updateMxPlayer(b,.04,0);assert.ok(b.angle>0);
 const c=mxPlayer('c','C'),d=mxPlayer('d','D');d.x=15;c.input={fire:true};assert.ok(updateMxRace([c,d],1/60,0).some(e=>e.type==='hit'));assert.ok(d.crashTime>0);
 assert.deepEqual(mxInput(null),mxInput({}));assert.deepEqual(mxInput({x:999,gas:'true',steer:Infinity}),mxInput({}));
 assert.equal(renderLanes([c,d],'c').at(-1).id,'c');assert.equal(renderLanes([c,d],'d').at(-1).id,'d');
 assert.equal(mxServerUrl('ws://localhost:8787'),'ws://localhost:8787/ws');assert.throws(()=>mxServerUrl('ws://192.168.1.2:8787',{protocol:'https:'}));
});

test('five WebSocket clients race, reject a sixth, and cleanly disconnect',async()=>{
 const server=createMxServer({countdown:.05});const address=await server.listen(0);const sockets=[];
 async function connect(){const ws=new WebSocket(`ws://127.0.0.1:${address.port}/ws`),messages=[];ws.addEventListener('message',e=>messages.push(JSON.parse(e.data)));sockets.push(ws);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});return {ws,messages,send:m=>ws.send(JSON.stringify(m))};}
 async function until(c,predicate){const end=Date.now()+4000;while(Date.now()<end){const m=c.messages.find(predicate);if(m)return m;await new Promise(r=>setTimeout(r,20));}throw Error('No matching server message: '+JSON.stringify(c.messages.slice(-2)));}
 try{const a=await connect(),b=await connect(),c=await connect();a.send({type:'create',name:'Alpha'});const joined=await until(a,m=>m.type==='joined');b.send({type:'join',code:joined.code,name:'Beta'});await until(a,m=>m.type==='state'&&m.players.length===2);c.send({type:'join',code:joined.code});await until(c,m=>m.type==='joined');const d=await connect(),e=await connect(),f=await connect();for(const member of [d,e]){member.send({type:'join',code:joined.code});await until(member,m=>m.type==='joined');}await until(a,m=>m.players?.length===5);f.send({type:'join',code:joined.code});await until(f,m=>m.type==='error');
 b.send({type:'start'});await until(b,m=>m.type==='error');a.send({type:'start'});await until(a,m=>m.phase==='running');a.send({type:'input',input:{gas:true,x:99999}});await new Promise(r=>setTimeout(r,300));a.send({type:'start'});await until(a,m=>m.type==='error');const moved=await until(b,m=>m.phase==='running'&&m.players[0].x>8.1);assert.ok(moved.players[0].x<20);assert.equal(moved.players[1].x,8);assert.equal(moved.code,joined.code);
 b.ws.close();await until(a,m=>m.phase==='waiting'&&m.players.length===4);assert.equal((await fetch(`http://127.0.0.1:${address.port}/health`)).status,200);
 }finally{for(const ws of sockets)ws.close();await server.close();}
});
