export const BIKE_COLORS = [{name:'Racing Green',hex:0x174e39},{name:'Aurum Gold',hex:0xc68a32},{name:'Burnt Orange',hex:0xb8482d},{name:'Midnight Black',hex:0x20272b}];
export const POWER_CLASSES = {
  2: {name:'2 kW · Classic',speedScale:.8,acceleration:8,boostAcceleration:13},
  4: {name:'4 kW · Sport',speedScale:1,acceleration:10,boostAcceleration:16}
};
export const SEAT_COLORS = {brown:0x493026,cognac:0x9a5631,black:0x202123};
export function normalizeBikeConfig(config={}) {
  const passenger=config.passenger===true;
  return {powerClass:Number(config.powerClass)===4?4:2,seat:passenger?'double':['single','hump','double'].includes(config.seat)?config.seat:'single',leather:Object.hasOwn(SEAT_COLORS,config.leather)?config.leather:'brown',handlebar:config.handlebar==='high'?'high':'clipon',passenger};
}
export const DIFFICULTIES={easy:{name:'Locker',speed:.8,acceleration:.65,corner:1.25},normal:{name:'Normal',speed:1,acceleration:.8,corner:1},hard:{name:'Profi',speed:1.15,acceleration:1.1,corner:.72}};
export function normalizePlayerName(name){return Array.from(String(name??'').replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim()).slice(0,20).join('')||'Du';}
export function normalizeRaceSettings(settings={}){const laps=Number(settings.laps);return {laps:Number.isInteger(laps)?Math.max(1,Math.min(10,laps)):3,difficulty:Object.hasOwn(DIFFICULTIES,settings.difficulty)?settings.difficulty:'normal',playerName:normalizePlayerName(settings.playerName)};}
export function recordKey(track,config,settings={}){const race=normalizeRaceSettings(settings);return `best:${track}:${normalizeBikeConfig(config).powerClass}kw:${race.laps}laps:${race.difficulty}`;}
export function handlebarSpec(type){return type==='high'?{height:1.74,z:.53,elbow:1.76}:{height:1.38,z:.62,elbow:1.6};}
