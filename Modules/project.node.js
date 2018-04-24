const fs = require("fs");

const template_project = {
    files: [],
    data: {},
    components: [],
    layout: {},
}

module.exports.type = "calculation";

module.exports = class{
    constructor(){
        this.type = "calculation";
        this.name = "project";
        this.priority = 100;

        this.saveCallback = this.Save;
        this.loadCallback = this.Load;
        this.createCallback = this.Create;
        this.exitCallback = this.Save;
    }

    Load(editor){
        try {
            editor.project = JSON.parse(fs.readFileSync(editor.filename));
            //CallFunctionFromModules("loadCallback");
        } catch (error) {
            console.log("Error While Load Project");
            console.log(error);
        }
    }

    Save(editor){
        try {
            editor.project.layout = editor.layout.toConfig();
            fs.writeFileSync(editor.filename, JSON.stringify(editor.project));
        } catch (error) {
            console.log("Error While Save Project");
            console.log(error);
        }
    }

    Create(editor){
        console.log(editor);
        try {
            fs.writeFileSync(editor.filename, JSON.stringify(template_project));
            console.log(editor.filename);
            alert("OK");
        } catch (error) {
            console.log("Error While Create Project");
            console.log(error);
        }
    }

}