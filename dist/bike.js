import * as THREE from './assets/three.module.js';
import {BIKE_COLORS,SEAT_COLORS,normalizeBikeConfig} from './bike-config.mjs';
export {BIKE_COLORS};
const V=(x,y,z)=>new THREE.Vector3(x,y,z),cache=new Map();
const material=(color,metalness=0,roughness=.5)=>{const key=`${color}/${metalness}/${roughness}`;if(!cache.has(key))cache.set(key,Object.assign(new THREE.MeshStandardMaterial({color,metalness,roughness}),{userData:{sharedBike:true}}));return cache.get(key);};
function add(parent,geometry,mat,x=0,y=0,z=0){const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function ball(parent,r,mat,x,y,z,sx=1,sy=1,sz=1){const m=add(parent,new THREE.SphereGeometry(r,28,18),mat,x,y,z);m.scale.set(sx,sy,sz);return m;}
function tube(parent,points,r,mat,steps=32){return add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?V(...p):p)),steps,r,8,false),mat);}
function rod(parent,a,b,r,mat){const start=V(...a),end=V(...b);const m=add(parent,new THREE.CylinderGeometry(r,r,start.distanceTo(end),10),mat);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),end.sub(start).normalize());return m;}
function roundedGeometry(w,h,d,r=.045){const g=new THREE.BoxGeometry(w,h,d,8,5,10),p=g.attributes.position;const v=new THREE.Vector3(),inner=V(w/2-r,h/2-r,d/2-r),base=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);base.copy(v).clamp(inner.clone().negate(),inner);v.sub(base).normalize().multiplyScalar(r).add(base);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;}
function rounded(parent,w,h,d,mat,x,y,z,r=.045){return add(parent,roundedGeometry(w,h,d,r),mat,x,y,z);}
function merge(parent){const groups=new Map();for(const child of [...parent.children]){if(!child.isMesh||Array.isArray(child.material))continue;const key=child.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(child);}for(const parts of groups.values()){if(parts.length<2)continue;const positions=[],normals=[],uvs=[];for(const part of parts){part.updateMatrix();const g=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();g.applyMatrix4(part.matrix);const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n?n.getX(i):0,n?n.getY(i):1,n?n.getZ(i):0);uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}parent.remove(part);g.dispose();part.geometry.dispose();}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));add(parent,geo,parts[0].material);}}
let leatherMap,logoMap,shadowMap;
function leatherTexture(){if(leatherMap)return leatherMap;const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),img=ctx.createImageData(256,256);let seed=7;for(let i=0;i<img.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const n=110+(seed%45);img.data.set([n,n,n,255],i);}ctx.putImageData(img,0,0);leatherMap=new THREE.CanvasTexture(c);leatherMap.wrapS=leatherMap.wrapT=THREE.RepeatWrapping;leatherMap.repeat.set(4,5);leatherMap.userData.sharedBike=true;return leatherMap;}
function logoTexture(){if(logoMap)return logoMap;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#deddd1';x.beginPath();x.arc(128,128,123,0,Math.PI*2);x.fill();x.strokeStyle='#254139';x.lineWidth=8;for(const cx of [104,151]){x.beginPath();x.arc(cx,134,34,.25,Math.PI*1.84);x.stroke();}x.font='700 23px Arial';x.fillStyle='#254139';x.textAlign='center';x.fillText('METORBIKE',128,75);x.font='14px Arial';x.fillText('H A M B U R G',128,194);logoMap=new THREE.CanvasTexture(c);logoMap.colorSpace=THREE.SRGBColorSpace;logoMap.userData.sharedBike=true;return logoMap;}
function shadowTexture(){if(shadowMap)return shadowMap;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'#000a');g.addColorStop(1,'#0000');x.fillStyle=g;x.fillRect(0,0,128,128);shadowMap=new THREE.CanvasTexture(c);shadowMap.userData.sharedBike=true;return shadowMap;}
function tankGeometry(){const profile=new THREE.CatmullRomCurve3([V(-.59,.035,.06),V(-.48,.24,.19),V(-.25,.32,.23),V(.1,.33,.225),V(.42,.28,.2),V(.61,.15,.14),V(.67,.025,.055)]);const positions=[],uvs=[],indices=[],rings=48,sides=40;for(let i=0;i<=rings;i++){const p=profile.getPoint(i/rings);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,cos=Math.cos(a),sin=Math.sin(a);positions.push(Math.sign(cos)*Math.pow(Math.abs(cos),.72)*p.y,Math.sign(sin)*Math.pow(Math.abs(sin),.82)*p.z,p.x);uvs.push(j/sides,i/rings);if(i<rings&&j<sides){const n=i*(sides+1)+j;indices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;}
function discGeometry(){const s=new THREE.Shape();s.absarc(0,0,.245,0,Math.PI*2,false);const center=new THREE.Path();center.absarc(0,0,.102,0,Math.PI*2,true);s.holes.push(center);for(let i=0;i<20;i++){const a=i/20*Math.PI*2,p=new THREE.Path();p.absarc(Math.cos(a)*.205,Math.sin(a)*.205,.012,0,Math.PI*2,true);s.holes.push(p);}return new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,curveSegments:4});}
function fender(parent,z,mat){const pos=[],indices=[];for(let i=0;i<=32;i++){const a=.25+i/32*(Math.PI-.5);for(const side of [-1,1])pos.push(side*.12,.48+Math.sin(a)*.495,z+Math.cos(a)*.495);if(i<32){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();const m=mat.clone();m.userData.sharedBike=false;m.side=THREE.DoubleSide;add(parent,g,m);}
export function makeBike(colorIndex=0,rider=false,settings={}){
  const config=normalizeBikeConfig(settings),g=new THREE.Group(),body=new THREE.Group();g.add(body);g.userData.body=body;g.userData.config=config;g.userData.wheels=[];
  const chrome=material(0xd2d9d8,.95,.18),brushed=material(0x9ba7aa,.87,.32),frame=material(0x161d1e,.55,.25),rubber=material(0x15191b,0,.86),dark=material(0x282e30,.4,.4);
  const paint=new THREE.MeshPhysicalMaterial({color:BIKE_COLORS[colorIndex].hex,metalness:.62,roughness:.23,clearcoat:1,clearcoatRoughness:.12});g.userData.paint=paint;
  const metalParts=new THREE.Group();body.add(metalParts);
  for(const z of [-.98,1.03]){
    const w=new THREE.Group();w.position.set(0,.48,z);body.add(w);g.userData.wheels.push(w);
    const tire=add(w,new THREE.TorusGeometry(.371,.106,20,64),rubber);tire.rotation.y=Math.PI/2;
    for(const x of [-.075,.075]){const ring=add(w,new THREE.TorusGeometry(.345,.022,10,56),chrome,x,0,0);ring.rotation.y=Math.PI/2;const sidewall=add(w,new THREE.TorusGeometry(.402,.003,4,56),dark,x,0,0);sidewall.rotation.y=Math.PI/2;}
    for(let i=0;i<28;i++){const a=i/28*Math.PI*2;rod(w,[-.052,Math.sin(a+.18)*.075,Math.cos(a+.18)*.075],[-.07,Math.sin(a)*.34,Math.cos(a)*.34],.0035,chrome);rod(w,[.052,Math.sin(a-.18)*.075,Math.cos(a-.18)*.075],[.07,Math.sin(a)*.34,Math.cos(a)*.34],.0035,chrome);}
    for(let i=0;i<48;i++){const a=i/48*Math.PI*2;const tread=add(w,new THREE.BoxGeometry(.14,.005,.012),dark,0,Math.sin(a)*.477,Math.cos(a)*.477);tread.rotation.set(-a,0,.24*(i%2?1:-1));}
    const hub=add(w,new THREE.CylinderGeometry(.09,.09,.19,24),brushed);hub.rotation.z=Math.PI/2;
    const disc=add(w,discGeometry(),brushed,.115,0,0);disc.rotation.y=Math.PI/2;
    const axle=add(w,new THREE.CylinderGeometry(.036,.036,.31,12),chrome);axle.rotation.z=Math.PI/2;
    merge(w);
  }
  // Metorbike's characteristic open, curved frame leaves daylight below the tank.
  tube(metalParts,[[0,1.18,-.9],[0,1.0,-.68],[0,.7,-.48],[0,.65,-.04],[0,.84,.4],[0,1.26,.66]],.058,frame,56);
  for(const x of [-.17,.17]){
    tube(metalParts,[[x,1.19,-1.18],[x,1.19,-.45],[x,1.23,.64]],.025,chrome);
    rod(metalParts,[x,.48,-.98],[x,.42,-.17],.037,brushed);
    rod(metalParts,[x,.49,1.03],[x,1.44,.67],.03,chrome);rod(metalParts,[x,.49,1.03],[x,1.05,.82],.044,frame);
    const start=V(x*1.4,.55,-.91),end=V(x*1.4,1.12,-.57),axis=end.clone().sub(start),basis=V(1,0,0),other=axis.clone().normalize().cross(basis),helix=[];
    for(let i=0;i<=132;i++){const t=i/132,a=t*Math.PI*24;helix.push(start.clone().addScaledVector(axis,t).addScaledVector(basis,Math.cos(a)*.057).addScaledVector(other,Math.sin(a)*.057));}
    tube(metalParts,helix,.012,frame,132);rod(metalParts,start.toArray(),end.toArray(),.024,chrome);ball(metalParts,.065,brushed,...end.toArray());
  }
  const motor=add(metalParts,new THREE.CylinderGeometry(.187,.187,.42,36),chrome,0,.43,-.22);motor.rotation.z=Math.PI/2;
  rounded(metalParts,.45,.25,.42,brushed,0,.43,.08,.08);
  for(let i=0;i<9;i++)rounded(metalParts,.46,.017,.23,chrome,0,.35+i*.025,.22,.006);
  rounded(metalParts,.58,.07,.72,frame,0,.25,-.06,.03);
  for(const x of [-.236,.236]){const cover=add(metalParts,new THREE.CylinderGeometry(.134,.134,.027,36),dark,x,.43,-.22);cover.rotation.z=Math.PI/2;const bolt=add(metalParts,new THREE.CylinderGeometry(.038,.038,.04,16),chrome,x*1.07,.43,-.22);bolt.rotation.z=Math.PI/2;}
  // Belt drive, foot controls and machined brake caliper.
  tube(metalParts,[[-.21,.45,-.95],[-.24,.58,-.66],[-.25,.56,-.23]],.012,frame);tube(metalParts,[[-.21,.45,-.95],[-.24,.32,-.66],[-.25,.35,-.23]],.012,frame);
  for(const x of [-.32,.32]){rod(metalParts,[0,.43,-.17],[x,.43,-.17],.026,chrome);rounded(metalParts,.14,.055,.1,rubber,x,.43,-.17,.015);const indicator=ball(metalParts,.04,material(0xd28b2e,.2,.3),x,1.19,.77,1,.8,1.4);}
  rounded(metalParts,.09,.14,.13,dark,.145,.53,.83,.028);
  add(metalParts,tankGeometry(),paint,0,1.26,.19);
  const cap=add(metalParts,new THREE.CylinderGeometry(.053,.053,.014,32),chrome,0,1.487,.18);
  for(const side of [-1,1]){const badge=add(metalParts,new THREE.PlaneGeometry(.16,.16),new THREE.MeshStandardMaterial({map:logoTexture(),transparent:true,metalness:.35,roughness:.4}),side*.338,1.285,.19);badge.rotation.y=side*Math.PI/2;}
  const seatMaterial=new THREE.MeshStandardMaterial({color:SEAT_COLORS[config.leather],roughness:.76,bumpMap:leatherTexture(),bumpScale:.007});g.userData.seatMaterial=seatMaterial;
  const seatLength=config.seat==='double'?1.12:config.seat==='hump'?.57:.73,seatCenter=-.31-seatLength/2;
  rounded(metalParts,.45,.13,seatLength,seatMaterial,0,1.215,seatCenter,.06);
  tube(metalParts,[[-.211,1.225,-.36],[-.215,1.22,seatCenter-seatLength/2+.045],[0,1.22,seatCenter-seatLength/2],[.215,1.22,seatCenter-seatLength/2+.045],[.211,1.225,-.36]],.006,material(config.leather==='black'?0x61574d:0xae8566,0,.9));
  for(let i=0;i<Math.floor(seatLength/.068);i++)tube(metalParts,[[-.197,1.27,-.38-i*.068],[0,1.284,-.38-i*.068],[.197,1.27,-.38-i*.068]],.003,material(config.leather==='black'?0x4c4c48:0x7a513c,0,.8),8);
  if(config.seat==='hump'){const cowl=ball(metalParts,.26,paint,0,1.23,-1.08,.86,.53,1.1);}
  if(config.seat==='double')for(const x of [-.28,.28]){rod(metalParts,[x*.65,.62,-.77],[x,.61,-.84],.02,chrome);rounded(metalParts,.12,.05,.09,rubber,x,.61,-.84,.014);}
  fender(metalParts,1.03,frame);fender(metalParts,-.98,frame);
  for(const x of [-.11,.11]){rod(metalParts,[x,.51,1.03],[x,.89,1.29],.009,chrome);rod(metalParts,[x,.49,-.98],[x,.88,-1.2],.009,chrome);}
  const head=add(metalParts,new THREE.CylinderGeometry(.195,.172,.19,48),frame,0,1.35,.97);head.rotation.x=Math.PI/2;
  const rim=add(metalParts,new THREE.TorusGeometry(.18,.012,10,48),chrome,0,1.35,1.074);
  const glass=add(metalParts,new THREE.CircleGeometry(.173,48),new THREE.MeshPhysicalMaterial({color:0xf4f2d8,emissive:0xffedbd,emissiveIntensity:.3,metalness:.12,roughness:.18,clearcoat:1}),0,1.35,1.079);
  rounded(metalParts,.275,.019,.012,chrome,0,1.35,1.085,.005);
  for(const x of [-.2,.2])rod(metalParts,[x,1.25,.78],[x,1.37,.96],.017,brushed);
  tube(metalParts,[[-.47,1.39,.57],[-.31,1.44,.59],[-.18,1.45,.65],[.18,1.45,.65],[.31,1.44,.59],[.47,1.39,.57]],.021,chrome);
  for(const x of [-.46,.46]){rod(metalParts,[x,1.39,.54],[x,1.37,.7],.032,rubber);rod(metalParts,[x*.8,1.43,.63],[x*1.07,1.58,.58],.009,chrome);const mirror=add(metalParts,new THREE.CylinderGeometry(.064,.064,.022,32),dark,x*1.07,1.58,.58);mirror.rotation.x=Math.PI/2;const mirrorFace=add(metalParts,new THREE.CircleGeometry(.056,32),chrome,x*1.07,1.58,.594);}
  const dash=rounded(metalParts,.17,.035,.1,frame,0,1.46,.64,.025);dash.rotation.x=.12;
  const display=rounded(metalParts,.13,.003,.064,material(0x183d43,.3,.2),0,1.48,.64,.012);
  tube(metalParts,[[.4,1.4,.61],[.3,1.1,.8],[.15,.81,.91],[.14,.55,1.03]],.008,frame);
  const tailZ=config.seat==='double'?-1.45:-1.12;rounded(metalParts,.17,.045,.04,new THREE.MeshStandardMaterial({color:0xe1392c,emissive:0xb32017,emissiveIntensity:.5}),0,1.16,tailZ,.015);
  const shadow=add(g,new THREE.PlaneGeometry(1.7,3.7),new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,opacity:.45,depthWrite:false}),0,.015,0);shadow.rotation.x=-Math.PI/2;g.userData.shadow=shadow;
  merge(metalParts);
  if(rider){const driver=makeRider(colorIndex,false);body.add(driver);g.userData.helmet=driver.userData.helmet;g.userData.splat=driver.userData.splat;}
  if(config.passenger){const passenger=makeRider((colorIndex+2)%4,true);body.add(passenger);g.userData.passenger=passenger;}
  return g;
}
function makeRider(colorIndex,passenger){const g=new THREE.Group(),off=passenger?-.83:0;g.position.z=off;const jacket=material(passenger?0xb7543d:0xe3dfcd,0,.86),pants=material(0x26323c,0,.9),boot=material(0x222728,0,.7);
  const torso=rounded(g,.49,.59,.29,jacket,0,1.65,-.29,.105);torso.rotation.x=passenger?.13:.37;
  const helmet=new THREE.Group();helmet.position.set(0,2.04,passenger?-.17:.04);g.add(helmet);ball(helmet,.225,material(BIKE_COLORS[colorIndex].hex,.35,.22),0,0,0,1,1.07,1.04);ball(helmet,.226,material(0x152630,.65,.15),0,.005,.058,.97,.39,.85);
  const splat=new THREE.Group();helmet.add(splat);splat.position.set(.025,.247,-.025);for(const [x,z,r] of [[0,0,.055],[.034,.03,.027],[-.035,.02,.025],[.016,-.039,.021]])ball(splat,r,material(0xe9e7c9,0,.85),x,0,z,1,.16,1);ball(splat,.022,material(0x87915e,0,.95),0,.008,0,1,.17,1);splat.visible=false;g.userData.splat=splat;g.userData.helmet=helmet;
  for(const s of [-1,1]){rod(g,[s*.22,1.85,-.16],[s*.33,1.6,passenger?-.05:.23],.082,jacket);rod(g,[s*.33,1.6,passenger?-.05:.23],[s*(passenger?.25:.46),1.4,passenger?.2:.6],.062,jacket);ball(g,.068,boot,s*(passenger?.25:.46),1.4,passenger?.2:.6);rod(g,[s*.21,1.36,-.48],[s*.36,.97,passenger?-.07:.08],.104,pants);rod(g,[s*.36,.97,passenger?-.07:.08],[s*.29,passenger?.64:.48,-.23],.078,pants);rounded(g,.14,.12,.25,boot,s*.29,passenger?.61:.45,-.15,.04);}
  merge(g);return g;
}
export function animateBike(bike,{steer=0,speed=0,wheelie=0,stoppie=0,dirty=false,lean=null}={},dt=1/60){const body=bike.userData.body;const roll=lean??(-steer*Math.min(1,speed/15)*.95);body.rotation.z=THREE.MathUtils.damp(body.rotation.z,roll,7,dt);body.rotation.x=THREE.MathUtils.damp(body.rotation.x,-wheelie*.61+stoppie*.76,8,dt);const pivot=V(0,0,body.rotation.x<0?-.98:1.03);body.position.copy(pivot).sub(pivot.clone().applyQuaternion(body.quaternion));for(const wheel of bike.userData.wheels)wheel.rotation.x+=speed*dt/.48;if(bike.userData.splat)bike.userData.splat.visible=dirty;}
export function makeParrot(){const g=new THREE.Group(),blue=material(0x159bb6,.08,.48),green=material(0x4baf6b,.05,.6),red=material(0xde493d,.05,.5),yellow=material(0xe5b23f,.05,.55),cream=material(0xffedc5,0,.8),black=material(0x192d31,.1,.45);
  ball(g,.45,blue,0,0,0,.8,1.2,.8);ball(g,.32,red,0,.53,.08,.93,1,1);ball(g,.24,cream,0,.51,.29,.9,.9,.34);ball(g,.18,yellow,0,.39,.4,.55,1.2,.75);ball(g,.12,black,0,.29,.42,.5,.6,.55);
  for(const s of [-1,1]){ball(g,.042,black,s*.17,.6,.285,.65,1,.9);ball(g,.013,cream,s*.18,.614,.315);rod(g,[s*.12,-.38,0],[s*.16,-.72,.09],.035,yellow);for(let i=0;i<3;i++)rod(g,[s*.16,-.72,.09],[s*.16+(i-1)*.08,-.77,.24],.018,yellow);}
  const wings=[];for(const s of [-1,1]){const wing=new THREE.Group();wing.position.set(s*.25,.09,-.04);g.add(wing);for(let i=0;i<7;i++){const feather=ball(wing,.22,i<2?green:blue,s*(.2+i*.1),-.08-i*.02,-.02-i*.04,.65,1.5,1);feather.rotation.z=s*.7;}wings.push(wing);}
  for(let i=0;i<3;i++){const tail=ball(g,.18,i%2?yellow:blue,(i-1)*.12,-.49,-.29,.5,2.5,.7);tail.rotation.x=.55;}
  g.userData.wings=wings;const cords=new THREE.Group();g.add(cords);for(const s of [-1,1])rod(cords,[s*.16,-.75,.16],[s*.13,-1.42,.06],.012,yellow);g.userData.cords=cords;g.visible=false;return g;
}
export function animateParrot(parrot,time){for(let i=0;i<2;i++)parrot.userData.wings[i].rotation.z=(i?1:-1)*(Math.sin(time*18)*.85+.2);parrot.rotation.z=Math.sin(time*5)*.05;}
export function studioEnvironment(renderer){const scene=new THREE.Scene();scene.background=new THREE.Color(0xb0b8be);for(const [x,y,z,w,h,d,c] of [[-4,4,0,2,8,6,0xffffff],[3,6,-2,4,2,8,0xfff3dc],[0,1,5,8,3,1,0xd9e4ee],[0,-2,0,20,1,20,0x505958]])add(scene,new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c}),x,y,z);const generator=new THREE.PMREMGenerator(renderer),target=generator.fromScene(scene,.025,.1,100);generator.dispose();scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return target.texture;}
export function disposeBike(bike){const shared=new Set([...cache.values(),leatherMap,logoMap,shadowMap]);bike.traverse(o=>{o.geometry?.dispose();if(o.material&&!shared.has(o.material)){if(o.material.map&&!shared.has(o.material.map))o.material.map.dispose();o.material.dispose();}});}
