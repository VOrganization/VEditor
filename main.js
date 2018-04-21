const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const dialog = remote.dialog;
const Menu = remote.Menu;
const Tray = remote.Tray;
const Window = remote.getCurrentWindow();
const WebContext = remote.getCurrentWebContents();


let module_path = "Modules/"

editor.layout = new GoldenLayout(editor.defaultLayout);
editor.layout.registerComponent("testComponent", function(container, componentState){
    let found = false;
    for (let i = 0; i < editor.modules.length; i++) {
        if(editor.modules[i].name == componentState.label){
            found = true;
            let obj = new editor.modules[i].class();
            if(obj.type != "display"){
                found = false;
                break;
            }
            container.getElement().html(obj.getHTML());
            editor.modulesUsage.push(obj);
            break;
        }
    }
    if(!found){
        container.getElement().html("<h2>Not found</h2>");
    }
});
editor.layout.init();


//dokończyć przyznawanie contextow
for (let i = 0; i < editor.modulesUsage.length; i++) {
    
    
}