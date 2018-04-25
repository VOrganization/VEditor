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

function BPush(f,s){
    return Buffer.concat([f, s]);
}

function BUint32(n){
    let b = new Buffer(4);
    b.writeUInt32LE(n, 0);
    return b;
}

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
        this.rotation = null;
    }

    destroy() {
        
    }

    export(p, editor, full){
        let d = new Buffer(0);

        //header
        d = BPush(d, new Buffer("S1.0.0S"));

        //file section
        d = BPush(d, BUint32(editor.project.files.length));
        for (let i = 0; i < editor.project.files.length; i++) {
            let f = editor.project.files[i];
            
        }

        try {
            fs.writeFileSync(p, d);
        } catch (error) {
            console.log("Error While Exporting Scene");
            console.log(error);
        }
    }

    initData(editor){
        if(editor.project.data.scene !== undefined && editor.project.data.scene !== null){
            this.export(path.join(editor.dirname, editor.project.data.scene.file), editor, false);
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
                            editor.project.data.scene = {
                                file: path.relative(editor.dirname, p),
                                three: new THREE.Scene(),
                                settings: null,
                            }
                            t.export(p, editor, false);
                        }
                    });
                }
            });
        }
    }

    initScene(){
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(100, 100);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        $(this.container).append(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 10000 );
        this.camera.position.z = 5;
        let camera = this.camera;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        let scene = this.scene;

        let renderer = this.renderer;
        let renderFunction = function(){
            requestAnimationFrame(renderFunction);
			renderer.render(scene, camera);
        }
        renderFunction();


        let context = this.container;
        $(this.container).resize(function(){
            camera.aspect = (context.width() / context.height());
            camera.updateProjectionMatrix();
            renderer.setSize( context.width(), context.height() );
        });
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        this.THREE = editor.THREE;
        this.initScene();
    }
}