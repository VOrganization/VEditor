const electron = require("electron");
const ipc = electron.ipcMain;
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;

const path = require("path");
const url = require("url");
const fs = require("fs");

app.on("ready", function(){

    let mainwindow = new electron.BrowserWindow({
        width: 400,
        height: 490,
        icon: path.join(__dirname, '/iconT.ico'),
        frame: false

    });

    mainwindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    mainwindow.on('closed', function(){
        mainwindow = null;
        app.exit();
    });

});
