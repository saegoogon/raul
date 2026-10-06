import { BrowserWindow, screen, shell, nativeImage } from "electron";
import { join } from "node:path";
import { is } from "@electron-toolkit/utils";

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

const preload = join(__dirname, "../preload/index.js");
const appIcon = nativeImage.createFromPath(join(__dirname, "../../resources/icon.ico"));

function load(win: BrowserWindow, hash = "") {
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(`${process.env.ELECTRON_RENDERER_URL}${hash}`);
  } else {
    void win.loadFile(join(__dirname, "../renderer/index.html"), { hash: hash.replace("#", "") });
  }
}

export function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 360,
    minHeight: 520,
    show: false,
    backgroundColor: "#0c0c0c",
    autoHideMenuBar: true,
    title: "BlackSmile AI",
    icon: appIcon.isEmpty() ? undefined : appIcon,
    webPreferences: {
      preload,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return { action: "deny" };
  });

  load(mainWindow);
  return mainWindow;
}

export function getMainWindow() {
  return mainWindow;
}

export function createOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.show();
    return overlayWindow;
  }
  const { workArea } = screen.getPrimaryDisplay();
  overlayWindow = new BrowserWindow({
    width: 168,
    height: 210,
    x: workArea.x + workArea.width - 196,
    y: workArea.y + workArea.height - 250,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    icon: appIcon.isEmpty() ? undefined : appIcon,
    webPreferences: {
      preload,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  overlayWindow.setAlwaysOnTop(true, "floating");
  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });
  load(overlayWindow, "#overlay");
  return overlayWindow;
}

export function closeOverlayWindow() {
  overlayWindow?.close();
  overlayWindow = null;
}

export function sendToUi(channel: string, payload: unknown) {
  mainWindow?.webContents.send(channel, payload);
  overlayWindow?.webContents.send(channel, payload);
}
