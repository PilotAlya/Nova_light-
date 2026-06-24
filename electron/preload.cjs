const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  print: {
    open: (htmlContent) => ipcRenderer.invoke("print:open", htmlContent),
    savePdf: (htmlContent) => ipcRenderer.invoke("print:save-pdf", htmlContent),
  },
  app: {
    getVersion: () => ipcRenderer.invoke("app:get-version"),
    getPaths: () => ipcRenderer.invoke("app:get-paths"),
  },
  platform: process.platform,
});
