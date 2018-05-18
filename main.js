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
                if(fs.existsSync(path.join("Modules", obj.html))){
                    container.getElement().html(fs.readFileSync(path.join("Modules", obj.html)).toString());
                }
                else{
                    container.getElement().html(obj.html);
                }
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
            editor.modulesUsage[i].setContainer($("." + editor.modulesUsage[i].containerName), editor);
        }
        else{
            editor.modulesUsage[i].setContainer($("." + editor.modulesUsage[i].containerName).eq(counter), editor);
        }
    }

    for (let i = 0; i < editor.modules.length; i++) {
        if(editor.modules[i].type == "calculation"){
            editor.modulesUsage.push(new editor.modules[i].class);
        }
    }
    
    editor.modulesUsage.sort(function(a,b){
        if(a.priority > b.priority){
            return -1;
        }
        else{
            return 1;
        }
        return 0;
    });
}

WebContext.openDevTools(); //tymczasowo

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
                                    extensions: [ project_ext ]
                                }
                            ]
                        }, function(file){
                            if(file !== undefined){
                                editor.filename = String(file);
                                editor.dirname = path.dirname(editor.filename);
                                CallFunctionFromModules("loadCallback");
                            }
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
                    click(){
                        dialog.showSaveDialog(Window, {
                            title: "Create Project",
                            filters: [
                                {
                                    name: "Project File",
                                    extensions: [ project_ext ]
                                }
                            ]
                        }, function(file){
                            if(file !== undefined){
                                editor.filename = String(file);
                                editor.dirname = path.dirname(editor.filename);
                                CallFunctionFromModules("createCallback");
                            }
                        });
                    }
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
                    click(){
                        CallFunctionFromModules("saveCallback");
                    }
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
                    label: "Empty",
                    click(){
                        let o = new THREE.Object3D();
                        o.name = "Empty";
                        editor.project.scene.data.add(o);
                        CallFunctionFromModules("changeDataCallback");
                        editor.selected = {
                            type: "object",
                            uuid: o.uuid
                        };
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Light Point",
                    click(){
                        if(editor.project.scene.data !== null){
                            let l = new THREE.PointLight( 0xFFFFFF, 1, 100 );
                            l.name = "Light Point";
                            l["ambient"] = new THREE.Color(0x222222);
                            l["specular"] = new THREE.Color(0xffffff);
                            editor.project.scene.data.add(l);
                            CallFunctionFromModules("changeDataCallback");
                            editor.selected = {
                                type: "object",
                                uuid: l.uuid
                            };
                        }
                    }
                },
                {
                    label: "Light Spot",
                    click(){
                        let l = new THREE.SpotLight( 0xffffff );
                        l.name = "Light Spot";
                        l["ambient"] = new THREE.Color(0x222222);
                        l["specular"] = new THREE.Color(0xffffff);
                        l.distance = 100;
                        editor.project.scene.data.add(l);
                        CallFunctionFromModules("changeDataCallback");
                        editor.selected = {
                            type: "object",
                            uuid: l.uuid
                        };
                    }
                },
                {
                    label: "Light Dir",
                    click(){
                        let l = new THREE.DirectionalLight(0xffffff);
                        l.name = "Light Dir";
                        l["ambient"] = new THREE.Color(0x222222);
                        l["specular"] = new THREE.Color(0xffffff);
                        editor.project.scene.data.add(l);
                        CallFunctionFromModules("changeDataCallback");
                        editor.selected = {
                            type: "object",
                            uuid: l.uuid
                        };
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Camera",
                    click(){
                        let cam = new THREE.PerspectiveCamera( 45, 1, 1, 1000 );
                        cam.name = "Camera";
                        editor.project.scene.data.add(cam);
                        CallFunctionFromModules("changeDataCallback");
                        editor.selected = {
                            type: "object",
                            uuid: cam.uuid
                        };
                    }
                },
                {
                    type: "separator"
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
        if(editor.modules[i].type != "display"){
            continue;
        }
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

    let models_path = path.join(__dirname, "ResourcesDynamic");
    let models_label = 2;
    let calc_models = function(file, parent){
        if(fs.lstatSync(file).isDirectory()){
            let files = fs.readdirSync(file);
            parent.push({
                label: path.basename(file),
                submenu: []
            });
            let p = parent[parent.length - 1].submenu;
            for (let i = 0; i < files.length; i++) {
                calc_models(path.join(file, files[i]), p);
            }
        }
        else{
            if(findFileType(path.extname(file)) == "model"){
                LoadModel(file, function(d){ });
                parent.push({
                    label: path.basename(file, path.extname(file)),
                    click(){
                        LoadModel(file, function(d){
                            if(d !== null){
                                let obj = d.clone();
                                editor.project.scene.data.add(obj);
                                CallFunctionFromModules("changeDataCallback");
                                editor.selected = {
                                    type: "object",
                                    uuid: obj.uuid
                                };
                            }
                            else{
                                console.log("Error while loading model");
                                console.log(file);
                            }
                        });
                    }
                });
            }
        }
    }
    let models = fs.readdirSync(models_path);
    for (let i = 0; i < models.length; i++) {
        calc_models(path.join(models_path, models[i]), menu_context[models_label].submenu);
    }

    Window.setMenu(Menu.buildFromTemplate(menu_context));

}

//On Close
{
    Window.on("close", function(){
        CallFunctionFromModules("exitCallback");
    });
}