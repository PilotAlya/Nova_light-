import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development" || process.argv.includes("--dev");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "NOVA Dashboard",
    icon: path.join(__dirname, "..", "public", "favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: "#0f111b",
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    const distPath = path.join(__dirname, "..", "dist", "index.html");
    if (fs.existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      mainWindow.loadURL("http://localhost:5173");
    }
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── IPC Handlers ────────────────────────────────────────

ipcMain.handle("print:open", async (_event, htmlContent) => {
  if (!mainWindow) return { success: false, error: "No window" };
  const printWin = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Печать",
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    parent: mainWindow,
    modal: true,
    show: false,
  });
  printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  printWin.once("ready-to-show", () => {
    printWin.show();
    printWin.webContents.print({}, (success) => {
      if (!printWin.isDestroyed()) printWin.close();
    });
  });
  return { success: true };
});

ipcMain.handle("print:save-pdf", async (_event, htmlContent) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: "document.pdf",
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (result.canceled) return { success: false, canceled: true };

  const printWin = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  const pdfData = await printWin.webContents.printToPDF({});
  fs.writeFileSync(result.filePath, pdfData);
  if (!printWin.isDestroyed()) printWin.close();
  return { success: true, path: result.filePath };
});

ipcMain.handle("app:get-version", () => app.getVersion());
ipcMain.handle("app:get-paths", () => ({
  userData: app.getPath("userData"),
  documents: app.getPath("documents"),
  desktop: app.getPath("desktop"),
}));

// ── App Lifecycle ───────────────────────────────────────

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
