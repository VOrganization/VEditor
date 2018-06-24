window.$ = window.jQuery = require('jquery');

const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const Window = remote.getCurrentWindow();

ipc.on("splash-screen-msg", function(event, data){
    if(data.state == 0){
        $(".splash-screen-load-info").html("Load: " + data.res);
    }

    if(data.state == 10){
        Window.close();
    }
});
