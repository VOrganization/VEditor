const fs = require("fs");

module.exports = class{
    constructor(){
        this.type = "display";
        this.name = "asset";
        this.containerName = "context_asset";
        this.html = `
        <div class="context_asset">
            <div class="context_asset_header"><span class="context_asset_header_btn">asset</span><span class="icon-right-open"></span></div>
            <div class="context_asset_data">
                <div class="context_asset_item">
                    <div class="context_asset_item_icon"><span class="icon-folder"></span></div>
                    <div class="context_asset_item_name">Testy</div>
                </div>
                <div class="context_asset_item">
                    <div class="context_asset_item_icon"><span class="icon-folder"></span></div>
                    <div class="context_asset_item_name">Testy</div>
                </div>
            </div>
        </div>`;
        
        this.container = null;
        this.watcher = null;

        this.saveCallback = null;
        this.loadCallback = this.Update;
        this.createCallback = null;
        this.exportCallback = null;
        this.importCallback = null;
        this.exitCallback = null;

    }

    destroy() {
        
    }

    calcPath(){
        let path_dir = this.container.children(".context_asset_header").html();
        path_dir = path_dir.replace('<span class="icon-right-open"></span>', "/");
        path_dir = path_dir.replace('<span class="context_asset_header_btn">', "");
        path_dir = path_dir.replace('</span>', "");
        path_dir = path_dir.replace("asset/", "");
        return path_dir;
    }

    CalcData(){
        this.container.children(".context_asset_data").html("");
    }

    Update(editor){
        alert("Update Asset");
    }

    setContainer(jqueryObject){
        this.container = jqueryObject;
        this.CalcData();
        //$(this.container).html("Hello World");
    }
}