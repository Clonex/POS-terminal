const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const { exec } = require('child_process');
const fs = require('fs');
const { powerSaveBlocker } = require('electron');
let AutoLaunch = require('auto-launch');
let mainWindow;
let autoLauncher = new AutoLaunch({
	name: 'client'
});

const id = powerSaveBlocker.start('prevent-display-sleep') // Stop screen from going to sleep
console.log(powerSaveBlocker.isStarted(id));


electron.dialog.showErrorBox = function(title, content) {
    console.log(`${title}\n${content}`);
};

if(!isDev || 1)
{
    /*exec('taskkill /IM "explorer.exe" /F');
    autoLauncher.isEnabled()
    .then(function(isEnabled){
        if(!isEnabled)
        {
            autoLauncher.enable();
        }
    })
    .catch(function(err){
        console.log("Something happend??", err);
    });*/
    var cmd = process.argv[1];

    
    let target = (path.resolve("./") + "\\").split("\\").join("\\"+"\\");
    let regeditPath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon'; // [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]   
    fs.writeFile(target + "startup.reg", "Windows Registry Editor Version 5.00\n\n[" + regeditPath + ']\n"Shell"="' + target + 'client.exe"\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Authentication\\LogonUI\\SessionData]\n"AllowLockScreen"=dword:00000000\n[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU]\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU]\n"NoAutoUpdate"=dword:00000001', () =>{}); 
    
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680, 
        frame: isDev,
        fullscreen: !isDev,
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
    if(!isDev)
    {
        mainWindow.setKiosk(true);
    }
    try {
        autoUpdater.checkForUpdatesAndNotify();
        setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 120000);
    } catch (err) {

    }
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

electron.ipcMain.on('run_startup', (event) => {
    exec('startup.reg');
});

electron.ipcMain.on('restart', (event) => {
    exec('shutdown /r /t 0');
});

electron.ipcMain.on('shutdown', (event) => {
    exec('shutdown /s /t 0');
});

electron.ipcMain.on('check_update', (event) => {
    autoUpdater.checkForUpdatesAndNotify();
});

electron.ipcMain.on('exit_kiosk', (event) => {
    exec('C:\\Windows\\explorer.exe');//exec('taskkill /IM "explorer.exe" /F');
    mainWindow.setFullScreen(false);
    setTimeout(() => {
        mainWindow.setMinimumSize(200, 200);
        mainWindow.setSize(200, 200);
    }, 500);
});

electron.ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});