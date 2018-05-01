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
const crypto = require("crypto");


module.exports = class{
    constructor(){
        this.type = "display";
        this.name = "scene";
        this.containerName = "context_scene";
        this.html = `<div class="context_scene" style="width: 100%; height: 100%;"></div>`;

        this.saveCallback = null;
        this.loadCallback = this.initData;
        this.createCallback = null;
        this.exportCallback = null;
        this.importCallback = null;
        this.exitCallback = null;

        this.container = null;
        this.THREE = null;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.rotation = { x: 45, y: 45, z: 0 };
    }

    destroy() {
        
    }

    initData(editor){
        if(editor.project.scene.file !== undefined && editor.project.scene.file !== null){
            this.scene = editor.project.scene.data;
        }
        else{
            let t = this;
            dialog.showMessageBox(Window, {
                title: "Editor Alert",
                message: `You don't have a scene.\n\nDo you wanna to create a new Scene?`,
                buttons: [
                    "Yes",
                    "Cancel"
                ]
            }, function(res){
                if(res == 0){
                    dialog.showSaveDialog(Window, {
                        title: "Create Scene",
                        filters: [
                            {
                                name: "Scene File",
                                extensions: [ "vscene" ]
                            }
                        ]
                    }, function(file){
                        if(file !== undefined){
                            let p = String(file);
                            console.log(THREE);
                            editor.project.scene = {
                                file: path.relative(editor.dirname, p),
                                data: new THREE.Scene(),
                                settings: null,
                            }
                            CallFunctionFromModules("exportCallback", t);
                        }
                    });
                }
            });
        }
    }

    initScene(){
        let t = this;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(100, 100);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        $(this.container).append(this.renderer.domElement);
        
        this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 10000 );
        this.camera.position.z = 5;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        
        let grid = new THREE.GridHelper(1000, 1000, 0xffffff, 0x888888);
        let ambient = new THREE.AmbientLight(0x444444);
        let dir = new THREE.DirectionalLight(0xffffff, 0.2);

        let renderFunction = function(){
            requestAnimationFrame(renderFunction);
            
            t.scene.rotation.x = t.rotation.x;
            t.scene.rotation.y = t.rotation.y;
            t.scene.rotation.z = t.rotation.z;

            let found = false;
            for (let i = 0; i < t.scene.children.length; i++) {
                if(t.scene.children[i] == grid || t.scene.children[i] == ambient || t.scene.children[i] == dir){
                    found = true;
                    break;
                }
            }
            if(!found){
                t.scene.add(grid);
                t.scene.add(ambient);
                t.scene.add(dir);
            }

			t.renderer.render(t.scene, t.camera);
        }
        renderFunction();

        $(this.container).resize(function(){
            t.camera.aspect = (t.container.width() / t.container.height());
            t.camera.updateProjectionMatrix();
            t.renderer.setSize( t.container.width(), t.container.height() );
        });

        let startX = 0;
        let startY = 0;
        let startMouseX = 0;
        let startMouseY = 0;
        let keyPress = -1;
        $(this.container).bind("mousedown", function(e){
            keyPress = e.button;
            startMouseX = e.pageX;
            startMouseY = e.pageY;
            if(keyPress == 1){
                startX = t.rotation.x;
                startY = t.rotation.y;
            }
        });

        $(this.container).bind("mousemove", function(e){
            if(keyPress == 1){
                t.rotation.y = startY + ((e.pageX - startMouseX)*0.5) * Math.PI / 180;
                t.rotation.x = startX + ((e.pageY - startMouseY)*0.5) * Math.PI / 180;
            }
        });

        $(this.container).bind("mouseup", function(e){
            keyPress = -1;
        });

        $(this.container).bind("mousewheel", function(e) {
            if(e.ctrlKey){
                t.camera.position.x += e.deltaY * 0.5;
            }
            else if(e.shiftKey){
                t.camera.position.y += e.deltaY * 0.5;
            }
            else{
                t.camera.position.z -= e.deltaY * 0.5;
                if(t.camera.position.z <= 0){
                    t.camera.position.z = 0.01;
                }
            }
        });
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        this.THREE = editor.THREE;
        this.initScene();
    }
}