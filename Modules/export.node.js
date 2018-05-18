const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function BPush(f,s){
    return Buffer.concat([f, s]);
}

function BUint32(n){
    let b = new Buffer(4);
    b.writeUInt32LE(n, 0);
    return b;
}

function BUint8(n){
    let b = new Buffer(1);
    b.writeUInt8(n, 0);
    return b;
}

function BFloat(n){
    let b = new Buffer(4);
    b.writeFloatLE(n, 0);
    return b;
}

function BVec3(n){
    let b = new Buffer(12);
    if(n.x === undefined){
        b.writeFloatLE(n.r, 0);
        b.writeFloatLE(n.g, 4);
        b.writeFloatLE(n.b, 8);
    }
    else{
        b.writeFloatLE(n.x, 0);
        b.writeFloatLE(n.y, 4);
        b.writeFloatLE(n.z, 8);
    }
    return b;
}

function BVec4(n){
    let b = new Buffer(16);
    if(n.x === undefined){
        b.writeFloatLE(n.r, 0);
        b.writeFloatLE(n.g, 4);
        b.writeFloatLE(n.b, 8);
        b.writeFloatLE(n.a, 12);
    }
    else{
        b.writeFloatLE(n.x, 0);
        b.writeFloatLE(n.y, 4);
        b.writeFloatLE(n.z, 8);
        b.writeFloatLE(n.w, 12);
    }
    return b;
}

function BString(s){
    let b = new Buffer(4 + s.length);
    b.writeUInt32LE(s.length, 0);
    b.write(String(s), 4);
    return b;
}

function BString2(s){
    let b = new Buffer(s.length);
    b.write(String(s));
    return b;
}

function BTexture(tex){
    let b = new Buffer(0);
    if(tex !== null && tex !== undefined && tex.EID !== undefined){
        b = BPush(b, BString2("O"));
        b = BPush(b, BUint8(1));
        b = BPush(b, BString2(tex.EID));
    }
    else{
        b = BPush(b, BString2("N"));
    }
    return b;
}

