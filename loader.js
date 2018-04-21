{
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
        if (filetype=="js"){
            var fileref = document.createElement('script')
            fileref.setAttribute("type","text/javascript")
            fileref.setAttribute("src", filename)
        }
        else if (filetype == "css"){
            var fileref = document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", filename)
        }
        if (typeof fileref!="undefined")
            document.getElementsByTagName("head")[0].appendChild(fileref)
    }

    function loadRes(p){
        let ext = path.extname(p).toLocaleLowerCase();
        console.log(ext);
        let lp = String(p).substr(__dirname.length + 1);
        console.log(lp);

        let out = {
            state: 2,
            res: path.basename(p)
        }

        if(ext == ".css"){
            loadjscssfile(lp, "css");
            out.state = 0;
        }

        
        if(ext == ".js" && lp.indexOf(".node.js") == -1){
            loadjscssfile(lp, "js");
            out.state = 0;
        }

        if(ext == ".js" && lp.indexOf(".node.js") != -1){
            try {
                remote.getGlobal("editor").modules.push(require("./" + lp));
                out.state = 0;
            } catch (error) {
                out.state = 2;   
            }
        }
        
        return out;
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

        try {
            remote.getGlobal("editor").defaultLayout = JSON.parse(fs.readFileSync("default_layout.json"));
        } catch (error) {
            console.log("Can't Load Default Layout!!!");
        }

        for (let i = 0; i < res_to_load.length; i++) {
            recurentLoop(path.join(__dirname, res_to_load[i]));
        }
        ipc.send("load_msg", {state: 10});
        Window.show();
        Window.maximize();

        loadjscssfile("main.js", "js");
    });
}