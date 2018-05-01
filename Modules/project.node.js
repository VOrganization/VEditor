const fs = require("fs");

const template_project = {
    files: [],
    models: [],
    meshes: [],
    textures: [],
    shaders: [],
    materials: [],
    scene: {},
    components: [],
    layout: {},
}

module.exports.type = "calculation";

module.exports = class{
    constructor(){
        this.type = "calculation";
        this.name = "project";
        this.priority = 1000;

        this.saveCallback = this.Save;
        this.loadCallback = this.Load;
        this.createCallback = this.Create;
        this.exitCallback = this.Save;
    }

    Load(editor){
        try {
            editor.project = JSON.parse(fs.readFileSync(editor.filename));
        } catch (error) {
            console.log("Error While Load Project");
            console.log(error);
        }
    }

    Save(editor){
        try {
            editor.project.layout = editor.layout.toConfig();
            let tmp_data = editor.project.scene.data;
            editor.project.scene.data = null;

            let tmp_models = editor.project.models;
            editor.project.models = [];

            let tmp_meshes = editor.project.meshes;
            editor.project.meshes = [];

            let files_tmp = new Array();
            for (let i = 0; i < editor.project.files.length; i++) {
                files_tmp.push(editor.project.files[i].data);
                editor.project.files[i].data = null;
            }

            fs.writeFileSync(editor.filename, JSON.stringify(editor.project));
            
            for (let i = 0; i < editor.project.files.length; i++) {
                editor.project.files[i].data = files_tmp[i];
            }
            
            editor.project.scene.data = tmp_data;

            editor.project.models = tmp_models;

            editor.project.meshes = tmp_meshes;

        } catch (error) {
            console.log("Error While Save Project");
            console.log(error);
        }
    }

    Create(editor){
        console.log(editor);
        try {
            fs.writeFileSync(editor.filename, JSON.stringify(template_project));
        } catch (error) {
            console.log("Error While Create Project");
            console.log(error);
        }
    }

}