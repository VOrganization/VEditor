module.exports = class{

    constructor(){
        this.type = "display";
        this.name = "name";
        this.priority = 0;

        //For type display
        this.containerName = "tmp";
        this.html = "";

        this.saveCallback = null;
        this.loadCallback = null;
        this.exportCallback = null;
        this.importCallback = null;
        this.createCallback = null;
        this.exitCallback = null;
    }

    //For type display
    getHTML(){

    }

    //For type display
    getContainerName(){

    }

    //For type display
    setContainer(jqueryObject, LayoutObject){

    }

    destroy(){

    }

}