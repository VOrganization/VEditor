const fs = require("fs");
const path = require("path");

function load(p, editor){
    console.log("Load");
    console.log(p);
    let data = JSON.parse(fs.readFileSync(p));
    data["filename"] = String(p);
    data["dirname"] = path.dirname(String(p));
    console.log(data);


    return data;
}

function afterLoad(project, editor){
    let loaded = [];
    for (let i = 0; i < project.modules.length; i++) {
        let m = project.modules[i];
        let em = editor.modulesUsage[m.id];
        if(em.name == m.name){
            if(em.Load !== undefined){
                em.Load(editor, m.data);
                loaded.push(m.id);
            }
            else{
                console.log("Error: Don't have Load function");
            }
        }
        else{
            console.log("Error: Not this same name");
        }
    }

    for (let i = 0; i < editor.modulesUsage.length; i++) {
        let m = editor.modulesUsage[i];
        if(loaded.indexOf(i) != -1){
            continue;
        }
        if(m.Load !== undefined){
            m.Load(editor);
        }
        else{
            console.log("Error: Don't have Load function");
        }
    }
}

function save(p, project, editor){
    let data = {
        layout: editor.layout.toConfig(),
        files: project.files,
        datas: [],
        modules: [],
    }

    for (let i = 0; i < editor.modulesUsage.length; i++) {
        let m = editor.modulesUsage[i];
        if(m.Save !== undefined){
            console.log(m);
            data.modules.push({
                id: i,
                name: m.name,
                data: m.Save(editor)
            })
        }
    }

    fs.writeFileSync(p, JSON.stringify(data));
}

module.exports.load = load;
module.exports.afterLoad = afterLoad;
module.exports.save = save;