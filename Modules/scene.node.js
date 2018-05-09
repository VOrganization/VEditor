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
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.raycaster = null;
        this.mouse = null;
        this.selectedObject = null;
        this.helper = new Array();
        this.rotation = { x: 45, y: 45, z: 0 };
        this.editor = null;
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
                            CallFunctionFromModules("changeDataCallback");
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
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        $(this.container).append(this.renderer.domElement);
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

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

        let startX = 0;
        let startY = 0;
        let startData = null;
        let startMouseX = 0;
        let startMouseY = 0;
        let keyPress = -1;
        let type = "";
        let option = "";

        $(document).keypress(function(e){
            if(t.selectedObject !== null){
                if(keyPress > 3){
                    option = e.key;
                }
                else{
                    startMouseX = null;
                    startMouseY = null;

                    if(e.key == "g"){
                        type = "position";
                        keyPress = 4;
                    }

                    if(e.key == "r"){
                        type = "rotation";
                        keyPress = 4;
                    }

                    if(e.key == "s"){
                        type = "scale";
                        keyPress = 4;
                    }

                    if(keyPress > 3){
                        let o = t.selectedObject[type];
                        startData = { x: o.x, y: o.y, z: o.z };
                    }

                    if(e.key == "a"){
                        keyPress = -1;
                        editor.selected = { type: "none" };
                        t.selectedObject = null;
                    }
                    
                    if(e.key == "d"){

                        let parent = t.foundParent(t.selectedObject.uuid, t.scene);

                        if(parent !== null){
                            let o = t.selectedObject.clone();
                            parent.add(o);
                            CallFunctionFromModules("changeDataCallback");
                            editor.selected = {
                                type: "object",
                                uuid: o.uuid
                            };
                        }
                        else{
                            console.log("Error while clone, don't found parent");
                        }

                    }

                    // console.log(e);
                }
            }
        });

        $(document).keyup(function(e){
            if(t.selectedObject !== null){

                if(e.keyCode == 46) {

                    let parent = t.foundParent(t.selectedObject.uuid, t.scene);

                    if(parent !== null){
                        parent.remove(t.selectedObject);
                        CallFunctionFromModules("changeDataCallback");
                        editor.selected = { type: "none" };
                    }
                    else{
                        console.log("Error while delete, don't found parent");
                    }

                }

            }
        });

        $(this.container).bind("mousedown", function(e){
            if(keyPress > 3){
                if(e.button == 2){
                    t.selectedObject[type].x = startData.x;
                    t.selectedObject[type].y = startData.y;
                    t.selectedObject[type].z = startData.z;
                }
                keyPress = -1;
                option = "";
            }
            else{
                keyPress = e.button;
                startMouseX = e.pageX;
                startMouseY = e.pageY;

                if(keyPress == 1){
                    startX = t.rotation.x;
                    startY = t.rotation.y;
                }

                if(keyPress == 2){
                    t.mouse.x = ( (e.pageX - t.container.offset().left) / t.container.width() ) * 2 - 1;
                    t.mouse.y = - ( (e.pageY - t.container.offset().top) / t.container.height() ) * 2 + 1;

                    t.raycaster.setFromCamera(t.mouse, t.camera);
                    let intersects = t.raycaster.intersectObjects(t.scene.children, true);
                    let found = false;
                    for ( let i = 0; i < intersects.length; i++ ){
                        if(String(intersects[i].object.name).indexOf("Helper") > -1){
                            let id = undefined;
                            if(intersects[i].object.EID !== undefined){
                                id = intersects[i].object.EID;
                            }
                            else{
                                id = intersects[i].object.parent.EID;
                            }
                           
                            if(id !== undefined){
                                t.editor.selected = {
                                    type: "object",
                                    uuid: id, 
                                };
                                break;
                            }
                        }

                        if(intersects[i].object.type == "Mesh"){
                            t.editor.selected = {
                                type: "object",
                                uuid: intersects[i].object.uuid, 
                            };
                            break;
                        }
                    }
                }
            }
        });

        $(this.container).bind("mousemove", function(e){

            if(keyPress == 1){
                t.rotation.y = startY + ((e.pageX - startMouseX)*0.5) * Math.PI / 180;
                t.rotation.x = startX + ((e.pageY - startMouseY)*0.5) * Math.PI / 180;
            }

            if(keyPress > 3){
                if(startMouseX == null || startMouseY == null){
                    startMouseX = e.pageX;
                    startMouseY = e.pageY;
                }

                let m = 0.01;
                if(e.shiftKey){
                    m = 0.001;
                }
                let r = ( (e.pageX - startMouseX) + (e.pageY - startMouseY) ) * m;

                let d = { x: r, y: r, z: r };

                if(type == "position"){
                    let matrix = new THREE.Matrix4();
                    matrix = matrix.extractRotation(t.scene.matrix);
                    let dir = new THREE.Vector3( 1, 1, 1 ).applyMatrix4(matrix);

                    d = {
                        x: dir.x * (e.pageX - startMouseX) * (m * 10),
                        y: -dir.y * (e.pageY - startMouseY) * (m * 10),
                        z: r, 
                    }
                }

                if(type == "rotation"){
                    d = {
                        x: (e.pageY - startMouseY) * m,
                        y: (e.pageX - startMouseX) * m,
                        z: 0, 
                    }
                }

                if(option == "x"){
                    t.selectedObject[type].x = startData.x + d.x;
                }
                else if(option == "y"){
                    t.selectedObject[type].y = startData.y + d.y;
                }
                else if(option == "z"){
                    t.selectedObject[type].z = startData.z + d.z;
                }
                else{
                    t.selectedObject[type].x = startData.x + d.x;
                    t.selectedObject[type].y = startData.y + d.y;
                    t.selectedObject[type].z = startData.z + d.z;
                }

                t.selectedObject.updateMatrix();

            }
        });

        $(this.container).bind("mouseup", function(e){
            keyPress = -1;
            option = "";
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
            if(String(obj.children[i].name).indexOf("Helper") > -1){
                obj.remove(obj.children[i]);
            }
        }

        let help = new THREE.AxesHelper(1);
        help.name = "Helper_" + obj.uuid;
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
            let c = obj.geometry.boundingSphere.center;
            let box = new THREE.Box3();
            box.setFromCenterAndSize(new THREE.Vector3(c.x, c.y, c.z), new THREE.Vector3(r,r,r));
            let h = new THREE.Box3Helper(box, 0xffff00);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);

            obj.castShadow = true;
            obj.receiveShadow = true;
        }

        if(obj.type == "PerspectiveCamera"){
            obj.aspect = (this.container.width() / this.container.height());
            let h = new THREE.CameraHelper(obj);
            h.name = "Helper";
            h.matrixAutoUpdate = true;
            help.add(h);
        }

        if(obj.type == "PointLight"){
            let h = new THREE.Mesh( new THREE.SphereBufferGeometry( 0.3, 16, 8 ), new THREE.MeshBasicMaterial( { color: obj.color } ) );
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
            this.selectedObject = null;
        }
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        this.editor = editor;
        this.initScene();
    }
}