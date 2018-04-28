const fs = require("fs");
const path = require("path");

module.exports = class{
    constructor(){
        this.type = "calculation";
        this.name = "import";
        this.priority = 10;

        this.importCallback = this.importCB;
        this.loadCallback = this.loadCB;
    }

    loadCB(editor){
        if(editor.project.data.scene == null || editor.project.data.scene == undefined){
            return;
        }

        alert("OK");

        editor.project.data.scene.data = this.import(path.join(editor.dirname, editor.project.data.scene.file));
    }

    importCB(editor){

    }

    import(pp){
        let scene =  new THREE.Scene();

        return scene;
    }

}