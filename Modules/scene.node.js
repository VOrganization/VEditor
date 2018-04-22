module.exports = class{
    constructor(){
        this.type = "display";
        this.name = "scene";
        this.containerName = "context_scene";
        this.html = `<div class="context_scene" style="width: 100%; height: 100%;"></div>`;

        this.saveCallback = null;
        this.loadCallback = null;
        this.createCallback = null;
        this.exportCallback = null;
        this.importCallback = null;
        this.exitCallback = null;

        this.container = null;
    }

    destroy() {
        
    }


    setContainer(jqueryObject){
        this.container = jqueryObject;

        //$(this.container).html("Hello World");
    }
}