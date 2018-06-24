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
//const THREE = require("three");

const DragControls = require("three-dragcontrols");
const TransformControls = require("three-transformcontrols");
const OrbitControls = require('three-orbit-controls')(THREE);
const Postprocessing = require("postprocessing");

module.exports = class{

    constructor(){
        this.type = "display";
        this.name = "scene";
        this.containerName = "context_scene";
        this.html = `scene.html`;

        this.loadCallback = this.initData;
        this.changeDataCallback = this.updateData;
        this.selectCallback = this.updateSelected;

        this.container = null;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.raycaster = null;
        this.mouse = null;
        this.selectedObject = null;
        this.helper = new Array();
        this.rotation = { x: 45, y: 45, z: 0 };
        this.editor = null;
        this.control = null;
        this.orbit = null;

        this.composer = null;
        this.renderPass = null;
        this.outlinePass = null;

    }

    destroy() {
        
    }

    initData(editor){
        if(editor.project.scene !== null && editor.project.scene.file !== undefined && editor.project.scene.file !== null){
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
                            CallFunctionFromModules("changeDataCallback");
                        }
                    });
                }
            });
        }
    }

    initScene(){
        let t = this;
        let c = $(this.container).children(".context_scene_webgl");

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(100, 100);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        c.append(this.renderer.domElement);
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 10000 );
        this.camera.position.z = 5;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        
        this.control = new THREE.TransformControls(this.camera, this.renderer.domElement);
        this.control.update();
        // this.control.addEventListener('change', () => {
        //     t.control.update();
        // });
        this.scene.add(this.control);

        
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbit.damping = 0.2;
        this.orbit.mouseButtons.ORBIT = 1;
        this.orbit.mouseButtons.PAN = 0;
        this.orbit.mouseButtons.ZOOM = -1;

        let calcObject = function(obj){

            if(obj.type == "SpotLight" || obj.type == "DirectionalLight"){
                let matrix = new THREE.Matrix4();
                matrix = matrix.extractRotation(obj.matrix);
                let dir = new THREE.Vector3(0, 1, 0).applyMatrix4(matrix);
                obj.target.position.set(dir.x + obj.position.x, dir.y, dir.z + obj.position.z);
                obj.target.name = "Helper";
                t.scene.add(obj.target);
            }

            if(String(obj.type).indexOf("Camera") > -1){
                obj.aspect = t.container.width() / t.container.height();
                obj.updateProjectionMatrix();
                if(obj != t.pCamera){
                    t.calcHelper(obj);
                    if(editor.selected.type == "object" && editor.selected.uuid == obj.uuid){
                        t.updateHelper(obj.uuid, obj, false);
                    }
                }
            }

            for (let i = 0; i < obj.children.length; i++) {
                calcObject(obj.children[i]);
            }
        };

        let renderFunction = function(){
            requestAnimationFrame(renderFunction);
            calcObject(t.scene);
            t.renderer.render(t.scene, t.camera);
            t.control.update();
        }
        renderFunction();

        c.resize(function(){
            t.camera.aspect = (c.width() / c.height());
            t.camera.updateProjectionMatrix();
            t.renderer.setSize(c.width(), c.height() );
        });

        this.events();
    }

    foundParent(uuid, obj){
        for (let i = 0; i < obj.children.length; i++) {
            if(obj.children[i].uuid == uuid){
                return obj;
            }
            else{
                let o = this.foundParent(uuid, obj.children[i]);
                if(o !== null){
                    return o;
                }
            }
        }
        return null;
    }

    events(){
        let t = this;

        $(document).keypress(function(e){
            if(!$(t.container).is(":hover")){
                return;
            }


        });

        $(document).keyup(function(e){
            if(!$(t.container).is(":hover")){
                return;
            }

        });

        $(this.container).children(".context_scene_webgl").bind("mousedown", function(e){
            if(e.button == 2){
                t.mouse.x = ( (e.pageX - t.container.offset().left) / t.container.width() ) * 2 - 1;
                t.mouse.y = - ( (e.pageY - t.container.offset().top) / t.container.height() ) * 2 + 1;

                t.raycaster.setFromCamera(t.mouse, t.camera);
                let intersects = t.raycaster.intersectObjects(t.scene.children, true);
                let found = false;
                for ( let i = 0; i < intersects.length; i++ ){
                    // if(String(intersects[i].object.name).indexOf("Helper") > -1){
                    //     let id = undefined;
                    //     if(intersects[i].object.EID !== undefined){
                    //         id = intersects[i].object.EID;
                    //     }
                    //     else{
                    //         id = intersects[i].object.parent.EID;
                    //     }
                        
                    //     if(id !== undefined){
                    //         if(t.editor.selected !== null && t.editor.selected.uuid == id){
                    //             t.editor.selected = { type: "none" };
                    //         }
                    //         else{
                    //             t.editor.selected = {
                    //                 type: "object",
                    //                 uuid: id, 
                    //             };
                    //         }
                    //         break;
                    //     }
                    // }

                    if(intersects[i].object.type == "Mesh"){
                        console.log("OK");
                        t.editor.selected = {
                            type: "object",
                            uuid: intersects[i].object.uuid, 
                        };

                        t.scene.

                        //t.control.detach();
                        t.control.attach(intersects[i].object);
                        t.control.update();

                        break;
                    }
                }
            }
        });
    }

    calcHelper(obj){
        if(obj.type == "LineSegments"){
            return;
        }

        for (let i = 0; i < obj.children.length; i++) {
            if(String(obj.children[i].name).indexOf("Helper") > -1){
                obj.remove(obj.children[i]);
            }
        }

        let help = new THREE.AxesHelper(1);
        help.name = "Helper_" + obj.uuid;
        help["EID"] = obj.uuid;

        if(obj.type == "Group"){
            let box = new THREE.Box3();
            box.setFromCenterAndSize(new THREE.Vector3(0,0,0), new THREE.Vector3(0.3,0.3,0.3));
            let h = new THREE.Box3Helper(box, 0xffff00);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "Mesh"){
            // this.control.detach();
            // this.control.attach(obj);
            // obj.geometry.computeBoundingSphere();
            // let r = obj.geometry.boundingSphere.radius * 1.5;
            // let c = obj.geometry.boundingSphere.center;
            // let box = new THREE.Box3();
            // box.setFromCenterAndSize(new THREE.Vector3(c.x, c.y, c.z), new THREE.Vector3(r,r,r));
            // let h = new THREE.Box3Helper(box, 0xffff00);
            // h.name = "Helper";
            // h.matrixAutoUpdate = true;
            // help.add(h);

            // obj.castShadow = true;
            // obj.receiveShadow = true;

            console.log("OK");
        }

        if(obj.type == "PerspectiveCamera"){
            obj.aspect = (this.container.width() / this.container.height());
            let h = new THREE.CameraHelper(obj);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "PointLight"){
            let h = new THREE.Mesh(new THREE.SphereBufferGeometry( 0.3, 16, 8 ), new THREE.MeshBasicMaterial({ color: obj.color, transparent: true, opacity: 0.3 }));
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "SpotLight"){
            let h = new THREE.Mesh(new THREE.ConeBufferGeometry( 1, 4, 32 ), new THREE.MeshBasicMaterial({ color: obj.color, transparent: true, opacity: 0.3 }));
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            h.position.y = -2;
            help.add(h);
        }

        if(obj.type == "DirectionalLight"){
            let h = new THREE.Mesh(new THREE.BoxBufferGeometry( 5, 0.01, 5 ), new THREE.MeshBasicMaterial({ color: obj.color, transparent: true, opacity: 0.3 }));
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
            this.scene = editor.project.scene.data;
        }
        else{
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x222222);
        }
    }

    updateHelper(uuid, obj, t){
        let ch = false;

        if(obj.uuid == uuid){
            this.selectedObject = obj;
        }

        if(String(obj.name).indexOf("Helper") > -1){
            if(obj.EID == uuid){
                if(obj.material !== undefined){
                    obj.material.color.r = 0;
                    obj.material.color.g = 0;
                    obj.material.color.b = 1;
                }
                ch = true;
            }
            else{
                if(t){
                    if(obj.material !== undefined){
                        obj.material.color.r = 0;
                        obj.material.color.g = 0;
                        obj.material.color.b = 1;
                    }
                }
                else{
                    if(obj.parent.parent !== null && String(obj.parent.parent.type).indexOf("Light") > -1){
                        if(obj.material !== undefined){
                            obj.material.color.r = obj.parent.parent.color.r;
                            obj.material.color.g = obj.parent.parent.color.g;
                            obj.material.color.b = obj.parent.parent.color.b;
                        }
                    }
                    else{
                        if(obj.material !== undefined){
                            obj.material.color.r = 1;
                            obj.material.color.g = 1;
                            obj.material.color.b = 0;
                        }
                    }
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
            this.selectedObject = null;
        }
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        this.editor = editor;
        this.initScene();
    }

}