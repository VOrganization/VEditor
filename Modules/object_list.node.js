module.exports = class{
    constructor(){
        this.type = "display";
        this.name = "object_list";
        this.containerName = "context_object_list";
        this.html = `
        <div class="context_object_list">
            <div class="opction"></div>
            <ul class="context"></ul>
        </div>
        `;

        this.saveCallback = null;
        this.loadCallback = null;
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