const fs = require("fs");
const path = require("path");
const SmartBuffer = require("smart-buffer").SmartBuffer;

function ReadColorRGB(buf = new SmartBuffer()){
    return new THREE.Color(
        buf.readFloatLE(),
        buf.readFloatLE(),
        buf.readFloatLE(),
    );
}

function ReadVec3(buf = new SmartBuffer()){
    return new THREE.Vector3(
        buf.readFloatLE(),
        buf.readFloatLE(),
        buf.readFloatLE(),
    );
}

async function loadFile(buf = new SmartBuffer(), data, db_files){
    return new Promise((resolve, reject) => {
        let name = buf.readString(buf.readUInt32LE());
        let type = buf.readUInt32LE();
        type = findFileType(path.extname(name));
        let autoload = buf.readUInt8() == 1 ? true : false;
        let inside = buf.readUInt8() == 1 ? true : false;
        let p = path.join(path.dirname(data.path), name);
        if(inside){
            let size = buf.readUInt32LE();
            fs.writeFileSync(p, buf.readString(size));
        }
        let hash = buf.readString(32);
        let file = {
            type: type,
            name: path.basename(name),
            path: name,
            autoload: autoload,
            inside: inside,
            hash: hash,
            data: null,
        }


        let loaded = false;
        let found = false;

        //find the file in db_files

        if(!found){
            data.files.push(file);
        }

        if(!loaded){
            switch (file.type) {

                case "model":{
                    LoadModel(p, (model) => {
                        file.data = model;
                        data.models.push(model);
                        model.traverse((obj) => {
                            if(obj.type == "Mesh"){
                                data.meshes.push(obj.geometry);
                            }
                        })
                        resolve();
                    })
                    break;
                }

                case "image":{
                    file.data = new THREE.TextureLoader().load(p);
                    file.data.name = file.name;
                    file.data["path"] = file.path;
                    file.data["EID"] = hash
                    data.textures.push(file.data);
                    resolve();
                    break;
                }
            
                default:{
                    reject("Error: Unknow file format: " + file.path);
                    break;
                }
            }
        }
    });
}

async function loadFiles(buf = new SmartBuffer(), data, db_files){
    let size = buf.readUInt32LE();
    console.log("Files: " + size);
    for (let i = 0; i < size; i++) {
        await loadFile(buf, data, db_files);
    }
}

function loadTexture(buf = new SmartBuffer(), data, db_files){
    if(buf.readString(1) == "O"){
        if(buf.readUInt8() == 1){
            let hash = buf.readString(32);
            for (let i = 0; i < data.textures.length; i++) {
                let tex = data.textures[i];
                if(tex.EID == hash){
                    return tex;
                }
            }
            return null;
        }
        else{
            //load image from bits
            return null;
        }
    }
    else{
        return null;
    }
}

async function loadMaterials(buf = new SmartBuffer(), data, db_files){
    let size = buf.readUInt32LE();
    for (let i = 0; i < size; i++) {
        if(buf.readUInt8() == 1){
           let hash = buf.readString(32);
           //console.log("")
        }
        else{
            let mat = new THREE.MeshPhongMaterial();
            let type = buf.readUInt32LE();
            if(type == 1){
                mat = new THREE.MeshStandardMaterial();
            }

            mat.name = buf.readString(buf.readUInt32LE());
            mat["EID"] = buf.readString(32);

            mat.opacity = buf.readFloatLE();
            mat.color.r = buf.readFloatLE();
            mat.color.g = buf.readFloatLE();
            mat.color.b = buf.readFloatLE();
            buf.readFloatLE();

            mat.map = loadTexture(buf, data, db_files);

            if(type == 0){
                mat.specular.r = buf.readFloatLE();
                mat.specular.g = buf.readFloatLE();
                mat.specular.b = buf.readFloatLE();
                buf.readFloatLE();
                mat.shininess = buf.readFloatLE();
                mat.specularMap = loadTexture(buf, data, db_files);
            }     

            mat.emissive.r = buf.readFloatLE();
            mat.emissive.g = buf.readFloatLE();
            mat.emissive.b = buf.readFloatLE();
            buf.readFloatLE();
            mat.emissiveMap = loadTexture(buf, data, db_files);


            if(type == 1){
                console.log("OJ");
            }

            mat.bumpMap = loadTexture(buf, data, db_files);
            mat.bumpScale = buf.readFloatLE();

            mat.normalMap = loadTexture(buf, data, db_files);

            mat.aoMap = loadTexture(buf, data, db_files);
            mat.aoMapIntensity = buf.readFloatLE();

            mat.reflectivity = buf.readFloatLE();
            mat.refractionRatio = buf.readFloatLE();
            mat["dynamicCube"] = buf.readUInt8() == 1 ? true : false;

            buf.readUInt32LE();
            buf.readUInt32LE();
            buf.readUInt32LE();

            data.materials.push(mat);
        }
    }
}

