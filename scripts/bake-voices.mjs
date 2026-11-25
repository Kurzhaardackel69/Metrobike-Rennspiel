// Rebuild bundled dialogue using official Piper binaries and CC0 German voices.
// See THIRD_PARTY_NOTICES.md for pinned model URLs. No model is shipped to players.
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parrotLine} from '../dist/parrot-lines.mjs';
import {HORN_LINE} from '../dist/horn.mjs';
const root=path.resolve(import.meta.dirname,'..'),exe=path.resolve(process.argv.slice(2).find(arg=>!arg.startsWith('--'))||path.join(root,'reference/voice-tools/piper/piper.exe'));
const out=path.join(root,'dist/assets/voices');await mkdir(out,{recursive:true});
const lines=Array.from({length:20},(_,i)=>({id:`parrot-${i+1}`,text:parrotLine(i+1),speaker_id:i<2?0:1}));
const hits=[{id:'hit-1',text:'Aaaah! Aua!',speaker_id:6},{id:'hit-2',text:'Aaah! Mein Bike!',speaker_id:1},{id:'hit-3',text:'Aua! Aaah!',speaker_id:6}];
async function bake(model,items){const child=spawn(exe,['--model',path.join(root,`reference/${model}.onnx`),'--json-input','--length_scale','.91','--noise_scale','.55','--sentence_silence','.08'],{cwd:path.dirname(exe),windowsHide:true,stdio:['pipe','ignore','pipe']});let errors='';child.stderr.on('data',d=>errors+=d);child.stdin.end(items.map(i=>JSON.stringify({...i,output_file:path.join(out,i.id+'.wav')})).join('\n')+'\n');await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(errors)));});}
const driver={id:'horn',text:HORN_LINE,speaker_id:1},passenger={id:'passenger',text:'Lass den Scheiß!'},onlyHorn=process.argv.includes('--horn-only'),items=onlyHorn?[driver]:[...lines,...hits,driver,passenger];
await bake('thorsten',onlyHorn?[driver]:[...lines,...hits,driver]);if(!onlyHorn)await bake('kerstin',[passenger]);
const manifest=onlyHorn?JSON.parse(await readFile(path.join(out,'manifest.json'),'utf8')):{};for(const item of items){const file=path.join(out,item.id+'.wav'),b=await readFile(file);if(b.toString('ascii',0,4)!=='RIFF'||b.length<2000)throw Error('Invalid recording '+file);let peak=0;for(let i=44;i+1<b.length;i+=2)peak=Math.max(peak,Math.abs(b.readInt16LE(i)));const factor=Math.min(3,28500/Math.max(peak,1));for(let i=44;i+1<b.length;i+=2)b.writeInt16LE(Math.round(b.readInt16LE(i)*factor),i);await writeFile(file,b);manifest[item.text]=`./assets/voices/${item.id}.wav`;}
await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(`Generated ${Object.keys(manifest).length} neural dialogue clips.`);
