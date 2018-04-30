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
        d = BPush(d, BUint32(0));
 
        try {
            fs.writeFileSync(path.join(editor.dirname, editor.project.data.scene.file), d);
        } catch (error) {
            console.log("Error While Exporting Scene");
            console.log(error);
        }
    }

}