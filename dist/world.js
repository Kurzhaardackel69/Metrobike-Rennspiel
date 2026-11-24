import * as THREE from './assets/three.module.js';
import {wrap} from './race-core.mjs';
export {THREE};
const V = (x,y,z) => new THREE.Vector3(x,y,z);
const materials = new Map();
function mat(color, metalness = 0, roughness = .6, emissive = 0) {
  const key = `${color}/${metalness}/${roughness}/${emissive}`;
  if (!materials.has(key)) materials.set(key,new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:emissive ? .7 : 0}));
  return materials.get(key);
}
function mesh(geo, material, parent, x=0,y=0,z=0) { const m = new THREE.Mesh(geo,material); m.position.set(x,y,z); parent.add(m); return m; }
function box(parent,w,h,d,color,x=0,y=0,z=0,metal=0) { return mesh(new THREE.BoxGeometry(w,h,d),mat(color,metal),parent,x,y,z); }
function sphere(parent,r,color,x,y,z,sx=1,sy=1,sz=1) { const m=mesh(new THREE.SphereGeometry(r,24,16),mat(color,.18,.35),parent,x,y,z);m.scale.set(sx,sy,sz);return m; }
function rod(parent,a,b,r,color,metal=.7) {const va=V(...a),vb=V(...b),m=mesh(new THREE.CylinderGeometry(r,r,va.distanceTo(vb),10),mat(color,metal,.3),parent);m.position.copy(va).add(vb).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),vb.sub(va).normalize());return m;}
function labelTexture(text,bg='#f2efe4',fg='#17333c',size=512) {const c=document.createElement('canvas');c.width=size;c.height=size/4;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=fg;ctx.font=`800 ${size/13}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,size/2,size/8);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
export const BIKE_COLORS = [{name:'Racing Green',hex:0x486753},{name:'Aurum Gold',hex:0xc9933e},{name:'Burnt Orange',hex:0xc4513c},{name:'Midnight Black',hex:0x2d3740}];
export function makeBike(colorIndex=0,rider=false) {
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);g.userData.body=body;
  const paint=new THREE.MeshStandardMaterial({color:BIKE_COLORS[colorIndex].hex,metalness:.55,roughness:.24});g.userData.paint=paint;
  const chrome=0xc5ccca,black=0x202629;
  g.userData.wheels=[];
  for(const z of [-.92,.98]){
    const wheel=new THREE.Group();wheel.position.set(0,.49,z);body.add(wheel);g.userData.wheels.push(wheel);
    const tire=mesh(new THREE.TorusGeometry(.373,.115,12,36),mat(0x171d20,0,.92),wheel);tire.rotation.y=Math.PI/2;
    const rim=mesh(new THREE.TorusGeometry(.3,.025,8,32),mat(chrome,.85,.21),wheel);rim.rotation.y=Math.PI/2;
    for(let i=0;i<12;i++){const a=i*Math.PI/6;rod(wheel,[0,0,0],[0,Math.sin(a)*.31,Math.cos(a)*.31],.009,chrome);}
    const hub=mesh(new THREE.CylinderGeometry(.1,.1,.2,16),mat(chrome,.8,.3),wheel);hub.rotation.z=Math.PI/2;
    const disc=mesh(new THREE.CylinderGeometry(.23,.23,.018,24),mat(0x8d9696,.85,.4),wheel,.13,0,0);disc.rotation.z=Math.PI/2;
    for(let i=0;i<20;i++){const a=i*Math.PI/10;const tread=box(wheel,.14,.012,.04,0x2b3131,0,Math.sin(a)*.487,Math.cos(a)*.487);tread.rotation.x=-a;}
  }
  rod(body,[0,.5,-.92],[0,1.12,-.3],.045,black);rod(body,[0,.5,-.92],[0,.6,.45],.045,black);rod(body,[0,1.12,-.3],[0,.6,.45],.04,black);rod(body,[0,1.12,-.3],[0,1.25,.52],.04,black);rod(body,[0,.6,.45],[0,1.25,.52],.045,black);
  for(const x of [-.16,.16]){rod(body,[x,.5,.98],[x,1.48,.65],.035,chrome);rod(body,[x,.5,-.92],[x,1.1,-.6],.045,0x343c3e);rod(body,[x,.56,-.85],[x,1.04,-.58],.022,chrome);}
  const battery=box(body,.48,.42,.5,black,0,.78,-.05);battery.rotation.x=-.1;
  for(let i=0;i<6;i++)box(body,.51,.019,.49,0x555d5d,0,.65+i*.053,-.05,.6);
  const tank=mesh(new THREE.SphereGeometry(1,32,20),paint,body,0,1.24,.23);tank.scale.set(.31,.255,.53);
  const cap=mesh(new THREE.CylinderGeometry(.061,.061,.02,20),mat(chrome,.85,.15),body,0,1.49,.16);
  const seat=box(body,.48,.13,.72,0x6b4937,0,1.18,-.51);seat.geometry=new THREE.BoxGeometry(.48,.13,.72,1,1,1);
  sphere(body,.23,0x6b4937,0,1.18,-.82,1,.28,.7);
  for(let i=0;i<8;i++)box(body,.49,.008,.012,0x8b6650,0,1.251,-.83+i*.087);
  box(body,.26,.05,.56,black,0,1.06,-.6);
  const backLight=box(body,.2,.075,.06,0xdd3c32,0,1.04,-1.06);backLight.material=mat(0x8f2320,.2,.3,0xcf3621);
  const headlight=mesh(new THREE.CylinderGeometry(.195,.19,.18,28),mat(chrome,.8,.18),body,0,1.35,.94);headlight.rotation.x=Math.PI/2;
  const light=mesh(new THREE.CylinderGeometry(.161,.161,.012,28),mat(0xffefc2,.1,.2,0xffdf9a),body,0,1.35,1.035);light.rotation.x=Math.PI/2;
  rod(body,[-.48,1.45,.56],[.48,1.45,.56],.025,chrome);rod(body,[-.48,1.45,.56],[-.49,1.45,.72],.035,black);rod(body,[.48,1.45,.56],[.49,1.45,.72],.035,black);
  rod(body,[-.42,1.45,.6],[-.49,1.7,.64],.012,chrome);rod(body,[.42,1.45,.6],[.49,1.7,.64],.012,chrome);
  for(const x of [-.5,.5]){const mirror=mesh(new THREE.CylinderGeometry(.072,.072,.025,20),mat(chrome,.9,.15),body,x,1.7,.64);mirror.rotation.x=Math.PI/2;}
  for(const z of [-.92,.98]) {const f=mesh(new THREE.TorusGeometry(.5,.028,8,24,Math.PI*.85),paint,body,0,.49,z);f.rotation.y=Math.PI/2;f.rotation.z=.24;}
  rod(body,[-.29,.58,-.25],[.29,.58,-.25],.035,black);
  const tx=labelTexture('METORBIKE','#486753','#f3f0e0');tx.needsUpdate=true;
  for(const side of [-1,1]){const badge=mesh(new THREE.PlaneGeometry(.59,.145),new THREE.MeshBasicMaterial({map:tx,transparent:false}),body,side*.294,1.25,.21);badge.rotation.y=side*Math.PI/2;}
  const shadow=mesh(new THREE.PlaneGeometry(1.6,3.3),new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false,opacity:.4}),g,0,.015,0);shadow.rotation.x=-Math.PI/2;
  if(rider){
    const jacket=colorIndex===3?0x424b4b:0xe4dfcc;
    const torso=box(body,.53,.64,.3,jacket,0,1.65,-.25);torso.rotation.x=.37;
    sphere(body,.235,BIKE_COLORS[colorIndex].hex,0,2.12,-.02,1,1.08,1.06);
    const visor=sphere(body,.24,0x152c39,0,2.12,.07,1,.42,.8);visor.material=mat(0x203644,.7,.15);
    rod(body,[-.25,1.88,-.13],[-.36,1.58,.23],.105,jacket,.05);rod(body,[.25,1.88,-.13],[.36,1.58,.23],.105,jacket,.05);
    rod(body,[-.36,1.58,.23],[-.47,1.46,.59],.072,jacket,.05);rod(body,[.36,1.58,.23],[.47,1.46,.59],.072,jacket,.05);
    for(const x of [-.25,.25]){rod(body,[x,1.38,-.4],[x*1.6,.99,.04],.12,0x313d47,.05);rod(body,[x*1.6,.99,.04],[x*1.3,.59,-.24],.09,0x313d47,.05);box(body,.15,.13,.28,black,x*1.3,.56,-.15);}
  }
  // Consolidate static parts by material. Detailed bikes stay inexpensive on phones.
  for(const wheel of g.userData.wheels)mergeStaticParts(wheel);
  mergeStaticParts(body);
  return g;
}
function mergeStaticParts(parent){
  const groups=new Map();
  for(const child of [...parent.children]){if(!child.isMesh||Array.isArray(child.material))continue;const key=child.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(child);}
  for(const parts of groups.values()){
    if(parts.length<2)continue;const positions=[],normals=[],uvs=[];
    for(const part of parts){part.updateMatrix();const geo=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();geo.applyMatrix4(part.matrix);const pos=geo.getAttribute('position'),normal=geo.getAttribute('normal'),uv=geo.getAttribute('uv');for(let i=0;i<pos.count;i++){positions.push(pos.getX(i),pos.getY(i),pos.getZ(i));normals.push(normal ? normal.getX(i) : 0,normal ? normal.getY(i) : 1,normal ? normal.getZ(i) : 0);uvs.push(uv?.getX(i)||0,uv?.getY(i)||0);}geo.dispose();parent.remove(part);part.geometry.dispose();}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));mesh(geo,parts[0].material,parent);
  }
}
let shadowMap;
function shadowTexture(){if(shadowMap)return shadowMap;const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const gr=ctx.createRadialGradient(64,64,3,64,64,64);gr.addColorStop(0,'#000b');gr.addColorStop(1,'#0000');ctx.fillStyle=gr;ctx.fillRect(0,0,128,128);return shadowMap=new THREE.CanvasTexture(c);}
export function createShowroom() {
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xf1f0e9);scene.fog=new THREE.Fog(0xf1f0e9,16,45);
  scene.add(new THREE.HemisphereLight(0xffffff,0xb0b7a6,3));const sun=new THREE.DirectionalLight(0xfff4d8,4);sun.position.set(4,8,5);scene.add(sun);const rim=new THREE.DirectionalLight(0xb3c7d6,2);rim.position.set(-5,3,-2);scene.add(rim);
  const ground=mesh(new THREE.PlaneGeometry(200,200),mat(0xe4e7dc,0,.9),scene,0,-.05,0);ground.rotation.x=-Math.PI/2;
  const stage=mesh(new THREE.CylinderGeometry(2.7,2.8,.09,80),mat(0xd3daca,0,.8),scene,0,-.015,0);
  const ring=mesh(new THREE.TorusGeometry(2.72,.012,8,100),mat(0xa4b49d,0,.8),scene,0,.04,0);ring.rotation.x=Math.PI/2;
  const bike=makeBike();scene.add(bike);
  return {scene,bike};
}
const TRACK_DEFS={
  kart:{id:'kart',name:'Kartbahn',halfWidth:7.3,pads:[.18,.48,.77],points:[[0,0,-100],[62,0,-100],[105,0,-66],[100,0,-9],[63,0,9],[36,0,-25],[0,0,-22],[-12,0,17],[29,0,49],[65,0,60],[63,0,102],[1,0,116],[-64,0,100],[-95,0,49],[-92,0,-29],[-58,0,-89]]},
  star:{id:'star',name:'Sternenallee',halfWidth:8.3,pads:[.12,.39,.67,.88],points:[[0,15,-115],[85,24,-115],[139,38,-50],[92,43,7],[29,24,26],[25,16,88],[91,26,115],[108,46,179],[40,58,209],[-42,45,170],[-71,24,109],[-126,12,54],[-157,22,-12],[-119,35,-72],[-66,25,-105]]}
};
export function trackData(id){const def=TRACK_DEFS[id];const curve=new THREE.CatmullRomCurve3(def.points.map(p=>V(...p)),true,'centripetal');curve.arcLengthDivisions=1600;curve.updateArcLengths();const length=curve.getLength();const samples=Array.from({length:1601},(_,i)=>{const t=i/1600;const p=curve.getPointAt(t), tangent=curve.getTangentAt(t).normalize();return {p,tangent,side:V(tangent.z,0,-tangent.x).normalize()};});
  function sample(t){t=wrap(t,1);const i=t*1600,j=Math.floor(i),alpha=i-j;const a=samples[j],b=samples[j+1];return {p:a.p.clone().lerp(b.p,alpha),tangent:a.tangent.clone().lerp(b.tangent,alpha).normalize(),side:a.side.clone().lerp(b.side,alpha).normalize()};}
  function curvature(t){const a=sample(t-.002).tangent,b=sample(t+.002).tangent;return Math.atan2(a.z*b.x-a.x*b.z,a.x*b.x+a.z*b.z)/(.004*length);}
  return {...def,curve,length,sample,curvature};
}
function ribbon(data,startOffset,endOffset,lift,colorFn,segments=700){const vertices=[],colors=[],indices=[];for(let i=0;i<=segments;i++){const t=i/segments,{p,side}=data.sample(t);for(const off of [startOffset,endOffset]){const pos=p.clone().addScaledVector(side,off);vertices.push(pos.x,pos.y+lift,pos.z);const col=new THREE.Color(colorFn(t,off));colors.push(col.r,col.g,col.b);}if(i<segments){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;}
function addRibbon(parent,data,a,b,lift,colorFn,glow=false){const geo=ribbon(data,a,b,lift,colorFn);const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:.12,side:THREE.DoubleSide,...(glow?{emissive:0xffffff,emissiveMap:null,emissiveIntensity:.15}: {})}));parent.add(m);return m;}
function placeOnTrack(object,data,t,offset=0,y=0){const {p,tangent,side}=data.sample(t);object.position.copy(p).addScaledVector(side,offset);object.position.y+=y;object.rotation.y=Math.atan2(tangent.x,tangent.z);return object;}
function rng(seed){let s=seed;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function buildKartScenery(scene,data){
  const random=rng(2026);
  const ground=mesh(new THREE.PlaneGeometry(2000,2000),mat(0x92ad78,0,1),scene,0,-.13,0);ground.rotation.x=-Math.PI/2;
  // Procedural grass flecks and tree canopies share geometry for inexpensive instancing.
  const treeGeo=new THREE.IcosahedronGeometry(1,1);const trees=new THREE.InstancedMesh(treeGeo,mat(0x42644b,0,.95),190);const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.32,.5,3.4,6),mat(0x725847,0,1),190);const dummy=new THREE.Object3D();let count=0;
  for(let tries=0;count<190 && tries<2000;tries++){
    const x=(random()-.5)*470,z=(random()-.5)*430;let nearest=1000;for(let j=0;j<180;j++){const p=data.sample(j/180).p;nearest=Math.min(nearest,Math.hypot(p.x-x,p.z-z));}if(nearest<15 || (Math.abs(x)<45&&Math.abs(z)<60))continue;
    const s=3+random()*4;dummy.position.set(x,3+s*.4,z);dummy.scale.set(s,s*.95,s);dummy.rotation.set(random(),random(),random());dummy.updateMatrix();trees.setMatrixAt(count,dummy.matrix);trees.setColorAt(count,new THREE.Color().setHSL(.28+random()*.07,.2+random()*.12,.24+random()*.1));dummy.position.set(x,1.6,z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();trunks.setMatrixAt(count,dummy.matrix);count++;
  }trees.count=trunks.count=count;scene.add(trees,trunks);
  const hills=new THREE.InstancedMesh(new THREE.SphereGeometry(1,20,10),mat(0x7f9f75,0,1),24);for(let i=0;i<24;i++){const a=i/24*Math.PI*2;dummy.position.set(Math.cos(a)*440,-20,Math.sin(a)*440);dummy.scale.set(100+random()*60,55+random()*40,100);dummy.updateMatrix();hills.setMatrixAt(i,dummy.matrix);}scene.add(hills);
  // Paddock, pit garages, grandstand and corner markers.
  box(scene,38,5,13,0xd9d7c7,-18,2.5,-119);box(scene,41,.7,15,0x36524b,-18,5.35,-119);
  for(let i=0;i<6;i++)box(scene,4.4,3.5,.12,0x576568,-33+i*6,1.75,-112.4);
  const sign=mesh(new THREE.PlaneGeometry(28,4),new THREE.MeshBasicMaterial({map:labelTexture('METORBIKE   RACING CLUB','#19333c','#f3f0e7')}),scene,-18,7,-111.8);sign.rotation.y=0;
  for(let i=0;i<5;i++){box(scene,55,.8,3,0xb5bfb3,-3,.4+i*1.1,141+i*2.2);box(scene,55,.12,2.8,0xe4d9bc,-3,.84+i*1.1,141+i*2.2);}
  const canopy=box(scene,59,.35,16,0x36524b,-3,9,147);canopy.rotation.x=.08;
  for(const x of [-29,24])rod(scene,[x,0,140],[x,9,140],.14,0x637772);
  const tireGeo=new THREE.TorusGeometry(.64,.24,6,12),tireMat=mat(0x263433,0,1),tires=new THREE.InstancedMesh(tireGeo,tireMat,220);
  for(let i=0;i<220;i++){const t=i/220,{p,side}=data.sample(t);dummy.position.copy(p).addScaledVector(side,(i%2?1:-1)*(data.halfWidth+2.3));dummy.position.y+=.56;dummy.rotation.set(Math.PI/2,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();tires.setMatrixAt(i,dummy.matrix);}scene.add(tires);
  for(let i=0;i<14;i++){const t=i/14,{p,side}=data.sample(t);const pole=new THREE.Group();rod(pole,[0,0,0],[0,8,0],.07,0x9aaba3);const flag=box(pole,2,1.25,.03,i%2?0xf2eee1:0xe65c40,1,7.2,0);pole.position.copy(p).addScaledVector(side,12.3);scene.add(pole);}
  // Low poly clouds.
  for(let i=0;i<18;i++){const a=random()*Math.PI*2;const cloud=new THREE.Group();for(let j=0;j<4;j++)sphere(cloud,8,0xf7f7e9,j*9,Math.sin(j)*3,0,1,.5,.6);cloud.position.set(Math.cos(a)*330,75+random()*45,Math.sin(a)*330);scene.add(cloud);}
}
function buildSpaceScenery(scene,data){
  const random=rng(777),positions=[],colors=[];for(let i=0;i<1800;i++){const d=700+random()*1100,a=random()*Math.PI*2,h=(random()-.5)*2;positions.push(Math.cos(a)*d,120+h*900,Math.sin(a)*d);const c=new THREE.Color().setHSL(.55+random()*.25,.15+random()*.35,.6+random()*.4);colors.push(c.r,c.g,c.b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:1.8,vertexColors:true,sizeAttenuation:true})));
  const planet=sphere(scene,70,0x9e6caa,-250,140,100);planet.material=mat(0x785687,.15,.9,0x30153b);
  const ring=mesh(new THREE.RingGeometry(90,115,80),new THREE.MeshBasicMaterial({color:0xcba6c6,side:THREE.DoubleSide,transparent:true,opacity:.5}),scene,-250,140,100);ring.rotation.set(Math.PI/2.6,.4,.3);
  const moon=sphere(scene,30,0xd5c29b,240,120,-290);moon.material=mat(0x8ba9be,.1,.9,0x25354f);
  for(let i=0;i<28;i++){const t=i/28;const star=new THREE.Group();const core=mesh(new THREE.OctahedronGeometry(.8),mat(0xffe2ac,.4,.3,0xffb844),star,0,0,0);core.scale.y=1.7;placeOnTrack(star,data,t,(i%2?1:-1)*(data.halfWidth+4),3.5+Math.sin(i)*1.4);scene.add(star);}
  // Trackside portals mark sweeping bends.
  for(let i=1;i<8;i++){const t=i/8;const portal=new THREE.Group();const arch=mesh(new THREE.TorusGeometry(data.halfWidth+1.4,.13,6,40,Math.PI),mat(0xb2b0fa,.2,.4,0x6563ad),portal,0,0,0);arch.rotation.z=0;placeOnTrack(portal,data,t,0,.1);scene.add(portal);}
}
export function createRaceWorld(data){
  const space=data.id==='star',scene=new THREE.Scene();scene.background=new THREE.Color(space?0x10152f:0xc3d9db);scene.fog=new THREE.FogExp2(space?0x10152f:0xc3d9db,space?.0007:.0018);
  scene.add(new THREE.HemisphereLight(space?0xb8caff:0xfffae5,space?0x58538b:0x698761,space?2.7:2.7));const sun=new THREE.DirectionalLight(space?0xd8d0ff:0xffecd0,space?3:3.5);sun.position.set(70,130,-90);scene.add(sun);
  if(space){
    const rainbow=[0xdb6a83,0xd59761,0xd3c76b,0x69b499,0x649ec9,0x8983c8,0xae78bc];
    for(let i=0;i<7;i++)addRibbon(scene,data,-data.halfWidth+i*data.halfWidth*2/7,-data.halfWidth+(i+1)*data.halfWidth*2/7,0,()=>rainbow[i]);
    addRibbon(scene,data,-data.halfWidth-.25,-data.halfWidth,.04,()=>0xd9ddff,true);addRibbon(scene,data,data.halfWidth,data.halfWidth+.25,.04,()=>0xd9ddff,true);
    for(const side of [-1,1]){const pts=Array.from({length:420},(_,i)=>{const {p,side:s}=data.sample(i/419);return p.addScaledVector(s,side*(data.halfWidth+.25)).add(V(0,.9,0));});const rail=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),420,.07,4,false),mat(0xa8c3ff,.25,.3,0x536ca1),scene);}
    buildSpaceScenery(scene,data);
  }else{
    addRibbon(scene,data,-data.halfWidth,data.halfWidth,.015,()=>0x454d4b);
    for(const s of [-1,1]){const a=s*data.halfWidth,b=s*(data.halfWidth+1.05);addRibbon(scene,data,Math.min(a,b),Math.max(a,b),.025,t=>Math.floor(t*150)%2?0xe3e5d9:0xca624e);const x=s*(data.halfWidth-.18);addRibbon(scene,data,x-.07,x+.07,.035,()=>0xd9ded4);}
    // Subtle tarmac grain is baked to a tiny repeating procedural texture.
    const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const pixels=ctx.createImageData(128,128);const random=rng(4);for(let i=0;i<pixels.data.length;i+=4){const v=120+random()*35;pixels.data.set([v,v,v,255],i);}ctx.putImageData(pixels,0,0);const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(35,35);
    buildKartScenery(scene,data);
  }
  const pads=[];
  for(const t of data.pads){const group=new THREE.Group();box(group,7.4,.035,4.8,space?0xffcb87:0xe3af58,0,.04,0);for(let i=0;i<3;i++){const arrow=mesh(new THREE.ConeGeometry(.55,1.4,3),new THREE.MeshBasicMaterial({color:0xfff3b5}),group,-2.5+i*2.5,.08,0);arrow.rotation.x=Math.PI/2;arrow.scale.set(1,1,.08);}placeOnTrack(group,data,t);scene.add(group);pads.push(group);}
  // Start / finish gantry and checkerboard line.
  const gate=new THREE.Group();for(const x of [-data.halfWidth-1,data.halfWidth+1])box(gate,.35,7,.35,space?0xbcb5e5:0xece8d8,x,3.5,0);const sign=mesh(new THREE.PlaneGeometry(data.halfWidth*2+2,2.5),new THREE.MeshBasicMaterial({map:labelTexture('METORBIKE   /   RACING CLUB','#19333c','#f1eee2'),side:THREE.DoubleSide}),gate,0,6.1,0);placeOnTrack(gate,data,0);scene.add(gate);
  const finishLine=new THREE.Group();for(let x=0;x<14;x++)for(let z=0;z<2;z++)box(finishLine,data.halfWidth/7,.015,.65,(x+z)%2?0xeff0e4:0x283a3b,-data.halfWidth+(x+.5)*data.halfWidth/7,.055,z*.65);placeOnTrack(finishLine,data,0);scene.add(finishLine);
  return {scene,pads};
}
export function updateBikePose(bike,data,progress,offset,steer,speed,dt){const {p,tangent,side}=data.sample(progress/data.length);bike.position.copy(p).addScaledVector(side,offset);bike.position.y+=.06;bike.rotation.set(-Math.asin(tangent.y),Math.atan2(tangent.x,tangent.z),0,'YXZ');bike.userData.body.rotation.z=THREE.MathUtils.damp(bike.userData.body.rotation.z,-steer*.27,8,dt);for(const wheel of bike.userData.wheels)wheel.rotation.x+=speed*dt/.49;return {p,tangent,side};}
export function disposeWorld(scene){scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list){if(![...materials.values()].includes(m)){m.map?.dispose();m.dispose();}}}});}
