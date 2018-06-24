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
        
        this.control = null;
        
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbit.damping = 0.2;
        this.orbit.mouseButtons.ORBIT = 1;
        this.orbit.mouseButtons.PAN = 0;
        this.orbit.mouseButtons.ZOOM = -1;
        this.orbit.enableKeys = false;

        let p_w, p_h;

        let renderFunction = function(){
            requestAnimationFrame(renderFunction);
            
            if(p_w != c.width() || p_h != c.height()){
                p_w = c.width();
                p_h = c.height();
                t.camera.aspect = (p_w / p_h);
                t.camera.updateProjectionMatrix();
                t.renderer.setSize(p_w, p_h);
            }

            t.scene.traverse((obj) => {

                if(obj.name == "Helper" && !(obj instanceof THREE.TransformControls)){
                    if(obj.update !== undefined){
                        obj.update();
                    }
                }

                if(obj.type == "SpotLight" || obj.type == "DirectionalLight"){
                    let matrix = new THREE.Matrix4();
                    matrix = matrix.extractRotation(obj.matrix);
                    let dir = new THREE.Vector3(0, -1, 0).applyMatrix4(matrix);
                    obj.target.position.set(dir.x + obj.position.x, dir.y, dir.z + obj.position.z);
                    obj.target.name = "Helper";
                    t.scene.add(obj.target);
                }

            });

            if(t.control !== null){
                t.control.update();
            }
            t.renderer.render(t.scene, t.camera);
        }
        renderFunction();

        this.events();
    }

    events(){
        let t = this;
        let menuL =  $(t.container).children(".context_scene_nav").children(".context_scene_nav_right");
        let menuR =  $(t.container).children(".context_scene_nav").children(".context_scene_nav_right");

        menuL.children(".scene_move").click(() => {
            t.control.setMode("translate");
            menuL.children("*").removeClass("scene_active");
            menuL.children(".scene_move").addClass("scene_active");
        });

        menuL.children(".scene_rotation").click(() => {
            t.control.setMode("rotate");
            menuL.children("*").removeClass("scene_active");
            menuL.children(".scene_rotation").addClass("scene_active");
        });

        menuL.children(".scene_scale").click(() => {
            t.control.setMode("scale");
            menuL.children("*").removeClass("scene_active");
            menuL.children(".scene_scale").addClass("scene_active");
        });

        menuL.children(".scene_find_file").click((e) => {

        });

        menuL.children(".scene_select").change((e) => {

        });

        menuL.children(".scene_copy").click((e) => {

        });

        menuL.children(".scene_remove").click((e) => {

        });

        menuL.children(".scene_add").click((e) => {
            dialog.showSaveDialog(Window, {
                title: "Create Scene File",
                filters: [
                    {
                        name: "Scene File",
                        extensions: [ "vscene" ]
                    }
                ]
            }, (file) => {

                console.log(file);
            });
        });


        $(document).keypress(function(e){
            if(!$(t.container).is(":hover")){
                return;
            }

            if(e.key == "g"){
                t.control.setMode("translate");
                $(t.container).children(".context_scene_nav").children(".context_scene_nav_left").children("*").removeClass("scene_active");
                $(t.container).children(".context_scene_nav").children(".context_scene_nav_left").children(".scene_move").addClass("scene_active");
            }

            if(e.key == "r"){
                t.control.setMode("rotate");
                $(t.container).children(".context_scene_nav").children(".context_scene_nav_left").children("*").removeClass("scene_active");
                $(t.container).children(".context_scene_nav").children(".context_scene_nav_left").children(".scene_rotation").addClass("scene_active");
            }

            if(e.key == "s"){
                t.control.setMode("scale");
                $(t.container).children(".context_scene_nav").children(".context_scene_nav_left").children("*").removeClass("scene_active");
                $(t.container).children(".context_scene_nav").children(".context_scene_nav_left").children(".scene_scale").addClass("scene_active");
            }

            if(e.key == "a"){
                t.editor.selected = {
                    type: "none"
                };
            }

            if(e.key == "d" && t.editor.selected.type == "object"){
                t.scene.traverse((obj) => {
                    if(obj.uuid == t.editor.selected.uuid){
                        t.editor.selected = {
                            type: "none"
                        };
                        let o = obj.clone();
                        obj.parent.add(o);
                        CallFunctionFromModules("changeDataCallback");
                        editor.selected = {
                            type: "object",
                            uuid: o.uuid
                        };    
                    }
                });
            }

        });


        $(document).keyup(function(e){
            if(!$(t.container).is(":hover")){
                return;
            }

        });


        $(this.container).children(".context_scene_webgl").bind("mousedown", function(e){
            if(e.button != 2){
                return;
            }
            
            t.mouse.x = ( (e.pageX - t.container.offset().left) / t.container.width() ) * 2 - 1;
            t.mouse.y = - ( (e.pageY - t.container.offset().top) / t.container.height() ) * 2 + 1;

            t.raycaster.setFromCamera(t.mouse, t.camera);

            let objects = new Array();
            t.scene.traverse((obj) => {
                try {
                    let is_helper_tc = obj.parent.parent instanceof THREE.TransformGizmoTranslate || obj.parent.parent instanceof THREE.TransformGizmoScale || obj.parent.parent instanceof THREE.TransformGizmoRotate;
                    if(obj.type == "Mesh" && !is_helper_tc){
                        objects.push(obj);
                    }    
                } catch (error) {
                    
                }    
            });

            let intersects = t.raycaster.intersectObjects(objects, true);
            if(intersects.length > 0){
                let obj = intersects[0].object;
                if(t.editor.selected.type == "object" && t.editor.selected.uuid == obj.uuid){
                    t.editor.selected = {
                        type: "none",
                    };
                }
                else{
                    if(obj.name == "Helper"){
                        t.editor.selected = {
                            type: "object",
                            uuid: obj.OID, 
                        };
                    }
                    else{
                        t.editor.selected = {
                            type: "object",
                            uuid: obj.uuid, 
                        };
                    }
                }
            }


        });
        
    }

    updateData(editor){
        if(editor.project.scene.data !== undefined || editor.project.scene.data !== null){
            let t = this;
            let found = false;

            this.scene = editor.project.scene.data;

            t.scene.traverse((obj) => {
                if(obj.name == "Grid"){
                    found = true;
                }

                if(obj.type == "PointLight"){
                    let helper = new THREE.PointLightHelper(obj, 0.5);
                    helper.name = "Helper";
                    helper["OID"] = obj.uuid;
                    t.scene.add(helper);
                }

                if(obj.type == "SpotLight"){
                    let helper = new THREE.SpotLightHelper(obj);
                    helper.name = "Helper";
                    helper["OID"] = obj.uuid;
                    t.scene.add(helper);
                }

                if(obj.type == "DirectionalLight"){
                    let helper = new THREE.DirectionalLightHelper(obj, 5);
                    helper.name = "Helper";
                    helper["OID"] = obj.uuid;
                    t.scene.add(helper);
                }
                
                if(obj.type == "Group" || obj.type == "Object3D"){
                    let helper = new THREE.AxesHelper(1);
                    helper.name = "Helper";
                    helper["OID"] = obj.uuid;
                    
                    let box = new THREE.Box3();
                    box.setFromCenterAndSize( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 0.3, 0.3));
                    let boxHelper = new THREE.Box3Helper( box, 0xffff00 );
                    boxHelper.name = "Helper";
                    boxHelper["OID"] = obj.uuid;
                    helper.add(boxHelper);

                    obj.add(helper);
                }


            });

            if(!found){
                let grid = new THREE.GridHelper(100, 100, 0xffffff, 0x888888);
                grid.name = "Grid";
                editor.project.scene.data.add(grid);
            }

            t.control = new THREE.TransformControls(t.camera, t.renderer.domElement);
            t.control.update();
            t.control.name = "Helper_TC";
            t.scene.add(t.control);
        }
        else{
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x222222);
        }
    }

    updateSelected(editor){
        if(editor.selected.type == "object"){
            this.scene.traverse((obj) => {
                if(obj.uuid == editor.selected.uuid){
                    this.control.detach();
                    this.control.attach(obj);
                }
            })
        }
        else{
            this.control.detach();
            this.selectedObject = null;
        }
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        this.editor = editor;
        this.initScene();
    }

}