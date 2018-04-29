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

        editor.project.data.scene.data = this.import(path.join(editor.dirname, editor.project.data.scene.file));
    }

    importCB(editor){

    }

    import(pp){
        let scene =  new THREE.Scene();
        let data = null;
        try {
            data = fs.readFileSync(pp);
        } catch (error) {
            console.log("Error While Importing File");
            console.log(error);
            return scene;
        }
        data = new Buffer(data);
        console.log(data);

        //header
        console.log(data.readUInt8(0));
        console.log(data.readUInt8(6));
        if(data.readUInt8(0) != 83 || data.readUInt8(6) != 83){
            console.log("Error: Incorrect header");
            return scene;
        }

        

        return scene;
    }

}