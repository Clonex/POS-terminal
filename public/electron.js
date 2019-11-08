const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const { exec } = require('child_process');
const fs = require('fs');
var AutoLaunch = require('auto-launch');
let mainWindow;
var autoLauncher = new AutoLaunch({
	name: 'client'
});

if(!isDev)
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

    if (cmd == '--squirrel-firstrun') {// Running for the first time.
        /*
        [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]
"Shell"="D:\\path\\to\\your\\appFile.bat" 
*/
        let target = __dirname;
        let regeditPath = Buffer.from("W0hLRVlfTE9DQUxfTUFDSElORVxTT0ZUV0FSRVxNaWNyb3NvZnRcV2luZG93cyBOVFxDdXJyZW50VmVyc2lvblxXaW5sb2dvbl0=", 'base64').toString(); // [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]   
        fs.writeFile(target + "/startup.reg", regeditPath + '\n"Shell"="' + target + '/client.exe"', function(err) {

            if(err) {
                return console.log(err);
            }
            exec(target + "/startup.reg");
            console.log("The file was saved!", target);
        }); 
    }
}

//taskkill /IM "explorer.exe" /F
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
    mainWindow.setKiosk(true);
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

electron.ipcMain.on('exit_kiosk', (event) => {
    exec('taskkill /IM "explorer.exe" /F');
    mainWindow.hide();
});

electron.ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});