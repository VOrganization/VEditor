
const watchjs = require("watchjs");

module.exports = class{

    constructor(){
        this.type = "display";
        this.name = "object_list";
        this.priority = 1;
        this.containerName = "context_object_list";
        this.html = `
        <div class="context_object_list">
            <div class="opction"></div>
            <ul class="context"></ul>
        </div>
        `;

        this.changeDataCallback = this.update;
        this.selectCallback = this.updateSelect;

        this.container = null;
    }

    destroy() {
        
    }

    showObj(obj, con){
        if(obj.name == "Helper"){
            return;
        }
        if(obj.children.length > 0){
            con.append(`
            <li class="object_list_item" id="` + obj.uuid + `">
                <div class="object_list_icon"><img src="ResourcesStatic/img/` + String(obj.type).toLocaleLowerCase() + `.png" /></div>
                <div class="object_list_name">` + obj.name + `</div>
                <div style="clear: both"></div>
                <ul class="object_list_item_children" id="` + obj.uuid + `"></ul>
            </li>
            `);
            let p = $(con).children("li").children(".object_list_item_children").eq($(con).children("li").children(".object_list_item_children").length - 1);
            for (let i = 0; i < obj.children.length; i++) {
                this.showObj(obj.children[i], p)
            }
        }
        else{
            con.append(`
            <li class="object_list_item" id="` + obj.uuid + `">
                <div class="object_list_icon"><img src="ResourcesStatic/img/` + String(obj.type).toLocaleLowerCase() + `.png" /></div>
                <div class="object_list_name">` + obj.name + `</div>
                <div style="clear: both"></div>
            </li>
            `);
        }
    }

    update(editor){
        if(editor.project == null || editor.project.scene.file === null || editor.project.scene.file === undefined){
            return;
        }

        let scene = editor.project.scene.data;
        
        $(this.container).children(".context").html("");
        for (let i = 0; i < scene.children.length; i++) {
            if(scene.children[i].type == "LineSegments" || scene.children[i].type == "AmbientLight"){
                continue;
            }
            this.showObj(scene.children[i], $( this.container).children(".context"));
        }

        let t = this;
        $(".object_list_name").click(function(){
            if($(this).parent().hasClass("object_list_item_select")){
                editor.selected = {
                    type: "none"
                };
            }
            else{
                editor.selected = {
                    type: "object",
                    uuid: $(this).parent().attr("id")
                };
            }
        });
    }

    updateSelect(editor){
        $(".object_list_item").removeClass("object_list_item_select");
        if(editor.selected.type == "object"){
            $(".object_list_item#"+editor.selected.uuid).addClass("object_list_item_select");
        }
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
    }
}