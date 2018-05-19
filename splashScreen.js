const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const dialog = remote.dialog;
const Menu = remote.Menu;
const Tray = remote.Tray;
const Window = remote.getCurrentWindow();
const WebContext = remote.getCurrentWebContents();

ipc.on("splash-screen-msg", function(event, data){
    if(data.state == 0){
        $(".splash-screen-load-info").html("Load: " + data.res);
    }

    if(data.state == 10){
        Window.close();
    }
});
