export const HORN_LINE='Aus dem Weg, ihr Geringverdiener!';
export const HORN_COOLDOWN=4;
export function hornState(){return {hornCooldown:0,previousHorn:false,horns:0};}
export function updateHorn(state,dt,pressed,enabled=true){state.hornCooldown=Math.max(0,state.hornCooldown-dt);const trigger=enabled&&!!pressed&&!state.previousHorn&&state.hornCooldown===0;state.previousHorn=!!pressed;if(trigger){state.hornCooldown=HORN_COOLDOWN;state.horns++;}return trigger;}
export function hornSound(audio,volume=1){if(!audio||!volume)return;const {ctx}=audio,t=ctx.currentTime;for(const frequency of [220,277]){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sawtooth';o.frequency.value=frequency;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume*.055,t+.015);g.gain.setValueAtTime(volume*.055,t+.13);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g);g.connect(audio.master);o.start(t);o.stop(t+.21);o.onended=()=>{o.disconnect();g.disconnect();};}}
