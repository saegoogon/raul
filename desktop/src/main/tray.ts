import { Menu, Tray, nativeImage, app } from "electron";
import { join } from "node:path";
import { createMainWindow, getMainWindow } from "./windows";

let tray: Tray | null = null;
let paused = false;

export function isPaused() {
  return paused;
}

export function createTray() {
  if (tray) return tray;
  const icon = nativeImage.createFromPath(join(__dirname, "../../resources/tray.png"));
  tray = new Tray(icon.isEmpty() ? nativeImage.createFromPath(join(__dirname, "../../resources/icon.ico")) : icon);
  tray.setToolTip("BlackSmile AI");
  rebuild();
  tray.on("click", () => createMainWindow());
  return tray;
}

export function rebuild() {
  tray?.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Open BlackSmile", click: () => createMainWindow() },
      {
        label: paused ? "Resume Agent" : "Pause Agent",
        click: () => {
          paused = !paused;
          getMainWindow()?.webContents.send("agent:paused", paused);
          rebuild();
        },
      },
      {
        label: "Settings",
        click: () => {
          const win = createMainWindow();
          win.webContents.send("ui:open-settings");
        },
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );
}
