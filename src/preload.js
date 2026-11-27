// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getMetadata: (url) => ipcRenderer.invoke("yt:getMetadata", url),
  downloadVideo: async (url, format, downloadAll) => await ipcRenderer.invoke("yt:downloadVideo", url, format, downloadAll),
  ping: () => ("Pong"),
  fs: {
    selectDownloadPath: () => ipcRenderer.invoke("fs:selectFolder"),
    seeDownloadPath: async () => await ipcRenderer.invoke("fs:seeSavedFolder"),
  },
  checkEnv: () => ipcRenderer.invoke("checkEnv"),
  window: {
    close: () => ipcRenderer.send("app/close"),
    fullscreen: () => ipcRenderer.send("app/fullscreen"),
    minimize: () => ipcRenderer.send("app/minimize"),
    devTools: () => ipcRenderer.send("app/devTools"),
  }
});