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

        this.loadCallback = this.initData;
        this.changeDataCallback = this.updateData;
        this.selectCallback = this.updateSelected;

        this.container = null;
        this.THREE = null;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.helper = new Array();
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
        
        // let grid = new THREE.GridHelper(100, 100, 0xffffff, 0x888888);
        // grid.name = "Grid";
        // this.scene.add(grid);

        let renderFunction = function(){
            requestAnimationFrame(renderFunction);
            
            t.scene.rotation.x = t.rotation.x;
            t.scene.rotation.y = t.rotation.y;
            t.scene.rotation.z = t.rotation.z;

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

    calcHelper(obj){
        if(obj.type == "LineSegments"){
            return;
        }

        for (let i = 0; i < obj.children.length; i++) {
            if(obj.children[i].name == "Helper"){
                obj.remove(obj.children[i]);
            }
        }

        let help = new THREE.AxesHelper(1);
        help.name = "Helper";
        help["EID"] = obj.uuid;

        if(obj.type == "Object3D" || obj.type == "Group"){
            let box = new THREE.Box3();
            box.setFromCenterAndSize(new THREE.Vector3(0,0,0), new THREE.Vector3(0.3,0.3,0.3));
            let h = new THREE.Box3Helper(box, 0xffff00);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "Mesh"){
            obj.geometry.computeBoundingSphere();
            let r = obj.geometry.boundingSphere.radius * 1.5;
            let box = new THREE.Box3();
            box.setFromCenterAndSize(new THREE.Vector3(0,0,0), new THREE.Vector3(r,r,r));
            let h = new THREE.Box3Helper(box, 0xffff00);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "PerspectiveCamera"){
            obj.aspect = (this.container.width() / this.container.height());
            let h = new THREE.CameraHelper(obj);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "PointLight"){
            let h = new THREE.PointLightHelper(obj, obj.decay);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "DirectionalLight"){
            let h = new THREE.DirectionalLightHelper(obj, 5);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "SpotLight"){
            let h = new THREE.SpotLightHelper(obj);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        obj.add(help);

        for (let i = 0; i < obj.children.length; i++) {
            if(obj.children[i].type == "LineSegments" || obj.children[i].type == "AmbientLight" || obj.children[i].name == "Helper"){
                continue;
            }
            this.calcHelper(obj.children[i]);
        }
    }

    updateData(editor){
        if(editor.project.scene.data !== undefined || editor.project.scene.data !== null){
            let found = false;
            for (let i = 0; i < editor.project.scene.data.children.length; i++) {
                if(editor.project.scene.data.children[i].name == "Grid"){
                    found = true;
                    break;
                }
            }
            if(!found){
                let grid = new THREE.GridHelper(100, 100, 0xffffff, 0x888888);
                grid.name = "Grid";
                editor.project.scene.data.add(grid);
            }
            this.calcHelper(editor.project.scene.data);
        }
        else{
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x222222);
        }
    }


    updateHelper(uuid, obj, t){
        let ch = false;
        if(obj.name == "Helper"){
            if(obj.EID == uuid){
                obj.material.color.r = 0;
                obj.material.color.g = 0;
                obj.material.color.b = 1;    
                ch = true;
            }
            else{
                if(t){
                    obj.material.color.r = 0;
                    obj.material.color.g = 0;
                    obj.material.color.b = 1;
                }
                else{
                    obj.material.color.r = 1;
                    obj.material.color.g = 1;
                    obj.material.color.b = 0;
                }
            }
        }


        for (let i = 0; i < obj.children.length; i++) {
            this.updateHelper(uuid, obj.children[i], ch);
        }
    }

    updateSelected(editor){
        if(editor.selected.type == "object"){
            this.updateHelper(editor.selected.uuid, editor.project.scene.data);
        }
        else{
            this.updateHelper("", editor.project.scene.data, false);
        }
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        this.THREE = editor.THREE;
        this.initScene();
    }
}