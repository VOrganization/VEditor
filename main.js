const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const dialog = remote.dialog;
const Menu = remote.Menu;
const Tray = remote.Tray;
const Window = remote.getCurrentWindow();
const WebContext = remote.getCurrentWebContents();

// Init Layout
{
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
                container.getElement().html(obj.html);
                editor.modulesUsage.push(obj);
                break;
            }
        }
        if(!found){
            container.getElement().html("<h2>Not found</h2>");
        }
    });
    editor.layout.init();
}

// Init Everyone Module
{
    let usage = new Array();
    for (let i = 0; i < editor.modulesUsage.length; i++) {
        let counter = 0;
        for (let j = 0; j < usage.length; j++) {
            if(usage[j] == editor.modulesUsage[i].name){
                counter += 1;
            }
        }
        if(counter == 0){
            usage.push(editor.modulesUsage[i].name);
            editor.modulesUsage[i].setContainer($("." + editor.modulesUsage[i].containerName));
        }
        else{
            editor.modulesUsage[i].setContainer($("." + editor.modulesUsage[i].containerName).eq(counter));
        }
    }
}

// Init Electron Window
{
    let menu_context = [
        {
            label: "File",
            submenu: [
                {
                    label: "Open Project",
                    accelerator: 'Ctrl+Shift+O',
                    click(){
                        dialog.showOpenDialog(Window, {
                            title: "Open Project File",
                            filters: [
                                {
                                    name: "Project File",
                                    extensions: [ "nngp" ]
                                }
                            ]
                        }, function(files){
                            console.log(files);
                        });
                    }
                },
                {
                    label: "Open File",
                    accelerator: 'Ctrl+O',
                },
                {
                    type: "separator"
                },
                {
                    label: "New Project",
                    accelerator: 'Ctrl+Shift+N',
                },
                {
                    label: "New File",
                    accelerator: 'Ctrl+N',
                },
                {
                    type: "separator"
                },
                {
                    label: "Import"
                },
                {
                    label: "Export",
                    click(){
                        
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Save",
                    accelerator: 'Ctrl+S',
                    click(){ save_data(); }
                },
                
            ]
        },
        {
            label: "Edit",
            submenu: [
                {
                    label: ""
                }
            ]
        },
        {
            label: "Object",
            submenu: [
                {
                    label: "Light Point",
                    click(){
                        // let l = new THREE.PointLight( 0xFFFFFF, 1, 100 );
                        // l.name = "Light Point";
                        // l["ambient"] = new THREE.Color(0x222222);
                        // l["specular"] = new THREE.Color(0xffffff);
                        // editor_data.data.object.push(l);
                        // editor_update_data();
                    }
                },
                {
                    label: "Light Spot",
                    click(){
                        // let l = new THREE.SpotLight( 0xffffff );
                        // l.name = "Light Spot";
                        // l["ambient"] = new THREE.Color(0x222222);
                        // l["specular"] = new THREE.Color(0xffffff);
                        // l.distance = 100;
                        // editor_data.data.object.push(l);
                        // editor_update_data();
                    }
                },
                {
                    label: "Light Dir",
                    click(){
                        // let l = new THREE.DirectionalLight(0xFFFFFF);
                        // l.name = "Light Dir";
                        // l["ambient"] = new THREE.Color(0x222222);
                        // l["specular"] = new THREE.Color(0xffffff);
                        // editor_data.data.object.push(l);
                        // editor_update_data();
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Camera",
                    click(){
                        // let cam = new THREE.PerspectiveCamera( 45, 1, 1, 1000 );
                        // cam.name = 'Camera';
                        // editor_data.data.object.push(cam);
                        // editor_update_data();
                    }
                },
            ]
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Dev Console",
                    accelerator: "Ctrl+Shift+I",
                    click(){
                        WebContext.toggleDevTools();
                    }
                },
                {
                    type: "separator"
                }
            ]
        },
        {
            label: "Run",
            submenu: [
                {
                    label: "Run",
                    accelerator: "F5",
                    click(){
    
                    }
                },
                {
                    label: "Restart",
                    accelerator: "Ctrl+Shift+F5",
                    click(){
                        
                    }
                },
                {
                    label: "Stop",
                    accelerator: "Shift+F5",
                    click(){
                        
                    }
                },
                {
                    label: "Console",
                    accelerator: "Ctrl+F5",
                    click(){
                        
                    }
                }
            ]
        }
    ];

    let sm = 3;
    for (let i = 0; i < editor.modules.length; i++) {
        let n = editor.modules[i].name;
        menu_context[sm].submenu.push({
            label: n.replace("_", " "),
            click(){
                editor.layout.root.contentItems[0].addChild({
                    type: "component",
                    componentName: "testComponent",
                    title: n.replace("_", " "),
                    componentState: {
                        label: n
                    },
                    isClosable: true,
                    reorderEnabled: true
                });
            }
        });
    }

    Window.setMenu(Menu.buildFromTemplate(menu_context));

}