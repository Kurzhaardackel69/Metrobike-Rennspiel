export const PARROT_LINES=[
  'Haha, du Lappen!',
  'Schon wieder, {name}? Du Kurvenkasper! Die Straße ist der bunte Teil!',
  'Dritter Absturz! Du fährst wie ein Sack Kartoffeln, du Bruchpilot!',
  'Viermal runter! Du Vollpfosten, ich bin kein verdammtes Lufttaxi!',
  'Fünf Abstürze! Selbst ein Toaster fährt besser als du, du Oberlappen!',
  'Absturz Nummer {sturz}! Bei dir ist Hopfen und Malz verloren. Ich kündige, du Vollkatastrophe!'
];
export function parseParrotLines(text){return String(text??'').split(/\r?\n/).map(line=>Array.from(line.replace(/[\u0000-\u001f\u007f]/g,'').trim()).slice(0,150).join('')).filter(Boolean).slice(0,12);}
export function parrotLine(falls,custom=[],name='Du'){const lines=custom.length?custom:PARROT_LINES,index=Math.min(lines.length-1,Math.max(0,Math.floor(falls)-1));return lines[index].replaceAll('{name}',name).replaceAll('{sturz}',String(Math.max(1,falls)));}
