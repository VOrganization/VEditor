const electron = require("electron");
const ipc = electron.ipcMain;
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;

const path = require("path");
const url = require("url");
const fs = require("fs");

let splashScreen;
let mainwindow;
let loaded = false;

let icon_path = path.join(__dirname, "ResourcesStatic", "icons");
if(process.platform == "win32"){
    icon_path = path.join(icon_path, "icon.ico");
}
else{
    icon_path = path.join(icon_path, "icon.png");
}

function close_windows(){
    mainwindow = null;
    splashScreen = null;
    app.exit();
}

global.editor = {
    modules: new Array(),
    modulesUsage: new Array(),
    defaultLayout: null,
    layout: new Array(),
};

app.on("ready", function(){

    splashScreen = new electron.BrowserWindow({
        width: 400,
        height: 490,
        icon: icon_path,
        frame: false
    });

    splashScreen.loadURL(url.format({
        pathname: path.join(__dirname, "splashScreen.html"),
        protocol: "file:",
        slashes: true
    }));

    let mainwindowSize = electron.screen.getPrimaryDisplay().workAreaSize

    mainwindow = new electron.BrowserWindow({
        width: mainwindowSize.width,
        height: mainwindowSize.height,
        icon: icon_path,
        show: false
    });

    mainwindow.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    splashScreen.on("closed", function(){
        if(loaded){
            splashScreen = null;
        }
        else{
            close_windows();
        }
    });
    mainwindow.on("closed", close_windows); 

    ipc.on("load_msg", function(event, data){
        splashScreen.webContents.send("splash-screen-msg", data);
        if(data.state == 10){
            loaded = true;
        }
    });

});
