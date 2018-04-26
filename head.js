window.$ = window.jQuery = require('jquery');
const watch = require("watchjs").watch;

const project_ext = "vproj";

let editor = {
    THREE: THREE,
    modules: new Array(),
    modulesUsage: new Array(),
    defaultLayout: null,
    layout: null,
    filename: null,
    dirname: null,
    project: null,
    selected: null,
    export: {
        full: false,
        type: null
    }
};

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