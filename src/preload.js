// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getMetadata: (url) => ipcRenderer.invoke("yt:getMetadata", url),
  downloadVideo: async (url, format) => await ipcRenderer.invoke("yt:downloadVideo", url, format),
  ping: () => ("Pong"),
  window: {
    close: () => ipcRenderer.send("app/close"),
    fullscreen: () => ipcRenderer.send("app/fullscreen"),
    minimize: () => ipcRenderer.send("app/minimize"),
    devTools: () => ipcRenderer.send("app/devTools"),
  }
})