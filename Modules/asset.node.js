const fs = require("fs");
const path = require("path");

window.$ = window.jQuery = require('jquery');

module.exports = class{
    constructor(){
        this.type = "display";
        this.name = "asset";
        this.containerName = "context_asset";
        this.html = `
        <div class="context_asset">
            <div class="context_asset_header"><span class="context_asset_header_btn">asset</span><span class="icon-right-open"></span></div>
            <div class="context_asset_data"></div>
        </div>`;
        
        this.container = null;
        this.watcher = null;

        this.loadCallback = this.Update;
        this.selectCallback = this.SelectUpdate;
    }

    destroy() {
        if(this.watcher !== null){
            this.watcher.close();
        }
    }

    calcPath(){
        let path_dir = $(this.container).children(".context_asset_header").html();
        path_dir = path_dir.replace(new RegExp('<span class="icon-right-open"></span>', "g"), path.sep);
        path_dir = path_dir.replace(new RegExp('<span class="context_asset_header_btn">', "g"), "");
        path_dir = path_dir.replace(new RegExp('</span>', "g"), "");
        path_dir = path_dir.replace(("asset" + path.sep), "");
        return path_dir;
    }
    
    scanDir(editor){
        console.log("scan dir");
    }

    createWatcher(editor){
        console.log("Create Watcher");
        if(this.watcher !== null){
            this.watcher.close();
        }
        try {
            let c = this;
            let uc = this.UpdateContext;
            let u = function(){
                uc(editor, c);
            }
            this.watcher = fs.watch(editor.dirname, {}, u);   
        } catch (error) {
            console.log("Error while creating watcher");
            console.log(error);
        }
    }

    addElements(editor){
        console.log("Add Elements");
        this.container.children(".context_asset_data").html("");
        
        console.log(this.calcPath());

        let list = new Array();
        try {
            list = fs.readdirSync(path.join(editor.dirname, this.calcPath()));
        } catch (error) {
            console.log("Error while reading editor dir");
            console.log(error);
        }

        for (let i = 0; i < list.length; i++) {
            let p = path.join(editor.dirname, list[i]);
            
            let icon = `<span class="icon-folder"></span>`;
            if(!fs.lstatSync(p).isDirectory()){
                icon = `<span class="icon-doc-inv"></span>`;
            }

            $(this.container).children(".context_asset_data").append(`
            <div class="context_asset_item" id="` + p + `">
                <div class="context_asset_item_icon">` + icon + `</div>
                <div class="context_asset_item_name">` + list[i] + `</div>
            </div>
            `);
        }


        let c = this;
        let cont = this.container;
        $(this.container).children(".context_asset_data").children(".context_asset_item").click(function(){
            let p = $(this).attr("id");
            if(fs.lstatSync(p).isDirectory()){
                $(cont).children(".context_asset_header").append(`<span class="context_asset_header_btn">` + path.basename(p) + `</span><span class="icon-right-open"></span>`);
                console.log(p);
                c.Update(editor);
            }
            else{
                editor.selected = {
                    type: "file",
                    filename: p
                }
            }
        });

        $(this.container).children(".context_asset_header").children(".context_asset_header_btn").click(function(){
            
        });

    }

    UpdateContext(editor, c){
        console.log("update asset context");
        c.addElements(editor);
    }

    Update(editor){
        console.log("update asset");
        this.createWatcher(editor);
        this.addElements(editor);
    }

    SelectUpdate(editor){
        let items = $(this.container).children(".context_asset_data").children(".context_asset_item");
        items.removeClass("context_asset_item_selected");
        if(editor.selected.type == "file"){
            for (let i = 0; i < items.length; i++) {
                if(items.eq(i).attr("id") == editor.selected.filename){
                    items.eq(i).addClass("context_asset_item_selected");
                    break;
                }
            }
        }
    }

    setContainer(jqueryObject){
        this.container = jqueryObject;
    }
}