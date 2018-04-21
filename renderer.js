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
    "Libraries",
    "Modules",
    "ResourcesDynamic",
    "Plugins",
];

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

function loadRes(p){
    let ext = path.extname(p).toLocaleLowerCase();
    let lp = String(p).substr(__dirname.length + 1);
    if(ext == ".css"){
        loadjscssfile(lp, "css");
    }
    else if(ext == ".js"){
        loadjscssfile(lp, "js");
    }
    else if(ext == ".node.js"){
        
    }
    else{
        return {
            state: 2,
            res: path.basename(p)
        }    
    }
    return {
        state: 0,
        res: path.basename(p)
    }
}

function recurentLoop(p){
    let list = fs.readdirSync(p);
    let dirs = new Array();
    for (let i = 0; i < list.length; i++) {
        let pp = path.join(p, list[i]);
        if(fs.lstatSync(pp).isDirectory()){
            dirs.push(pp);
        }
        else{
            ipc.send("load_msg", loadRes(pp));
            sleep(10);
        }
    }
    for (let i = 0; i < dirs.length; i++) {
        recurentLoop(dirs[i])
    }
}

$(document).ready(function(){

    for (let i = 0; i < res_to_load.length; i++) {
        recurentLoop(path.join(__dirname, res_to_load[i]));
    }
    ipc.send("load_msg", {state: 10});
    Window.show();
    Window.maximize();

});