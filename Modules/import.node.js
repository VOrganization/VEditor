const fs = require("fs");
const path = require("path");

function BReadUint32(data, i){
    let d = new Buffer(data).readUInt32LE(i[0]);
    i[0] += 4;
    return d;
}

function BReadUint8(data, i){
    let d = new Buffer(data).readUInt8(i[0]);
    i[0] += 1;
    return d;
}

function BReadFloat(data, i){
    let d = new Buffer(data).readFloatLE(i[0]);
    i[0] += 4;
    return d;
}

function BReadString(data, i){
    let b = new Buffer(data);
    let d = b.readUInt32LE(i[0]);
    i[0] += 4;
    let s = "";
    for (let j = 0; j < d; j++) {
        s += String.fromCharCode(b.readUInt8(i[0]));
        i[0] += 1;
    }
    return s;
}

function BReadString2(data, i, size){
    let b = new Buffer(data);
    let s = "";
    for (let j = 0; j < size; j++) {
        s += String.fromCharCode(b.readUInt8(i[0]));
        i[0] += 1;
    }
    return s;
}

module.exports = class{
    constructor(){
        this.type = "calculation";
        this.name = "import";
        this.priority = 10;

        this.importCallback = this.importCB;
        this.loadCallback = this.loadCB;
    }

    loadCB(editor){
        if(editor.project.scene.file == null || editor.project.scene.file == undefined){
            return;
        }

        editor.project.scene.data = this.import(path.join(editor.dirname, editor.project.scene.file), editor);
    }

    importCB(editor){

    }

    import(pp, editor){
        let scene =  new THREE.Scene();
        scene.background = new THREE.Color(0x222222);
        let d = null;
        let i = [0];
        try {
            d = fs.readFileSync(pp);
        } catch (error) {
            console.log("Error While Importing File");
            console.log(error);
            return scene;
        }
        d = new Buffer(d);
        console.log(d);

        let defaultMaterial = new THREE.MeshPhongMaterial();

        //header
        let header = BReadString2(d, i, 7);
        console.log(header);
        if(header[0] != "S" || header[6] != "S"){
            console.log("Error: Incorrect header");
            return scene;
        }

        //Files
        {
            let f_size = BReadUint32(d, i);
            let file_loadings = Array();
            for (let j = 0; j < f_size; j++) {
                let name = BReadString(d, i);
                let type = BReadUint32(d, i);
                let autoload = BReadUint8(d, i);
                let inside = BReadUint8(d, i);
                let context = null;

                let f = null;
                for (let x = 0; x < editor.project.files.length; x++) {
                    if(editor.project.files[x].path == name){
                        f = editor.project.files[x];
                        break;
                    }
                }

                if(inside){
                    context = BReadString(d, i);
                    if(f === null && !fs.existsSync(path.join(editor.dirname, name))){
                        fs.writeFileSync(path.join(editor.dirname, name), context);
                        f = {
                            type: findFileType(name),
                            name: path.basename(name, path.extname(name)),
                            ext: path.extname(name),
                            path: name,
                            data: null
                        };
                        editor.project.files.push(f);
                    }
                }

                if(f !== null && f.data === null){
                    if(f.type === null){
                        f.type = findFileType(f.ext);
                    }

                    f.data = undefined;
                    file_loadings.push(f);

                    switch (f.type) {

                        case "model":{
                            LoadModel(path.join(editor.dirname, f.path), function(d){
                                f.data = d;
                            });
                            break;
                        }
                    
                        case "image":{
                            f.data = new THREE.TextureLoader().load(path.join(editor.dirname, f.path));
                            break;
                        }

                        default:{
                            f.data = null;
                            break;
                        }
                    }
                }

                let hash = BReadString2(d, i, 32);
            }

            let wait = function(){
                setTimeout(function(){
                    let count = 0;
                    for (let j = 0; j < file_loadings.length; j++) {
                        if(file_loadings[j].data !== undefined){
                            count += 1;
                        }
                    }
                    if(count == file_loadings.length){
                        after_load_file();
                    }
                    else{
                        wait();
                    }
                }, 100);
            }
            wait();
        }
        
        let after_load_file = function(){

            //models
            {
                let size = BReadUint32(d, i);
            }

            //Meshes
            {
                let size = BReadUint32(d, i);
            }

            //Armatures
            {
                let size = BReadUint32(d, i);
            }

            //Animations
            {
                let size = BReadUint32(d, i);
            }

            //Animation Systems
            {
                let size = BReadUint32(d, i);
            }

            //Shaders
            {
                let size = BReadUint32(d, i);
            }

            //Textures
            {
                let size = BReadUint32(d, i);
            }

            //Materials
            {
                let size = BReadUint32(d, i);
                for (let j = 0; j < size; j++) {
                    if(BReadUint8(d, i) == 1){
                        BReadString2(d, i, 32); //get hash for no craching
                    }
                    else{
                        let type = BReadUint32(d, i);
                        let name = BReadString(d, i);
                        let hash = BReadString2(d, i, 32);

                        let opacity = BReadFloat(d, i);

                        BReadFloat(d, i)
                        BReadFloat(d, i)
                        BReadFloat(d, i)
                        BReadFloat(d, i)

                        
                    }
                }
            }

            //Renderers
            {
                let size = BReadUint32(d, i);
            }

            //Scripts
            {
                let size = BReadUint32(d, i);
            }

            //Objects
            {
                let size = BReadUint32(d, i);
                let load_obj = function(){
                    let o = null;
                    let type = BReadUint32(d, i);
                    switch (type) {
                        case 1:{
                            o = new THREE.Mesh();
                            break;
                        }
                    
                        case 2:{
                            o = new THREE.PointLight();
                            break;
                        }

                        case 3:{
                            o = new THREE.SpotLight();
                            break;
                        }

                        case 4:{
                            o = new THREE.DirectionalLight();
                            break;
                        }

                        default:{
                            o = new THREE.Object3D();
                            break;
                        }
                    }

                    o.name = BReadString(d, i);

                    o["display_type"] = BReadUint32(d, i);
                    o["display_priority"] = BReadUint32(d, i);

                    o.position.x = BReadFloat(d, i);
                    o.position.y = BReadFloat(d, i);
                    o.position.z = BReadFloat(d, i);

                    o.rotation.x = BReadFloat(d, i);
                    o.rotation.y = BReadFloat(d, i);
                    o.rotation.z = BReadFloat(d, i);

                    o.scale.x = BReadFloat(d, i);
                    o.scale.y = BReadFloat(d, i);
                    o.scale.z = BReadFloat(d, i);

                    switch (type) {
                        case 1:{
                            //armature
                            if(BReadString2(d, i, 1) == "O"){
                                //load armature
                            }
                            
                        
                            //mesh
                            if(BReadString2(d, i, 1) == "O"){
                                if(BReadUint8(d, i) == 1){
                                    let hash = BReadString2(d, i, 32);
                                    for (let j = 0; j < editor.project.meshes.length; j++) {
                                        if(hash == editor.project.meshes[j].EID){
                                            o.geometry = editor.project.meshes[j];
                                            break;
                                        }
                                    }
                                }
                                else{
                                    //inside
                                }
                            }

                            //material
                            if(BReadString2(d, i, 1) == "O"){
                                if(BReadUint8(d, i) == 1){
                                    let hash = BReadString2(d, i, 32);
                                    let found = false;
                                    for (let j = 0; j < editor.project.materials.length; j++) {
                                        if(hash == editor.project.materials[j].EID){
                                            o.material = editor.project.materials[j];
                                            found = true;
                                            break;
                                        }
                                    }
                                    if(!found){
                                        o.material = defaultMaterial;
                                    }
                                }
                                else{
                                    //inside
                                }
                            }
                            
                            break;
                        }
                    
                        case 2:{
                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            //point light
                            break;
                        }

                        case 3:{
                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            //spot light
                            break;
                        }

                        case 4:{
                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            //dir light
                            break;
                        }

                        case 5:{
                            //camera
                            BReadUint8(d, i);
                            BReadUint8(d, i);
                            BReadUint8(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);

                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            BReadFloat(d, i);
                            break;
                        }

                        default:
                            break;
                    }

                    let ch_size = BReadUint32(d, i);
                    for (let j = 0; j < ch_size; j++) {
                        o.add(load_obj());
                    }
                    return o;
                }
                for (let j = 0; j < size; j++) {
                    scene.add(load_obj());
                }
            }

            CallFunctionFromModules("changeDataCallback");
        }

        return scene;
    }

}