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
    console.log("UpdateSelect");
    CallFunctionFromModules("UpdateSelect");
});

function findFileType(ext){
    let e = String(ext).toLocaleLowerCase();
    if(e == ".jpg" || e == ".tiff" || e == ".gif" || e == ".bmp" || e == ".png" || e == ".webp"){
        return "image";
    }

    if(e == ".bvh" || e == ".blend" || e == ".dae" || e == ".fbx" || e == ".gltf" || e == ".obj" || e == ".ply" || e == ".stl"){
        return "model";
    }
    
    if(e == ".vscene"){
        return "scene";
    }

    if(e == ".vshader" || e == ".shader" || e == ".glsl" || e == ".hlsl"){
        return "shader";
    }

    if(e == ".vmat" || e == ".mat"){
        return "material";
    }

    if(e == ".vmesh"){
        return "mesh";
    }

    return "undefined";
}