
const watchjs = require("watchjs");

module.exports = class{

    constructor(){
        this.type = "display";
        this.name = "object_list";
        this.priority = 1;
        this.containerName = "context_object_list";
        this.html = `
        <div class="context_object_list">
            <div class="context_menu">
                <ul>
                    <li class="context_menu_option context_menu_select">Select</li>
                    <li class="context_menu_option context_menu_rename">Rename</li>
                    <li class="context_menu_option context_menu_remove">Remove</li>
                </ul>
            </div>
            <div class="opction"></div>
            <ul class="context"></ul>
        </div>
        `;

        this.container = null;
        this.menuObject = null;
        this.menuJQObject = null;
    }

    destroy() {
        
    }

    findObj(uuid, obj){
        if(obj.uuid == uuid){
            return obj;
        }
        for (let i = 0; i < obj.children.length; i++) {
            let o = this.findObj(uuid, obj.children[i]);
            if(o !== null){
                return o;
            }
        }
        return null;
    }

    showObj(obj, con){
        if(String(obj.name).indexOf("Helper") > -1){
            return;
        }

        let is_parent = false;
        if(obj.children.length > 0){
            let num = obj.children.length;
            for (let i = 0; i < obj.children.length; i++) {
                if(String(obj.children[i].name).indexOf("Helper") > -1){
                    num -= 1;
                }
            }
            if(num > 0){
                is_parent = true;
            }
        }

        if(is_parent){
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
                this.showObj(obj.children[i], p);
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

    changeDataCallback(editor){
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
        $(".object_list_name").mousedown(function(e){
            if($(this).children(".object_list_rename").length == 1){
                return;
            }

            if(e.button == 2){
                t.menuObject = t.findObj($(this).parent().attr("id"), editor.project.scene.data);
                let o = $(t.container).offset();
                $(t.container).children(".context_menu").css({ top: e.pageY - o.top, left: e.pageX - o.left });
                $(t.container).children(".context_menu").hide().slideDown(100);

                if(editor.selected.type == "object" && editor.selected.uuid == $(this).parent().attr("id")){
                    $(t.container).children(".context_menu").children("ul").children(".context_menu_select").html("Unselect");
                }
                else{
                    $(t.container).children(".context_menu").children("ul").children(".context_menu_select").html("Select");
                }
                t.menuJQObject = $(this);
            }
            else{
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
            }
        });

        
    }

    selectCallback(editor){
        $(".object_list_item").removeClass("object_list_item_select");
        if(editor.selected.type == "object"){
            $(".object_list_item#"+editor.selected.uuid).addClass("object_list_item_select");
        }
    }


    contextMenu(editor){
        let t = this;
        $(t.container).mousedown((e) => {
            if($(t.container).children(".context_menu").is(":visible") && !$(e.target).hasClass("object_list_name") && !$(e.target).hasClass("context_menu_option")){
                $(t.container).children(".context_menu").slideUp(100);
            }
        });

        let menu = $(t.container).children(".context_menu").children("ul");

        menu.children(".context_menu_select").click(() => {
            $(t.container).children(".context_menu").slideUp(100);
            if(editor.selected.type == "object" && editor.selected.uuid == $(this).parent().attr("id")){
                editor.selected = { type: "none" };
            }
            else{
                editor.selected = {
                    type: "object",
                    uuid: t.menuObject.uuid
                };
            }
        });

        menu.children(".context_menu_rename").click(() => {
            $(t.container).children(".context_menu").slideUp(100);
            let prev_name = t.menuObject.name;
            $(t.menuJQObject).html(`<input type="text" class="object_list_rename">`);
            $(t.menuJQObject).children(".object_list_rename").val(prev_name).select();

            $(document).keypress((e) => {
                if(e.key == "Enter"){
                    t.menuObject.name = $(t.menuJQObject).children(".object_list_rename").val();
                    $(t.menuJQObject).html(t.menuObject.name);
                }
            });

            $(document).mousedown((e) => {
                if(!$(e.target).hasClass("object_list_rename")){
                    $(t.menuJQObject).html(prev_name);
                }
            });
        });

        menu.children(".context_menu_remove").click(() => {
            $(t.container).children(".context_menu").slideUp(100);
            t.menuObject.parent.remove(t.menuObject);
            CallFunctionFromModules("changeDataCallback");
        });
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        this.contextMenu(editor);
    }
}