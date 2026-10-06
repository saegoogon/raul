import { app, BrowserWindow, globalShortcut } from "electron";
import { optimizer } from "@electron-toolkit/utils";
import { registerIpc } from "./ipc";
import { createTray } from "./tray";
import { createMainWindow } from "./windows";

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => createMainWindow());
}

app.whenReady().then(() => {
  optimizer.registerFramelessWindowIpc();
  registerIpc();
  createTray();
  createMainWindow();
  globalShortcut.register("CommandOrControl+Shift+B", () => createMainWindow());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  // Stay in the tray on Windows.
});
