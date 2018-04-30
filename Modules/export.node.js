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
        if(editor.project.data.scene === undefined || editor.project.data.scene === null){
            return;
        }
        let s = editor.project.data.scene;

        let d = new Buffer(0);

        //header
        d = BPush(d, new Buffer("S1.0.0S"));

        //file section
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

            let b;
            let context = fs.readFileSync(path.join(editor.dirname, f.path));
            let hash = crypto.createHash("md5").update(context).digest("hex");
            if(full){
                b = new Buffer(46 + context.length + f.path.length);
            }
            else{
                b = new Buffer(42 + f.path.length);
            }

            b.writeUInt32LE(f.path.length, 0);
            b.write(f.path, 4);
            b.writeUInt32LE(0, f.path.length + 4);
            if(full){
                b.writeUInt8(1, f.path.length + 8);
                b.writeUInt32LE(context.length, f.path.length + 9);
                b.write(context, f.path.length + 13);
                b.write(hash, f.path.length + context.length + 13)
            }
            else{
                b.writeUInt8(0, f.path.length + 8);
                b.write(hash, f.path.length + 9)
            }
            
            d = BPush(d, b);
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
        d = BPush(d, BUint32(0));

        //Renderers
        d = BPush(d, BUint32(0));

        //Scripts
        d = BPush(d, BUint32(0));

        //Objects
        let obj_size = s.data.children.length;
        for (let i = 0; i < s.data.children.length; i++) {
            if(s.data.children[i].type == "LineSegments" || s.data.children[i].type == "AmbientLight"){
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
            
                default:
                    break;
            }

            d = BPush(d, BUint32(type));
            d = BPush(d, BString(obj.name));

            d = BPush(d, BUint32(0)); // display type
            d = BPush(d, BUint32(0)); // display priority

            let t = new Buffer(36);
            t.writeFloatLE(obj.position.x, 0);
            t.writeFloatLE(obj.position.y, 4);
            t.writeFloatLE(obj.position.z, 8);
            t.writeFloatLE(obj.rotation.x, 12);
            t.writeFloatLE(obj.rotation.y, 16);
            t.writeFloatLE(obj.rotation.z, 20);
            t.writeFloatLE(obj.scale.x, 24);
            t.writeFloatLE(obj.scale.y, 28);
            t.writeFloatLE(obj.scale.z, 32);
            d = BPush(d, t);

            switch (type) {
                case 1:{
                    //armature
                    d = BPush(d, BString2("N"));
                
                    //mesh
                    d = BPush(d, BString2("O"));
                    let g = new THREE.Geometry().fromBufferGeometry(obj.geometry);
                    d = BPush(d, BUint8(1));
                    d = BPush(d, BString2(crypto.createHash("md5").update(String(obj.geometry.name) + String(g.faces.length)).digest("hex")));

                    //material
                    // if(obj.material !== null){
                    //     data.push("O");
                    //     data.push(bin.toBytes(bin.DT.uint8, 1));
                    //     data.push(crypto.createHash("md5").update(obj.material.uuid).digest("hex"));
                    // }
                    // else{
                        d = BPush(d, BString2("N"));
                    // }   
                    break;
                }
            
                default:
                    break;
            }

            d = BPush(d, BUint32(obj.children.length));
            for (let i = 0; i < obj.children.length; i++) {
                obj_save(obj.children[i]);
            }
        }
        for (let i = 0; i < s.data.children.length; i++) {
            if(s.data.children[i].type == "LineSegments" || s.data.children[i].type == "AmbientLight"){
                continue;
            }
            obj_save(s.data.children[i]);
        }
 
        try {
            fs.writeFileSync(path.join(editor.dirname, editor.project.data.scene.file), d);
        } catch (error) {
            console.log("Error While Exporting Scene");
            console.log(error);
        }
    }

}