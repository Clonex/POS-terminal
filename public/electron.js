const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680, 
        frame: isDev,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
        }
    });
    mainWindow.loadURL(
        isDev ?
        "http://localhost:3000" :
        `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.on("closed", () => (mainWindow = null));

    autoUpdater.checkForUpdatesAndNotify();
    setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 120000);
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    //mainWindow.webContents.send('update_downloaded');
    autoUpdater.quitAndInstall();
});

log.info('App starting...');

electron.ipcMain.on('app_version', (event) => {
event.sender.send('app_version', { version: app.getVersion() });
});

electron.ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});