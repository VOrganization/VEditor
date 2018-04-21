const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const dialog = remote.dialog;
const Menu = remote.Menu;
const Tray = remote.Tray;
const Window = remote.getCurrentWindow();
const WebContext = remote.getCurrentWebContents();

const fs = require("fs");
const path = require("path");

const res_to_load = [
    "modules"
];

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

function loadRes(p){
    console.log(p);
    return {
        state: 0,
        res: path.basename(p)
    }
}

$(document).ready(function(){

    for (let i = 0; i < res_to_load.length; i++) {
        let list = fs.readdirSync(path.join(__dirname, res_to_load[i]));
        for (let j = 0; j < list.length; j++) {
            //setTimeout(function(){
                ipc.send("load_msg", loadRes(list[j]));
                sleep(1000);
            //},1000);
        }
    }
    ipc.send("load_msg", {state: 10});
    Window.show();
    Window.maximize();

});