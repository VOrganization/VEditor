const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const VScene = require("./VScene");

async function loadFile(file, dirname){
    let p = file.path;
    let gp = path.join(dirname, file.path);
    if(findFileType(path.extname(file.path)) == "scene"){
        let f = {
            type: findFileType(path.extname(p)),
            name: path.basename(p),
            path: p,
            autoload: true,
            inside: false,
            hash: crypto.createHash("md5").update(fs.readFileSync(gp)).digest("hex"),
            data: await VScene.import(gp, []),
        }
        return f;
    }
    return null;
}

async function load(p, editor){
    console.log("Load");
    console.log(p);
    let data = JSON.parse(fs.readFileSync(p));
    data["filename"] = String(p);
    data["dirname"] = path.dirname(String(p));
    let files = [];

    for (let i = 0; i < data.files.length; i++) {
        let d = await loadFile(data.files[i], data["dirname"]);
        if(d){
            files.push(d);
        }
    }
    
    data.files = files;


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
                console.log("Error: Don't have Load function: " + m.name);
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
            console.log("Error: Don't have Load function: " + m.name);
        }
    }

    for (let i = 0; i < editor.modulesUsage.length; i++) {
        let m = editor.modulesUsage[i];
        if(m.Update !== undefined){
            m.Update(editor);
        }
        else{
            console.log("Error: Don't have Update function: " + m.name);
        }
    }
}

function save(p, project, editor){
    let data = {
        layout: editor.layout.toConfig(),
        files: [],
        datas: [],
        modules: [],
    }

    for (let i = 0; i < project.files.length; i++) {
        let f = project.files[i];
        data.files.push({
            path: f.path,
            hash: f.hash,
        })
    }

    for (let i = 0; i < editor.modulesUsage.length; i++) {
        let m = editor.modulesUsage[i];
        if(m.Save !== undefined){
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