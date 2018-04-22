module.exports = class{
    constructor(){
        this.type = "display";
        this.name = "object_list";
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
        return `
        <div class="context_object_list">
            <div class="opction"></div>
            <ul class="context"></ul>
        </div>
        `;
    }

    getContainerName(){
        return "context_object_list";
    }

    setContainer(jqueryObject){
        this.container = jqueryObject;

        //$(this.container).html("Hello World");
    }
}