module.exports = class{
    constructor(){
        this.type = "calculation";
        this.name = "export";
        this.priority = 10;

        this.exportCallback = this.exportCB;
        this.saveCallback = this.saveCB;
    }

    saveCB(editor){
        this.export(editor, false);
    }

    exportCB(editor){
        this.export(editor, true);
    }

    export(editor, full){
        if(editor.project.scene.file === undefined || editor.project.scene.file === null){
            return;
        }
        let s = editor.project.scene;

        let d = new Buffer(0);

        //header
        d = BPush(d, new Buffer("S1.0.0S"));

        //file section
        {
            let f_size = editor.project.files.length;
            for (let i = 0; i < editor.project.files.length; i++) {
                let f = editor.project.files[i];
                if(f.ext == ".vproj" || f.ext == ".vscene" || !fs.existsSync(path.join(editor.dirname, f.path))){
                    f_size -= 1;
                }
            }
            d = BPush(d, BUint32(f_size));
            for (let i = 0; i < editor.project.files.length; i++) {
                let f = editor.project.files[i];
                if(f.ext == ".vproj" || f.ext == ".vscene" || !fs.existsSync(path.join(editor.dirname, f.path))){
                    continue;
                }

                let context = fs.readFileSync(path.join(editor.dirname, f.path));
                let hash = crypto.createHash("md5").update(context).digest("hex");
                let type = 0;

                switch (f.type) {
                    case "model":
                        type = 3;
                        break;
                
                    default:
                        break;
                }

                d = BPush(d, BString(f.path));
                d = BPush(d, BUint32(type));
                d = BPush(d, BUint8(1));
                if(full){
                    d = BPush(d, BUint8(1));
                    d = BPush(d, BString(context));
                }
                else{
                    d = BPush(d, BUint8(0));
                }
                d = BPush(d, BString2(hash));
            }
        }

        //models
        d = BPush(d, BUint32(0));

        //Meshes
        d = BPush(d, BUint32(0));

        //Armatures
        d = BPush(d, BUint32(0));

        //Animations
        d = BPush(d, BUint32(0));

        //Animation Systems
        d = BPush(d, BUint32(0));

        //Shaders
        d = BPush(d, BUint32(0));

        //Textures
        d = BPush(d, BUint32(0));

        //Materials
        d = BPush(d, BUint32(editor.project.materials.length));
        for (let i = 0; i < editor.project.materials.length; i++) {
            let mat = editor.project.materials[i];

            d = BPush(d, BUint8(0));//inside

            if(mat.type == "MeshPhysicalMaterial"){
                d = BPush(d, BUint32(1));
            }
            else{
                d = BPush(d, BUint32(0));
            }
            d = BPush(d, BString(mat.name));
            d = BPush(d, BString2(require("crypto").createHash("md5").update(mat.uuid).digest("hex")));

            d = BPush(d, BFloat(mat.opacity));

            d = BPush(d, BVec4(mat.color));
            d = BPush(d, BTexture(mat.map));

            if(mat.type == "MeshPhongMaterial"){
                d = BPush(d, BVec4(mat.specular));
                d = BPush(d, BFloat(mat.shininess));
                d = BPush(d, BTexture(mat.specularMap));
            }
            
            d = BPush(d, BVec4(mat.emissive));
            d = BPush(d, BTexture(mat.emissiveMap));

            if(mat.type == "MeshPhysicalMaterial"){

                // if (this->type == 1) {
                //     f->read((char*)&this->roughness, 4);
                //     f->read(&cc, 1);
                //     if (cc == 'O') {
                //         this->roughnessMap = new Texture_2D(f);
                //     }
                //     f->read((char*)&this->metalic, 4);
                //     f->read(&cc, 1);
                //     if (cc == 'O') {
                //         this->metalicMap = new Texture_2D(f);
                //     }
                // }
            }

            d = BPush(d, BTexture(mat.bumpMap));
            d = BPush(d, BFloat(mat.bumpScale));

            d = BPush(d, BTexture(mat.normalMap));

            d = BPush(d, BTexture(mat.aoMap));
            d = BPush(d, BFloat(mat.aoMapIntensity));

            d = BPush(d, BFloat(mat.reflectivity));
            d = BPush(d, BFloat(mat.refractionRatio));
            d = BPush(d, BUint8(0));

            d = BPush(d, BUint32(0));
            d = BPush(d, BUint32(0));
            d = BPush(d, BUint32(0));

        }

        //Renderers
        d = BPush(d, BUint32(0));

        //Scripts
        d = BPush(d, BUint32(0));

        //Objects
        {
            let obj_size = s.data.children.length;
            for (let i = 0; i < s.data.children.length; i++) {
                if(s.data.children[i].type == "LineSegments" || s.data.children[i].type == "AmbientLight" || String(s.data.children[i].name).indexOf("Helper") > -1){
                    obj_size -= 1;
                }
            }
            
            d = BPush(d, BUint32(obj_size));

            let obj_save = function(obj){
                let type = 0;

                switch (obj.type) {

                    case "Mesh":
                        type = 1;
                        break;
                
                    case "PointLight":
                        type = 2;
                        break;
                        

                    case "SpotLight":
                        type = 3;
                        break;

                    case "DirectionalLight":
                        type = 4;
                        break;

                    default:
                        break;
                }

                d = BPush(d, BUint32(type));
                d = BPush(d, BString(obj.name));

                d = BPush(d, BUint32(0)); // display type
                d = BPush(d, BUint32(0)); // display priority

                d = BPush(d, BVec3(obj.position));
                d = BPush(d, BVec3({
                    x: (obj.rotation.x * 180.0) / 3.14,
                    y: (obj.rotation.y * 180.0) / 3.14,
                    z: (obj.rotation.z * 180.0) / 3.14,
                }));
                d = BPush(d, BVec3(obj.scale));

                switch (type) {

                    case 1:{
                        //armature
                        d = BPush(d, BString2("N"));
                    
                        //mesh
                        d = BPush(d, BString2("O"));
                        d = BPush(d, BUint8(1));
                        d = BPush(d, BString2(obj.geometry.EID));

                        //material
                        if(obj.material !== null){
                            d = BPush(d, BString2("O"));
                            d = BPush(d, BUint8(1));
                            d = BPush(d, BString2(crypto.createHash("md5").update(obj.material.uuid).digest("hex")));
                        }
                        else{
                            d = BPush(d, BString2("N"));
                        }   

                        break;
                    }
                
                    case 2:{
                        d = BPush(d, BVec3(obj.ambient));
                        d = BPush(d, BVec3(obj.color));
                        d = BPush(d, BVec3(obj.specular));

                        let kl = 0;
                        let kq = 0;
                        while (true) {
                            let tmp = 1.0 / (obj.decay + kl * obj.distance + kq * Math.pow(obj.distance, 2));
                            kl += 0.001;
                            kq += 0.0001;
                            if(tmp < 0.001){
                                break;
                            }
                        }

                        d = BPush(d, BFloat(obj.intensity));

                        d = BPush(d, BFloat(obj.decay));
                        d = BPush(d, BFloat(kl));
                        d = BPush(d, BFloat(kq));
                        break;
                    }

                    case 3:{
                        d = BPush(d, BVec3(obj.ambient));
                        d = BPush(d, BVec3(obj.color));
                        d = BPush(d, BVec3(obj.specular));

                        let kl = 0;
                        let kq = 0;
                        while (true) {
                            let tmp = 1.0 / (obj.decay + kl * obj.distance + kq * Math.pow(obj.distance, 2));
                            kl += 0.001;
                            kq += 0.0001;
                            if(tmp < 0.001){
                                break;
                            }
                        }

                        d = BPush(d, BFloat(obj.intensity));

                        d = BPush(d, BFloat(obj.decay));
                        d = BPush(d, BFloat(kl));
                        d = BPush(d, BFloat(kq));

                        d = BPush(d, BFloat(obj.angle));
                        d = BPush(d, BFloat(obj.penumbra));

                        break;
                    }

                    case 4:{
                        d = BPush(d, BVec3(obj.ambient));
                        d = BPush(d, BVec3(obj.color));
                        d = BPush(d, BVec3(obj.specular));

                        d = BPush(d, BFloat(obj.intensity));

                        break;
                    }

                    default:
                        break;
                }

                
                let ch_size = obj.children.length;
                for (let i = 0; i < obj.children.length; i++) {
                    if(String(obj.children[i].name).indexOf("Helper") > -1){
                        ch_size -= 1;
                    }
                }
                d = BPush(d, BUint32(ch_size));
                for (let i = 0; i < obj.children.length; i++) {
                    if(String(obj.children[i].name).indexOf("Helper") > -1){
                        continue;
                    }
                    obj_save(obj.children[i]);
                }
            }

            for (let i = 0; i < s.data.children.length; i++) {
                if(s.data.children[i].type == "LineSegments" || s.data.children[i].type == "AmbientLight" || String(s.data.children[i].name).indexOf("Helper") > -1){
                    continue;
                }
                obj_save(s.data.children[i]);
            }
        }
 
        try {
            fs.writeFileSync(path.join(editor.dirname, editor.project.scene.file), d);
            console.log("End Exporting");
        } catch (error) {
            console.log("Error While Exporting Scene");
            console.log(error);
        }
    }

}