import {app,BrowserWindow,Menu,clipboard,dialog,ipcMain,shell} from 'electron';
import {networkInterfaces} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createMxServer} from '../multiplayer/server.mjs';
let server,window,origin,info,stopping=false;
if(!app.requestSingleInstanceLock())app.quit();else{
 app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});
 app.on('window-all-closed',()=>app.quit());
 app.on('before-quit',event=>{if(server&&!stopping){event.preventDefault();stopping=true;server.close().finally(()=>app.quit());}});
 app.whenReady().then(async()=>{
 try{
  server=createMxServer();let address;
  for(let port=8787;port<=8797;port++){try{address=await server.listen(port,'0.0.0.0');break;}catch(e){if(e.code!=='EADDRINUSE')throw e;}}
  if(!address)throw Error('Die Testserver-Ports 8787–8797 sind bereits belegt.');
  origin=`http://127.0.0.1:${address.port}`;
  const addresses=Object.entries(networkInterfaces()).filter(([name])=>!/virtual|vethernet|vmware|docker|wsl|loopback/i.test(name)).flatMap(([,list])=>list||[]).filter(a=>a.family==='IPv4'&&!a.internal&&/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a.address)).map(a=>({http:`http://${a.address}:${address.port}`,ws:`ws://${a.address}:${address.port}/ws`}));
  info={port:address.port,addresses,localUrl:origin};
  ipcMain.handle('metorbike:server-info',event=>{if(new URL(event.senderFrame.url).origin!==origin)throw Error('Invalid origin');return info;});
  window=new BrowserWindow({width:1440,height:900,minWidth:960,minHeight:640,backgroundColor:'#f1f0e9',title:'Metorbike Racing 1.7',webPreferences:{preload:fileURLToPath(new URL('./preload.cjs',import.meta.url)),nodeIntegration:false,contextIsolation:true,sandbox:true}});
  const external=url=>{try{const u=new URL(url);if(['https:','spotify:'].includes(u.protocol))shell.openExternal(u.href).catch(()=>{});}catch{}};
  window.webContents.setWindowOpenHandler(({url})=>{external(url);return {action:'deny'};});
  window.webContents.on('will-navigate',(event,url)=>{if(new URL(url).origin!==origin){event.preventDefault();external(url);}});
  window.webContents.session.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Spiel',submenu:[{label:'Serveradresse kopieren',click:()=>{if(addresses[0])clipboard.writeText(addresses[0].ws);}},{label:'Multiplayer-Anleitung',click:()=>dialog.showMessageBox(window,{title:'Gemeinsam testen',message:'2 bis 5 Spieler im selben Netzwerk',detail:'1. Alle entpacken die ZIP und starten Metorbike-Racing.exe.\n2. Der Gastgeber öffnet 2D MX und erstellt einen Raum.\n3. Er teilt seine Serveradresse und den Raumcode.\n4. Mitspieler tragen beides unter 2D MX ein und klicken Beitreten.\n5. Der Gastgeber startet, sobald alle verbunden sind.\n\nDeine Serveradressen:\n'+addresses.map(a=>a.ws).join('\n')+'\n\nGast-WLANs können Geräte voneinander trennen. Für verschiedene Internetanschlüsse braucht ihr später einen gemeinsamen öffentlichen Server.'})},{type:'separator'},{role:'quit',label:'Beenden'}]},{label:'Ansicht',submenu:[{role:'reload',label:'Neu laden'},{role:'togglefullscreen',label:'Vollbild'},{role:'resetZoom',label:'Originalgröße'}]}]));
  await window.loadURL(origin);
 }catch(error){console.error(error);dialog.showErrorBox('Metorbike konnte nicht starten',error.message);app.quit();}
 });
}
