export const BIKE_COLORS = [{name:'Racing Green',hex:0x174e39},{name:'Aurum Gold',hex:0xc68a32},{name:'Burnt Orange',hex:0xb8482d},{name:'Midnight Black',hex:0x20272b}];
export const POWER_CLASSES = {
  2: {name:'2 kW · Classic',speedScale:.8,acceleration:8,boostAcceleration:13},
  4: {name:'4 kW · Sport',speedScale:1,acceleration:10,boostAcceleration:16}
};
export const SEAT_COLORS = {brown:0x493026,cognac:0x9a5631,black:0x202123};
export function normalizeBikeConfig(config={}) {
  const passenger=config.passenger===true;
  return {powerClass:Number(config.powerClass)===4?4:2,seat:passenger?'double':['single','hump','double'].includes(config.seat)?config.seat:'single',leather:Object.hasOwn(SEAT_COLORS,config.leather)?config.leather:'brown',passenger};
}
export function recordKey(track,config){return `best:${track}:${normalizeBikeConfig(config).powerClass}kw`;}
