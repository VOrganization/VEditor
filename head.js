const watch = require("watchjs").watch;

const project_ext = "vproj";

function CallFunctionFromModules(fun, c){
    for (let i = 0; i < editor.modulesUsage.length; i++) {
        if(c == editor.modulesUsage[i]){
            continue;
        }
        if(editor.modulesUsage[i][fun] !== null && editor.modulesUsage[i][fun] !== undefined){
            editor.modulesUsage[i][fun](editor);
        }
    }
}

watch(editor, "selected", function(){
    CallFunctionFromModules("selectCallback");
});

