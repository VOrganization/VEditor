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
        this.changeDataCallback = this.scanDir;
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

    _scan_dir(editor, p, pp){
        let t = this;
        try {
            fs.readdir(String(p), function(err, files){
                if(err !== null){
                    console.log("Error while scaning dirs SEC");
                    console.log(err);
                }
                else{
                    for (let i = 0; i < files.length; i++) {
                        let glob;
                        if(pp == undefined){
                            glob = path.join(String(editor.project.dirname), files[i]);
                        }
                        else{
                            glob = path.join(pp, files[i]);
                        }
                        
                        if(!fs.existsSync(glob)){
                            continue;
                        }

                        if(fs.lstatSync(glob).isDirectory()){
                            t._scan_dir(editor, glob, glob);
                        }
                        else{
                            let found = false;
                            let main_p = path.relative(editor.project.dirname, glob);
                            let ext = path.extname(main_p);
                            let name = path.basename(main_p, ext);
                            let type = findFileType(ext);
                            for (let j = 0; j < editor.project.files.length; j++) {
                                if(!fs.existsSync(path.join(editor.project.dirname, editor.project.files[j].path))){
                                    editor.project.files.splice(j, 1);
                                }

                                if(editor.project.files[j].type === "" || editor.project.files[j].type === null){
                                    editor.project.files[j].type = findFileType(editor.project.files[j].ext);
                                }

                                if(editor.project.files[j].data == null || editor.project.files[j].data == undefined){
                                    loadFile(editor.project.files[j]);
                                }

                                if(editor.project.files[j].path == main_p){
                                    found = true;
                                    break;
                                }
                            }
                            if(!found){
                                console.log("OK");
                                editor.project.files.push({
                                    type: type,
                                    name: name,
                                    ext: ext,
                                    path: main_p,
                                    data: null
                                });
                                loadFile(editor.project.files[editor.project.files.length - 1]);
                            }
                        }
                    }
                }
            });   
        } catch (error) {
            console.log("Error while scaning dirs");
            console.log(error);
        }
    }

    scanDir(editor){
        console.log("scan dir");
        this._scan_dir(editor, editor.dirname);
    }

    createWatcher(editor){
        if(this.watcher !== null){
            this.watcher.close();
        }
        try {
            let c = this;
            let uc = this.UpdateContext;
            let u = function(){
                uc(editor, c);
            }
            this.watcher = fs.watch(editor.project.dirname, {}, u);   
        } catch (error) {
            console.log("Error while creating watcher");
            console.log(error);
        }
    }

    addElements(editor){
        this.container.children(".context_asset_data").html("");

        let list = new Array();
        try {
            list = fs.readdirSync(path.join(String(editor.project.dirname), this.calcPath()));
        } catch (error) {
            console.log("Error while reading editor dir");
            console.log(error);
        }

        for (let i = 0; i < list.length; i++) {
            let p = path.join(editor.project.dirname, this.calcPath(), list[i]);
            
            if(p == editor.project.filename){
                continue;
            }

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
                c.Update(editor);
            }
            else{
                editor.selected = {
                    type: "file",
                    filename: p,
                }
            }
        });

        $(this.container).children(".context_asset_header").children(".context_asset_header_btn").click(function(){
            let p = $(this).html();
            if(p == "asset"){
                $(cont).children(".context_asset_header").html(`<span class="context_asset_header_btn">asset</span><span class="icon-right-open"></span>`);
                c.Update(editor);
            }
        });

    }

    UpdateContext(editor, c){
        c.addElements(editor);
        c.scanDir(editor);
    }

    Update(editor){
        this.createWatcher(editor);
        this.addElements(editor);
        this.scanDir(editor);
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

    Load(editor){
        this.Update(editor);
    }

}