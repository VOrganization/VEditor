module.exports = class{
    constructor(){
        this.type = "display";
        this.name = "context_scene";
        this.saveCallback = null;
        this.loadCallback = null;
        this.exportCallback = null;
        this.importCallback = null;
        this.exitCallback = null;

        this.container = null;
    }

    destroy() {
        
    }

    getHTML(){
        return `<div class="context_scene" style="width: 100%; height: 100%;"></div>`;
    }

    getContainerName(){
        return "context_scene";
    }

    setContainer(jqueryObject){
        this.container = jqueryObject;

        //$(this.container).html("Hello World");
    }
}