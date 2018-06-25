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

function BReadColorRGB(data, i){
    return new THREE.Color(BReadFloat(data, i), BReadFloat(data, i), BReadFloat(data, i));
}

function BReadVec3(data, i){
    return new THREE.Vector3(BReadFloat(data, i), BReadFloat(data, i), BReadFloat(data, i));
}

function BReadTexture(data, i){
    let is = BReadString2(data, i, 1);
    if(is == "O"){
        if(BReadUint8(data, i) == 1){
            let hash = BReadString2(data, i, 32);
            for (let i = 0; i < editor.project.textures.length; i++) {
                let tex = editor.project.textures[i];
                if(tex.EID == hash){
                    return tex;
                }
            }
            return null;
        }
        else{
            return null;
        }
    }
    else{
        return null;
    }
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
        // if(editor.project.scene === null || editor.project.scene === undefined || editor.project.scene.file == null || editor.project.scene.file == undefined){
        //     return;
        // }

        // editor.project.scene.data = this.import(path.join(editor.dirname, editor.project.scene.file), editor);
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

        let defaultMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide});
        defaultMaterial.name = "defaultMaterial";
        let dm_found = false;
        for (let j = 0; j < editor.project.materials.length; j++) {
            if(editor.project.materials[j].name == "defaultMaterial"){
                dm_found = true;
                defaultMaterial = editor.project.materials[j];
                break;
            }
        }

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
            console.log("Files: " + f_size);
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
                        editor.project.files.push({
                            type: null,
                            name: path.basename(name, path.extname(name)),
                            ext: path.extname(name),
                            path: name,
                            data: null
                        });
                        f = editor.project.files[editor.project.files.length - 1];
                    }
                }
                
                let hash = BReadString2(d, i, 32);

                if(f !== null && f.data === null){
                    if(f.type === null){
                        f.type = findFileType(f.ext);
                    }

                    switch (f.type) {

                        case "model":{
                            f.data = undefined;
                            file_loadings.push(f);
                            LoadModel(path.join(editor.dirname, f.path), function(d){
                                f.data = d;
                            });
                            break;
                        }
                    
                        case "image":{
                            f.data = new THREE.TextureLoader().load(path.join(editor.dirname, f.path));
                            f.data.name = f.name;
                            f.data["path"] = f.path;
                            f.data["EID"] = hash;
                            editor.project.textures.push(f.data);
                            break;
                        }

                        default:{
                            f.data = null;
                            break;
                        }
                    }
                }

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
                console.log("Models: " + size);
            }

            //Meshes
            {
                let size = BReadUint32(d, i);
                console.log("Meshes: " + size);
            }

            //Armatures
            {
                let size = BReadUint32(d, i);
                console.log("Armatures: " + size);
            }

            //Animations
            {
                let size = BReadUint32(d, i);
                console.log("Animations: " + size);
            }

            //Animation Systems
            {
                let size = BReadUint32(d, i);
                console.log("Animation Systems: " + size);
            }

            //Shaders
            {
                let size = BReadUint32(d, i);
                console.log("Shaders: " + size);
            }

            //Textures
            {
                let size = BReadUint32(d, i);
                console.log("Textures: " + size);
            }

            //Materials
            {
                let size = BReadUint32(d, i);
                console.log("Materials: " + size);
                for (let j = 0; j < size; j++) {
                    if(BReadUint8(d, i) == 1){
                        BReadString2(d, i, 32); //get hash for no craching
                    }
                    else{
                        let mat = new THREE.MeshPhongMaterial();
                        let type = BReadUint32(d, i);
                        if(type == 1){
                            mat = new THREE.MeshStandardMaterial();
                        }

                        mat.name = BReadString(d, i);
                        console.log("Name: " + mat.name);
                        mat["EID"] = BReadString2(d, i, 32);
                        console.log("EID: " + mat.EID);

                        mat.opacity = BReadFloat(d, i);
                        mat.color.r = BReadFloat(d, i);
                        mat.color.g = BReadFloat(d, i);
                        mat.color.b = BReadFloat(d, i);
                        BReadFloat(d, i);
                        mat.map = BReadTexture(d, i);

                        if(type == 0){
                            mat.specular.r = BReadFloat(d, i);
                            mat.specular.g = BReadFloat(d, i);
                            mat.specular.b = BReadFloat(d, i);
                            BReadFloat(d, i);
                            mat.shininess = BReadFloat(d, i);
                            mat.specularMap = BReadTexture(d, i);
                        }     

                        mat.emissive.r = BReadFloat(d, i);
                        mat.emissive.g = BReadFloat(d, i);
                        mat.emissive.b = BReadFloat(d, i);
                        BReadFloat(d, i);
                        mat.emissiveMap = BReadTexture(d, i);


                        if(type == 1){
                            console.log("OJ");
                        }

                        mat.bumpMap = BReadTexture(d, i);
                        mat.bumpScale = BReadFloat(d, i);

                        mat.normalMap = BReadTexture(d, i);

                        mat.aoMap = BReadTexture(d, i);
                        mat.aoMapIntensity = BReadFloat(d, i);

                        mat.reflectivity = BReadFloat(d, i);
                        mat.refractionRatio = BReadFloat(d, i);
                        mat["dynamicCube"] = BReadUint8(d, i);

                        BReadUint32(d, i);
                        BReadUint32(d, i);
                        BReadUint32(d, i);

                        editor.project.materials.push(mat);
                    }
                }

                if(!dm_found && editor.project.materials.length > 0){
                    defaultMaterial = editor.project.materials[0];
                }
                else{
                    editor.project.materials.push(defaultMaterial);
                }
            }

            //Renderers
            {
                let size = BReadUint32(d, i);
                console.log("Renderer: " + size);
            }

            //Scripts
            {
                let size = BReadUint32(d, i);
                console.log("Scripts: " + size);
            }

            //Objects
            {
                let size = BReadUint32(d, i);
                console.log("Objects: " + size);
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

                        case 5:{
                            o = new THREE.PerspectiveCamera();
                            o["Default"] = false;
                            o["UseDirection"] = false;
                            o["Direction"] = new THREE.Vector3(0, 0, 0);
                            o["Up"] = new THREE.Vector3(0, 1, 0);
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

                    o.rotation.x = (BReadFloat(d, i) * 3.14) / 180.0;
                    o.rotation.y = (BReadFloat(d, i) * 3.14) / 180.0;
                    o.rotation.z = (BReadFloat(d, i) * 3.14) / 180.0;

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
                                    let found = false;
                                    for (let j = 0; j < editor.project.meshes.length; j++) {
                                        if(hash == editor.project.meshes[j].EID){
                                            o.geometry = editor.project.meshes[j];
                                            found = true;
                                            break;
                                        }
                                    }
                                    if(!found){
                                        console.log("Error while finding mesh");
                                        console.log(hash);
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
                            
                            o.castShadow = true;
                            o.receiveShadow = true;

                            break;
                        }
                    
                        case 2:{
                            o["ambient"] = BReadColorRGB(d, i);
                            o["color"] = BReadColorRGB(d, i);
                            o["specular"] = BReadColorRGB(d, i);

                            o.intensity = BReadFloat(d, i);
                            o["decay"] = BReadFloat(d, i);
                            o["linear"] = BReadFloat(d, i);
                            o["quadratic"] = BReadFloat(d, i);
                            
                            o.distance = 0;
                            while (true) {
                                let a = 1.0 / (o.decay + o.linear * o.distance + o.quadratic * o.distance * o.distance);
                                if(a < 0.001){
                                    break;
                                }
                                o.distance += 0.1;
                            }
                            o.distance = Math.round(o.distance);
                            break;
                        }

                        case 3:{
                            o["ambient"] = BReadColorRGB(d, i);
                            o["color"] = BReadColorRGB(d, i);
                            o["specular"] = BReadColorRGB(d, i);

                            o.intensity = BReadFloat(d, i);

                            o["decay"] = BReadFloat(d, i);
                            o["linear"] = BReadFloat(d, i);
                            o["quadratic"] = BReadFloat(d, i);

                            o.angle = BReadFloat(d, i);
                            o.penumbra = BReadFloat(d, i);

                            o.distance = 0;
                            while (true) {
                                let a = 1.0 / (o.decay + o.linear * o.distance + o.quadratic * o.distance * o.distance);
                                if(a < 0.001){
                                    break;
                                }
                                o.distance += 0.1;
                            }
                            o.distance = Math.round(o.distance);
                            break;
                        }

                        case 4:{
                            o["ambient"] = BReadColorRGB(d, i);
                            o["color"] = BReadColorRGB(d, i);
                            o["specular"] = BReadColorRGB(d, i);

                            o.intensity = BReadFloat(d, i);
                            break;
                        }

                        case 5:{
                            o.Default = Boolean(BReadUint8(d, i));
                            o.UseDirection = Boolean(BReadUint8(d, i));
                            BReadUint8(d, i); // Perspective

                            o.Direction = BReadVec3(d, i);
                            
                            o.Up = BReadVec3(d, i);

                            o.fov = BReadFloat(d, i);
                            o.far = BReadFloat(d, i);
                            o.near = BReadFloat(d, i);
                            o.zoom = BReadFloat(d, i);
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