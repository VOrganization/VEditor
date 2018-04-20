
const data_type = {"bool":1, "int8":1, "uint8":2, "int16":3, "uint16":4, "int32": 5, "uint32": 6, "float32": 7, "float64": 8};
const data_type_size = [0,1,1,2,2,4,4,4,8];


function sizeof(dt) {
    return data_type_size[dt];
}


class File{
    constructor(path, io){
        this.data = new Uint8Array();
        this.size = 0;
        this.path = path;
        this.pos = 0;
        this.flags = "w+r+";
        this.fs = require("fs");

        if(typeof io === "string"){
            this.flags = io;
        }

        if(typeof path === "string"){
            this.file_exist = this.fs.existsSync(path);
            if(this.file_exist){
                this.data = this.fs.readFileSync(path);
                this.size = this.data.length;
                this.pos = 0;
                this.resize(this.size);
            }
        }
    }

    resize(s){
        let tmp = this.data;
        this.data = new Uint8Array(s);
        for (let i = 0; i < tmp.length; i++) {
            this.data[i] = tmp[i];
        }
        this.size = this.data.length;
    }

    open(){}
    create(){}
    good(){}

    read(s){
        let buf = new Uint8Array(s);
        for (let i = 0; i < buf.length; i++) {
            if(this.pos + i > this.size){
                this.pos += i - 1;
                return buf;
            }
            buf[i] = this.data[this.pos + i];
        }
        this.pos += buf.length;
        return buf;
    }

    write(d,s){
        let size = d.length;
        if(typeof s === "number"){
            size = s;
        }

        this.resize(this.size + size);
        let index = 0;
        for (let i = this.pos; i < this.size; i++) {
            if(index > d.length){
                this.data[i] = 0;
            }
            else{
                this.data[i] = d[index];
            }
            index++;
        }
        this.pos += size;
    }

    close(){
        //if(this.file_exist){
            let file = this.fs.createWriteStream(this.path);
            file.write(this.data);
            file.close();
        //}
        //else{

        //}
    }

    clear(){
        this.data = new Uint8Array();
        this.size = 0;
        this.pos = 0;
    }
};


function create_new_buffer(dt,s) {
    switch (dt) {
        case data_type.int8:
            return new Int8Array(s);
    
        case data_type.uint8:
            return new Uint8Array(s);

        case data_type.int16:
            return new Int16Array(s);

        case data_type.uint16:
            return new Uint16Array(s);

        case data_type.int32:
            return new Int32Array(s);

        case data_type.uint32:
            return new Uint32Array(s);

        case data_type.float32:
            return new Float32Array(s);

        case data_type.float64:
            return new Float64Array(s);

        default:
            return new Uint8Array(s);
    }
}

function to_bytes(dt, d) {
    if(typeof d === "number"){
        let buf = create_new_buffer(dt, 1);
        buf[0] = d;
        return new Uint8Array(buf.buffer);
    }

    if(d instanceof Array){
        let buf = create_new_buffer(dt, d.length);
        for (let i = 0; i < d.length; i++) {
            buf[i] = d[i];
        }
        return new Uint8Array(buf.buffer);
    }
    
    return new Uint8Array(0);
}

function from_bytes(dt, d){
    if(d.length != sizeof(dt)){
        return null;
    }

    if(dt != data_type.float32 && dt != data_type.float64){
        let val = 0;
        for (let i = d.length; i > -1; i--) {
            val += d[i];
            if(i != 0){
                val = val << 8;
            }
        }
        return val;
    }
    else{
        if(dt == data_type.float32){
            let d0 = d[0];
            let d1 = d[1];
            let d2 = d[2];
            let d3 = d[3];

            let sign = (d3 >> 7) & 1;
            d3 = d3 << 1;
            let e = d3 + (d2 >> 7);

            let f = (d0) + (d1 << 8) + (d2 << 16);

            let exp = 0;
            for (let i = 0; i < 8; i++) {
                exp += ((e >> i) & 1) * Math.pow(2,i);
            }

            let fra = 1.0;
            for (let i = 1; i < 24; i++) {
                fra += (((f >> (23 - i)) & 1) * Math.pow(2, i*-1));
            }

            return Math.pow(-1, sign) * Math.pow(2, exp-127) * fra;            
        }
        if(dt == data_type.float64){
            return 0;
        }
    }

    return null;
}

module.exports.DT = data_type;
module.exports.sizeof = sizeof;
module.exports.toBytes = to_bytes;
module.exports.fromBytes = from_bytes;
module.exports.File = File;