function loadObject(buf = new SmartBuffer(), data, db_files){
    let o = null;
    let type = buf.readUInt32LE();

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

    o.name = buf.readString(buf.readUInt32LE());
    o["display_type"]     = buf.readUInt32LE();
    o["display_priority"] = buf.readUInt32LE();

    o.position.set(
        buf.readFloatLE(),
        buf.readFloatLE(),
        buf.readFloatLE()
    );

    o.rotation.set(
        (buf.readFloatLE() * 3.14) / 180.0,
        (buf.readFloatLE() * 3.14) / 180.0,
        (buf.readFloatLE() * 3.14) / 180.0
    );

    o.scale.set(
        buf.readFloatLE(),
        buf.readFloatLE(),
        buf.readFloatLE()
    );

    switch (type) {

        case 1:{
            //armature
            if(buf.readString(1) == "O"){
                //load armature
            }
            
        
            //mesh
            if(buf.readString(1) == "O"){
                if(buf.readUInt8() == 1){
                    let hash = buf.readString(32);
                    let found = false;
                    for (let j = 0; j < data.meshes.length; j++) {
                        if(hash == data.meshes[j].EID){
                            o.geometry = data.meshes[j];
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
            if(buf.readString(1) == "O"){
                if(buf.readUInt8() == 1){
                    let hash = buf.readString(32);
                    let found = false;
                    for (let j = 0; j < data.materials.length; j++) {
                        if(hash == data.materials[j].EID){
                            o.material = data.materials[j];
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        o.material = data.defaultMaterial;
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
            o["ambient"]  = ReadColorRGB(buf);
            o["color"]    = ReadColorRGB(buf);
            o["specular"] = ReadColorRGB(buf);

            o.intensity    = buf.readFloatLE();
            o["decay"]     = buf.readFloatLE();
            o["linear"]    = buf.readFloatLE();
            o["quadratic"] = buf.readFloatLE();
            
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
            o["ambient"]  = ReadColorRGB(buf);
            o["color"]    = ReadColorRGB(buf);
            o["specular"] = ReadColorRGB(buf);

            o.intensity    = buf.readFloatLE();
            o["decay"]     = buf.readFloatLE();
            o["linear"]    = buf.readFloatLE();
            o["quadratic"] = buf.readFloatLE();

            o.angle    = buf.readFloatLE();
            o.penumbra = buf.readFloatLE();

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
            o["ambient"]  = ReadColorRGB(buf);
            o["color"]    = ReadColorRGB(buf);
            o["specular"] = ReadColorRGB(buf);
            o.intensity   = buf.readFloatLE();
            break;
        }

        case 5:{
            o.Default      = Boolean(buf.readUInt8());
            o.UseDirection = Boolean(buf.readUInt8());
            buf.readUInt8(); // Perspective

            o.Direction = ReadVec3(buf);
            o.Up        = ReadVec3(buf);

            o.fov  = buf.readFloatLE();
            o.far  = buf.readFloatLE();
            o.near = buf.readFloatLE();
            o.zoom = buf.readFloatLE();
            break;
        }

        default:
            break;
    }

    let ch_size = buf.readUInt32LE();
    for (let i = 0; i < ch_size; i++) {
        o.add(loadObject(buf, data, db_files));
    }
    return o;
}

async function importScene(p, db_files){
    let data = {
        path: p,
        scene: new THREE.Scene(),
        files: [],
        models: [],
        meshes: [],
        materials: [],
        textures: [],
        defaultMaterial: new THREE.MeshPhongMaterial({side: THREE.DoubleSide}),
    };
    data.scene.background = new THREE.Color(0x222222);


    let buf = SmartBuffer.fromBuffer(fs.readFileSync(p));
    let header = buf.readString(7);
    console.log(header);
    if(header[0] != "S" || header[6] != "S"){
        reject("Error: Incored header");
    }

    await loadFiles(buf, data, db_files);
    console.log("Models: " + buf.readUInt32LE());
    console.log("Meshes: " + buf.readUInt32LE());
    console.log("Armatures: " + buf.readUInt32LE());
    console.log("Animations: " + buf.readUInt32LE());
    console.log("Animation Systems: " + buf.readUInt32LE());
    console.log("Shaders: " + buf.readUInt32LE());
    console.log("Textures: " + buf.readUInt32LE());
    await loadMaterials(buf, data, db_files);
    //console.log("Materials: " + buf.readUInt32LE());
    console.log("Renderers: " + buf.readUInt32LE());
    console.log("Scripts: " + buf.readUInt32LE());
    let object_size = buf.readUInt32LE();
    console.log("Objects: " + object_size );
    for (let i = 0; i < object_size; i++) {
        data.scene.add(loadObject(buf, data, db_files));
    }

    return data;
}

module.exports.import = importScene;