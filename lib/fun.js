
function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}

function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

function removejscssfile(filename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
}

function get_file_type(d){
    let p = String(d).toLocaleLowerCase();

    if(p.indexOf(".model") > -1 || p.indexOf(".fbx") > -1 || p.indexOf(".dae") > -1 || p.indexOf(".blend") > -1 || p.indexOf(".3ds") > -1 || p.indexOf(".ase") > -1 || p.indexOf(".obj") > -1 || p.indexOf(".bvh") > -1 || p.indexOf(".csm") > -1){
        return "model";
    }

    if(p.indexOf(".tex") > -1 || p.indexOf(".png") > -1 || p.indexOf(".bmp") > -1 || p.indexOf(".jpg") > -1 || p.indexOf(".webp") > -1){
        return "image";
    }

    if(p.indexOf(".mp3") > -1 || p.indexOf(".flac") > -1 || p.indexOf(".acc") > -1 || p.indexOf(".ogg") > -1 || p.indexOf(".wav") > -1){
        return "audio";
    }

    if(p.indexOf(".mat") > -1){
        return "material";
    }

    if(p.indexOf(".shader") > -1 || p.indexOf(".glsl") > -1){
        return "shader";
    }

    if(p.indexOf(".anim") > -1 || p.indexOf(".sanim") > -1){
        return "animation";
    }

    if(p.indexOf(".xml") > -1 || p.indexOf(".json") > -1 || p.indexOf(".txt") > -1){
        return "code";
    }

    // if(p.indexOf(".js") > -1){
    //     return "script";
    // }

    return "null";
}

function get_file_type_id(t){
    switch (t) {
        case "model":
            return 3;
            break;
    
        case "image":
            return 2;
            break;

        case "audio":
            return 8;
            break;

        case "material":
            return 4;
            break;

        case "shader":
            return 5;
            break;

        case "animation":
            return 1;
            break;

        default:
            break;
    }
    return 0;
}

function get_file_icon(p){
    let type = get_file_type(p);
    if(type == "audio"){
        return "icon-file-audio";
    }
    else if(type == "shader" || type == "script" || type == "code"){
        return "icon-file-code";
    }
    else if(type == "image"){
        return "icon-file-image";
    }
    else if(p.indexOf(".") > -1){
        return "icon-doc-inv";
    }
    else{
        return "icon-folder";
    }

    return "null";
}

function find_object(_id){
    let index = 0;
    let find = function(obj, id){
        index += 1;
        if(index == id){
            return obj;
        }
        else{
            for (let i = 0; i < obj.children.length; i++) {
                let o = find(obj.children[i], id);
                if(o !== null){
                    return o;
                }
            }
        }
        return null;
    }
    let obj = null;
    for (let i = 0; i < editor_data.data.object.length; i++) {
        obj = find(editor_data.data.object[i], _id);
        if(obj !== null){
            break;
        }
    }
    return obj;
}

function get_id_object(obj){
    let id = 0;
    let find = function(o){
        id += 1;
        if(o == obj){
            return id;
        }
        for (let i = 0; i < o.children.length; i++) {
            let _id = find(o.children[i]);
            if(_id !== null){
                return _id;
            }
        }
        return null;
    }
    for (let i = 0; i < editor_data.data.object.length; i++) {
        let _id = find(editor_data.data.object[i]);
        if(_id !== null){
            return _id;
        }
    }
    return null;
}

function get_path_of_tex(map){
    for (let i = 0; i < editor_data.data.textures.length; i++) {
        if(editor_data.data.textures[i].tex == map){
            return editor_data.data.textures[i].path;
        }
    }
    return null;
}

function get_tex_of_path(map){
    for (let i = 0; i < editor_data.data.textures.length; i++) {
        if(editor_data.data.textures[i].path == map){
            return editor_data.data.textures[i].tex;
        }
    }
    return null;
}

let loaders = [
    {
        format: "3ds",
        load: new THREE.TDSLoader()
    },
    {
        format: "3mf",
        load: new THREE.ThreeMFLoader()
    },
    {
        format: "amf",
        load: new THREE.AMFLoader()
    },
    {
        format: "assimp",
        load: new THREE.AssimpLoader()
    },
    {
        format: "json",
        load: new THREE.AssimpJSONLoader()
    },
    {
        format: "awd",
        load: new THREE.AWDLoader()
    },
    {
        format: "bvh",
        load: new THREE.BVHLoader()
    },
    {
        format: "dae",
        load: new THREE.ColladaLoader(new THREE.LoadingManager())
    },
    {
        format: "fbx",
        load: new THREE.FBXLoader(new THREE.LoadingManager())
    },
    {
        format: "gltf",
        load: new THREE.GLTFLoader()
    },
    {
        format: "kmz",
        load: new THREE.KMZLoader()
    },
    {
        format: "obj",
        load: THREE.OBJLoader
    },
    {
        format: "nrrd",
        load: new THREE.NRRDLoader()
    },
    {
        format: "pcd",
        load: new THREE.PCDLoader()
    },
    {
        format: "pdb",
        load: new THREE.PDBLoader()
    },
    {
        format: "ply",
        load: new THREE.PLYLoader()
    },
    {
        format: "stl",
        load: new THREE.STLLoader()
    }
];

function load_model(p, fun){
    let calc_obj = function(obj){
        if(obj.type == "Mesh"){
            obj.geometry.name = obj.name;
        }
        obj["display_type"] = 0;
        obj["display_priority"] = 10;
        for (let i = 0; i < obj.children.length; i++) {
            calc_obj(obj.children[i]);
        }
    }
    let d =  String(p).toLocaleLowerCase().replace("/", "\\");
    for (let i = 0; i < loaders.length; i++) {
        if(d.indexOf(("." + loaders[i].format)) > -1){
            let l = new loaders[i].load();
            l.load(p, function(object) {
                calc_obj(object);
                fun(object);
            });
            break;
        }
    }
}

// function load_model(p, fun){
//     let d =  String(p).toLocaleLowerCase().replace("/", "\\");
//     for (let i = 0; i < loaders.length; i++) {
//         if(d.indexOf(("." + loaders[i].format)) > -1){
//             let l = new loaders[i].load();
//             l.load(p, function(object) {
//                 fun(object);
//             });
//             break;
//         }
//     }
// }