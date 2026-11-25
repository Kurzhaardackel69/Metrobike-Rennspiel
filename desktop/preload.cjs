const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('MetorbikeDesktop',{getServerInfo:()=>ipcRenderer.invoke('metorbike:server-info')});
