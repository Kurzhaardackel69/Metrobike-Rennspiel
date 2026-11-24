let manifestPromise,legacyPromise;
const files=new Map();
const manifest=()=>manifestPromise??=fetch('./assets/voices/manifest.json').then(r=>{if(!r.ok)throw Error('Dialogue unavailable');return r.json();}).catch(()=>({}));
function recording(url){if(!files.has(url))files.set(url,fetch(url).then(r=>{if(!r.ok)throw Error('Voice unavailable');return r.arrayBuffer();}).catch(e=>{files.delete(url);throw e;}));return files.get(url);}
function legacy(text){legacyPromise??=new Promise((resolve,reject)=>{if(!window.meSpeak)return reject(Error('No fallback'));window.meSpeak.loadVoice('de',ok=>ok?resolve():reject(Error('No German fallback')));});return legacyPromise.then(()=>new Promise((resolve,reject)=>window.meSpeak.speak(text,{voice:'de',pitch:55,speed:160,amplitude:100,rawdata:true},(ok,id,data)=>ok?resolve(data):reject(Error('Speech failed')))));}
export function chooseGermanVoice(voices,mode='croak'){return voices.filter(v=>/^de(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>score(b)-score(a))[0];function score(v){return (/natural|neural|online/i.test(v.name)?30:0)+(/Google|Katja|Conrad/i.test(v.name)?15:0)+(/de-DE/i.test(v.lang)?5:0)+(mode==='passenger'&&/Katja|Hedda|Anna|Kerstin|Petra|Helena/i.test(v.name)?20:0);}}
export function createParrotVoice(getAudio,isSoundOn,getVolume=()=>1){let token=0,source=null;const cries=new Set();
  function stop(){token++;try{source?.stop();}catch{}source=null;for(const s of cries)try{s.stop();}catch{}cries.clear();window.speechSynthesis?.cancel();const a=getAudio(false);if(a)a.voiceUntil=0;}
  function allowed(){return isSoundOn()&&getVolume()>0;}
  async function play(bytes,mode,request,overlay=false){const audio=getAudio();if(!audio||!allowed())return;const buffer=await audio.ctx.decodeAudioData(bytes.slice(0));if((request!==token&&!overlay)||!allowed())return;
    const s=audio.ctx.createBufferSource(),gain=audio.ctx.createGain(),filter=audio.ctx.createBiquadFilter();s.buffer=buffer;s.playbackRate.value=mode==='screech'?1.38:mode==='croak'?1.22:mode==='hit'?1.04:1.06;
    filter.type='highpass';filter.frequency.value=mode==='croak'||mode==='screech'?230:85;gain.gain.value=mode==='hit'?.8:1.12;s.connect(filter);filter.connect(gain);gain.connect(audio.voiceGain||audio.master);
    const duration=buffer.duration/s.playbackRate.value;audio.voiceUntil=Math.max(audio.voiceUntil||0,audio.ctx.currentTime+duration);if(overlay){cries.add(s);if(cries.size>2){const first=cries.values().next().value;try{first.stop();}catch{}cries.delete(first);}}else source=s;s.onended=()=>{cries.delete(s);s.disconnect();filter.disconnect();gain.disconnect();};s.start();return {engine:'neural-recording',duration};
  }
  async function say(text,mode='croak'){stop();if(!allowed())return;const request=token,list=await manifest();if(request!==token)return;const url=list[text];if(url)try{return await play(await recording(url),mode,request);}catch{/* Device speech still works if an asset fails to load. */}
    if(request!==token||!allowed())return;const voice=chooseGermanVoice(window.speechSynthesis?.getVoices()||[],mode);if(voice){const audio=getAudio(),line=new SpeechSynthesisUtterance(text);line.voice=voice;line.lang='de-DE';line.pitch=mode==='passenger'?1.06:mode==='screech'?1.58:1.35;line.rate=1.03;line.volume=Math.min(1,getVolume()*.95);audio.voiceUntil=audio.ctx.currentTime+Math.max(2,text.length/11);line.onend=()=>{if(request===token)audio.voiceUntil=0;};window.speechSynthesis.speak(line);return {engine:'system',voice:voice.name};}
    try{return {...await play(await legacy(text),mode,request),engine:'fallback'};}catch{return {engine:'unavailable'};}
  }
  return {say,stop,async yell(index=0){if(!allowed())return;const n=Math.abs(index)%3+1;try{return await play(await recording(`./assets/voices/hit-${n}.wav`),'hit',token,true);}catch{}},prepare:()=>{window.speechSynthesis?.getVoices();return manifest().then(list=>Promise.allSettled([list['Haha, du Lappen!'],list['Lass den Scheiß!']].filter(Boolean).map(recording)));}};
}
