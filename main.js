const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const dialog = remote.dialog;
const Menu = remote.Menu;
const Tray = remote.Tray;
const Window = remote.getCurrentWindow();
const WebContext = remote.getCurrentWebContents();

let module_path = "Modules/"

let myLayout = new GoldenLayout(remote.getGlobal("editor").defaultLayout);
myLayout.registerComponent("testComponent", function(container, componentState){
    try {
        container.getElement().html(fs.readFileSync(module_path + componentState.label + ".html").toString());
    } catch (err) {
        container.getElement().html("<h2>Not found</h2>");
    }
});
myLayout.init();