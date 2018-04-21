const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const dialog = remote.dialog;
const Menu = remote.Menu;
const Tray = remote.Tray;
const Window = remote.getCurrentWindow();
const WebContext = remote.getCurrentWebContents();

const fs = require("fs");
const bin = require("./lib/File");
const path = require("path");
const crypto = require("crypto");
const WatchJS = require("watchjs");

const version = "0.0.0";

let myLayout;

const module_path = "modules/";
const default_layout = JSON.parse(fs.readFileSync("default_layout.json"));

let editor_data = { file: null, dir: null, data: null };
let editor_data_object = new Array();
let editor_data_select = { type: null, data: null };
let editor_data_change_is_save = true;
let editor_call_back = new Array();
let editor_select_call_back = new Array();
let editor_data_id_loaded = false;

function load_file(f){
    switch (f.type) {
        case "image":{
            let found = false;
            for (let i = 0; i < editor_data.data.textures.length; i++) {
                if(editor_data.data.textures[i].path == f.path){
                    found = true;
                    break;
                }
            }
            if(!found){
                let tex = new THREE.TextureLoader().load(editor_data.dir + "/" + f.path);
                tex.name = path.basename(f.path);
                editor_data.data.textures.push({
                    path: f.path,
                    tex: tex
                });
            }
            break;
        }
    
        case "shader":{
            let found = false;
            for (let i = 0; i < editor_data.data.shaders.length; i++) {
                if(editor_data.data.shaders[i].path == f.path){
                    found = true;
                    break;
                }
            }
            if(!found){
                let shader = {
                    name: path.basename(f.path),
                    path: f.path,
                    uniforms: new Array(),
                    buffers: new Array(),
                };
                editor_data.data.shaders.push(shader);
            }
            break;
        }

        default:
            break;
    }
}

function editor_update_data(){
    for (let i = 0; i < editor_call_back.length; i++) {
        editor_call_back[i]();
    }
    // for (let i = 0; i < editor_select_call_back.length; i++) {
    //     editor_select_call_back[i]();
    // }
}

function default_data(){
    return {
        files: [],
        object: [],
        geometry: [],
        models: [],
        shaders: [],
        renderer: [],
        material: [],
        textures: [],
        scripts: []
    };
}

function load_data(p, fun){
    editor_data.dir = path.dirname(String(p));
    editor_data.file = p;
    try {
        editor_data.data = JSON.parse(fs.readFileSync(editor_data.file));    
    } catch (e) {
        editor_data.data = fs.writeFileSync(p, JSON.stringify(default_data()));
        editor_data.data = default_data();
    }
    
    editor_data_id_loaded = false;

    let success_load = function(){
        console.log("Success Load Data");
        editor_data_id_loaded = true;
        for (let i = 0; i < editor_call_back.length; i++) {
            editor_call_back[i]();
        }
        for (let i = 0; i < editor_select_call_back.length; i++) {
            editor_select_call_back[i]();
        }
        if(fun !== undefined){
            fun();
        }
    }

    let find_path_map = function(map){
        for (let i = 0; i < editor_data.data.textures.length; i++) {
            if(editor_data.data.textures[i].path == map){
                return editor_data.data.textures[i].tex;
            }
        }
        return null;
    }

    let fun_load_object = function(){
        let objects = editor_data.data.object;
        editor_data.data.object = new Array();
        let calc_object = function(_obj){
            let o = new THREE.Object3D();

            switch(_obj.type) {
                case "Group":{
                    o = new THREE.Group();
                    break;
                }
            
                case "Mesh":{
                    let mat = null;
                    let geo = null;
                    for (let i = 0; i < editor_data.data.material.length; i++) {
                        if(editor_data.data.material[i].uuid == _obj.material){
                            mat = editor_data.data.material[i];
                            break;
                        }
                    }
                    for (let i = 0; i < editor_data.data.geometry.length; i++) {
                        let md5 = crypto.createHash("md5").update(
                            JSON.stringify(editor_data.data.geometry[i].attributes.normal.array)+
                            JSON.stringify(editor_data.data.geometry[i].attributes.position.array)+
                            JSON.stringify(editor_data.data.geometry[i].attributes.uv.array)
                        ).digest("hex");
                        if(md5 == _obj.geometry){
                            geo = editor_data.data.geometry[i];
                            break;
                        }
                    }
                    o = new THREE.Mesh(geo, mat);
                    o.castShadow = true;
                    o.receiveShadow = true;
                    break;
                }

                case "PointLight":{
                    o = new THREE.PointLight();
                    o.color = new THREE.Color(_obj.color);
                    o["ambient"] = new THREE.Color(_obj.ambient);
                    o["specular"] = new THREE.Color(_obj.specular);
                    o.decay = _obj.decay;
                    o.distance = _obj.distance;
                    o.intensity = _obj.intensity;
                    o.castShadow = _obj.castShadow;
                    o.shadow.camera.near = _obj.shadow.near;
                    o.shadow.camera.far = _obj.shadow.far;
                    o.shadow["quality"] = _obj.shadow.quality;
                    break;
                }

                case "DirectionalLight":{
                    o = new THREE.DirectionalLight();
                    o.color = new THREE.Color(_obj.color);
                    o["ambient"] = new THREE.Color(_obj.ambient);
                    o["specular"] = new THREE.Color(_obj.specular);
                    o.intensity = _obj.intensity;
                    o.castShadow = _obj.castShadow;
                    o.shadow.camera.near = _obj.shadow.near;
                    o.shadow.camera.far = _obj.shadow.far;
                    o.shadow["quality"] = _obj.shadow.quality;
                    break;
                }

                case "SpotLight":{
                    o = new THREE.SpotLight();
                    o.color = new THREE.Color(_obj.color);
                    o["ambient"] = new THREE.Color(_obj.ambient);
                    o["specular"] = new THREE.Color(_obj.specular);
                    o.decay = _obj.decay;
                    o.distance = _obj.distance;
                    o.intensity = _obj.intensity;
                    o.angle = _obj.angle;
                    o.penumbra = _obj.penumbra;
                    o.castShadow = _obj.castShadow;
                    o.shadow.camera.near = _obj.shadow.near;
                    o.shadow.camera.far = _obj.shadow.far;
                    o.shadow["quality"] = _obj.shadow.quality;
                    break;
                }

                case "PerspectiveCamera":{
                    o = new THREE.PerspectiveCamera(_obj.fov, 1, _obj.near, _obj.far);
                    break;
                }

                default:
                    break;
            }

            o.name = _obj.name;
            o.position.x = _obj.position.x;
            o.position.y = _obj.position.y;
            o.position.z = _obj.position.z;

            o.rotation.x = _obj.rotation._x;
            o.rotation.y = _obj.rotation._y;
            o.rotation.z = _obj.rotation._z;
            
            o.scale.x = _obj.scale.x;
            o.scale.y = _obj.scale.y;
            o.scale.z = _obj.scale.z;

            o["display_type"] = _obj.display_type;
            o["display_priority"] = _obj.display_priority;

            for (let i = 0; i < _obj.children.length; i++) {
                o.add(calc_object(_obj.children[i]));
                
            }
            return o;
        }
        for (let i = 0; i < objects.length; i++) {
            editor_data.data.object.push(calc_object(objects[i]));
        }
        success_load();
    }

    let fun_load_material = function(){
        let material = editor_data.data.material;
        editor_data.data.material = new Array();
        for (let i = 0; i < material.length; i++) {
            // mat.type = _obj.type;
            let _obj = material[i];
            let mat = new THREE.MeshPhongMaterial({side: THREE.DoubleSide});
            if(_obj.type == "MeshStandardMaterial"){
                mat = new THREE.MeshStandardMaterial({side: THREE.DoubleSide});
            }
            mat.uuid = _obj.uuid;
            mat.name = _obj.name;
            mat.opacity = _obj.opacity;
            mat.color = new THREE.Color(_obj.diffuse);
            mat.map = find_path_map(_obj.diffuseMap);

            if(_obj.type_engine == 1){
                mat.specular = new THREE.Color(_obj.specular);
                mat.specularMap = find_path_map(_obj.specularMap);
                mat.shininess = _obj.shininess;
                mat.reflectivity = _obj.reflection;
            }
            else{
                mat.roughness = _obj.roughness;
                mat.roughnessMap = find_path_map(_obj.roughnessMap);
                mat.metalness = _obj.metalness;
                mat.metalnessMap = find_path_map(_obj.metalnessMap);
            }

            mat.displacementMap = find_path_map(_obj.displacementMap);
            mat.displacementBias = _obj.displacementBias;
            mat.displacementScale = _obj.displacementScale;

            mat.emissive = new THREE.Color(_obj.emission);
            mat.emissiveMap = find_path_map(_obj.emissionMap);
            mat.emissiveIntensity = _obj.emissionIntensity;
            mat.normalMap = find_path_map(_obj.normalMap);
            mat.bumpMap = find_path_map(_obj.bumpMap);
            mat.bumpScale = _obj.bumpScale;
            mat.aoMap = find_path_map(_obj.aoMap);
            mat.aoMapIntensity = _obj.aoMapIntensity;
            mat["auto_generate"] = _obj.auto_generate;
            mat["generate_in_shader"] = _obj.generate_in_shader;
            mat.refractionRatio = _obj.refraction;
            mat["dynamic_cube"] = _obj.dynamic_cube;
            mat["type_engine"] = _obj.type_engine;
            mat["engine_shader"] = _obj.engine_shader;
            mat["engine_shader_other_textures"] = _obj.engine_shader_other_textures;
            mat["engine_shader_other_colors"] = _obj.engine_shader_other_colors;
            mat["engine_shader_other_values"] = _obj.engine_shader_other_values;

            mat.transparent = true;
            mat.needsUpdate = true;
            editor_data.data.material.push(mat);
        }
        fun_load_object();
    }

    let fun_load_files = function(){
        for (let i = 0; i < editor_data.data.files.length; i++) {
            if(!fs.existsSync(editor_data.dir + "/" + editor_data.data.files[i].path)){
                editor_data.data.files[i] = null;
                continue;
            }
            load_file(editor_data.data.files[i]);
        }
        fun_load_material();
    }

    let fun_load_model = function(){
        let models = editor_data.data.models;
        editor_data.data.models = new Array();
        let calc_model = function(_obj){
            if(_obj.geometry !== undefined){
                _obj.geometry.name = _obj.name;
                editor_data.data.geometry.push(_obj.geometry);
            }
            for (let i = 0; i < _obj.children.length; i++) {
                calc_model(_obj.children[i]);
            }
        }
        for (let i = 0; i < models.length; i++) {
            load_model(editor_data.dir + "/" + models[i], function(obj){
                obj.name = path.basename(models[i]);
                editor_data.data.models.push({path: models[i], object: obj});
                calc_model(obj);
            });
        }
        let wait = function(){
            if(models.length == editor_data.data.models.length){
                fun_load_files();
                return;
            }
            setTimeout(wait, 100);
        }
        wait();
    }

    fun_load_model();
}

function save_data(){
    let out_data = default_data();

    out_data.files = editor_data.data.files;

    let calc_object = function(_obj){
        let o = {
            castShadow: _obj.castShadow,
            children: new Array(),

            display_type: _obj.display_type,
            display_priority: _obj.display_priority,

            far: null,
            fov: null,
            near: null,

            color: null,
            ambient: null,
            specular: null,
            decay: null,
            distance: null,
            intensity: null,

            angle: null,
            penumbra: null,
            shadow: new Object(),

            drawMode: null,
            frustumCulled: _obj.frustumCulled,
            geometry: null,
            layers: _obj.layers,
            material: null,
            matrix: _obj.matrix,
            matrixAutoUpdate: _obj.matrixAutoUpdate,
            name: _obj.name, 
            position: _obj.position,
            receiveShadow: _obj.receiveShadow,
            renderOrder: _obj.renderOrder,
            rotation: _obj.rotation,
            scale: _obj.scale,
            type: _obj.type,
            up: _obj.up,
            uuid: _obj.uuid,
            visible: _obj.visible
        };

        if(_obj.geometry !== undefined){
            let found = false;
            for (let i = 0; i < out_data.geometry.length; i++) {
                if(_obj.geometry == out_data.geometry[i]){
                    found = true;
                    break;
                }
            }
            if(!found){
                out_data.geometry.push(_obj.geometry);
            }
            o.geometry = crypto.createHash("md5").update(
                JSON.stringify(_obj.geometry.attributes.normal.array)+
                JSON.stringify(_obj.geometry.attributes.position.array)+
                JSON.stringify(_obj.geometry.attributes.uv.array)
            ).digest("hex");
        }

        if(_obj.material !== undefined){
            let found = false;
            for (let i = 0; i < out_data.material.length; i++) {
                if(_obj.material == out_data.material[i]){
                    found = true;
                    break;
                }
            }
            if(!found){
                out_data.material.push(_obj.material);
            }
            o.material = _obj.material.uuid;
        }

        if(_obj.type == "PerspectiveCamera"){
            o.far = _obj.far;
            o.fov = _obj.fov;
            o.near = _obj.near;
        }

        if(_obj.type == "PointLight"){
            o.color = _obj.color;
            o.ambient = _obj.ambient;
            o.specular = _obj.specular;
            o.decay = _obj.decay;
            o.distance = _obj.distance;
            o.intensity = _obj.intensity;
            o.shadow["near"] = _obj.shadow.camera.near;
            o.shadow["far"] = _obj.shadow.camera.far;
            o.shadow["quality"] = _obj.shadow.quality;
        }

        if(_obj.type == "DirectionalLight"){
            o.color = _obj.color;
            o.ambient = _obj.ambient;
            o.specular = _obj.specular;
            o.intensity = _obj.intensity;
            o.shadow["near"] = _obj.shadow.camera.near;
            o.shadow["far"] = _obj.shadow.camera.far;
            o.shadow["quality"] = _obj.shadow.quality;
        }

        if(_obj.type == "SpotLight"){
            o.color = _obj.color;
            o.ambient = _obj.ambient;
            o.specular = _obj.specular;
            o.decay = _obj.decay;
            o.distance = _obj.distance;
            o.intensity = _obj.intensity;
            o.angle = _obj.angle;
            o.penumbra = _obj.penumbra;
            o.shadow["near"] = _obj.shadow.camera.near;
            o.shadow["far"] = _obj.shadow.camera.far;
            o.shadow["quality"] = _obj.shadow.quality;
        }

        for (let i = 0; i < _obj.children.length; i++) {
            o.children.push(calc_object(_obj.children[i]));
        }

        return o;
    };
    for (let i = 0; i < editor_data.data.object.length; i++) {
        out_data.object.push(calc_object(editor_data.data.object[i]));
    }

    
    let calc_model = function(_obj){
        if(_obj.geometry !== undefined){
            for (let i = 0; i < out_data.geometry.length; i++) {
                if(_obj.geometry == out_data.geometry[i]){
                    out_data.geometry.splice(i, 1);
                    break;
                }
            }
        }
        for (let i = 0; i < _obj.children.length; i++) {
            calc_model(_obj.children[i]);
        }
    }
    for (let i = 0; i < editor_data.data.models.length; i++) {
        calc_model(editor_data.data.models[i].object);
        out_data.models.push(editor_data.data.models[i].path);
    }

    let find_path_map = function(map){
        for (let i = 0; i < editor_data.data.textures.length; i++) {
            if(editor_data.data.textures[i].tex == map){
                return editor_data.data.textures[i].path;
            }
        }
        return null;
    }

    out_data.shaders = editor_data.data.shaders;

    let material = new Array();
    for (let i = 0; i < out_data.material.length; i++) {
        let _obj = out_data.material[i];
        let mat = {
            uuid: _obj.uuid,
            type: _obj.type,
            type_engine: _obj.type_engine,
            name: _obj.name,
            engine_shader: _obj.engine_shader,
            engine_shader_other_textures: _obj.engine_shader_other_textures,
            engine_shader_other_colors: _obj.engine_shader_other_colors,
            engine_shader_other_values: _obj.engine_shader_other_values,
            opacity: _obj.opacity,
            diffuse: _obj.color,
            roughness: _obj.roughness,
            roughnessMap: find_path_map(_obj.roughnessMap),
            metalness: _obj.metalness,
            metalnessMap: find_path_map(_obj.metalnessMap),
            diffuseMap: find_path_map(_obj.map),
            specular: _obj.specular,
            specularMap: find_path_map(_obj.specularMap),
            shininess: _obj.shininess,
            emission: _obj.emissive,
            emissionMap: find_path_map(_obj.emissiveMap),
            emissionIntensity: _obj.emissiveIntensity,
            shader: null,
            auto_generate: null,
            generate_in_shader: null,
            albedoMap: null,
            normalMap: find_path_map(_obj.normalMap),
            bumpMap: find_path_map(_obj.bumpMap),
            bumpScale: _obj.bumpScale,
            displacementMap: find_path_map(_obj.displacementMap),
            displacementBias: _obj.displacementBias,
            displacementScale: _obj.displacementScale,
            metalicMap: null,
            roughnessMap: null,
            aoMap: find_path_map(_obj.aoMap),
            aoMapIntensity: _obj.aoMapIntensity,
            reflection: _obj.reflectivity,
            refraction: _obj.refractionRatio,
            dynamic_cube: _obj.dynamic_cube,
        };
        material.push(mat);
    }
    out_data.material = material;

    console.log("Save");
    fs.writeFileSync(editor_data.file, JSON.stringify(out_data));
    fs.writeFileSync(editor_data.dir + "\\layout.json", JSON.stringify(myLayout.toConfig()));
}

function export_data(p,d){
    console.log("Start exporting");

    let data = new Array();

    //header
    data.push("S");
    data.push(version);
    data.push("S");

    //Pliki
    let f_s = d.files.length;
    for (let i = 0; i < d.files.length; i++) {
        if(String(p).indexOf(d.files[i].name) > -1 || String(d.files[i].name).indexOf("project.json") > -1 || String(d.files[i].name).indexOf("layout.json") > -1){
            f_s -= 1;
        }
    }
    data.push(bin.toBytes(bin.DT.uint32, f_s));
    for (let i = 0; i < d.files.length; i++) {
        if(String(p).indexOf(d.files[i].name) > -1 || String(d.files[i].name).indexOf("project.json") > -1 || String(d.files[i].name).indexOf("layout.json") > -1){
            continue;
        }
        data.push(bin.toBytes(bin.DT.uint32, d.files[i].name.length));
        data.push(d.files[i].name);
        data.push(bin.toBytes(bin.DT.uint32, get_file_type_id(d.files[i].type)));
        data.push(bin.toBytes(bin.DT.uint8, 1));
        data.push(bin.toBytes(bin.DT.uint8, 1));
        let t = fs.readFileSync(editor_data.dir + "/" + d.files[i].path);
        data.push(bin.toBytes(bin.DT.uint32, t.length));
        data.push(t);
        data.push(crypto.createHash("md5").update(t).digest("hex"));
    }

    //modele
    data.push(bin.toBytes(bin.DT.uint32, 0));

    //meshe
    data.push(bin.toBytes(bin.DT.uint32, 0));
    // for (let i = 0; i < d.geometry.length; i++) {
    //     let g = new THREE.Geometry().fromBufferGeometry(d.geometry[i]);
    //     for (let j = 0; j < g.vertices.length; j++) {
    //         data.push(bin.toBytes(bin.DT.float32, [g.vertices[j].x, g.vertices[j].y, g.vertices[j].z]));
    //     }
    //     //console.log(g);
    // }

    //armature
    data.push(bin.toBytes(bin.DT.uint32, 0));

    //animation
    data.push(bin.toBytes(bin.DT.uint32, 0));

    //animationSystem
    data.push(bin.toBytes(bin.DT.uint32, 0));
    
    //shader
    data.push(bin.toBytes(bin.DT.uint32, d.shaders.length));
    let calc_shader = function(s){
        // console.log(s);
        // data.push(bin.toBytes(bin.DT.uint8, Number(0)));

        // data.push(bin.toBytes(bin.DT.uint32, s.name.length));
        // data.push(s.name);

        // let context = fs.readFileSync(editor_data.dir + "/" + s.path);
        // console.log(context)
        // data.push(crypto.createHash("md5").update(context).digest("hex"));
        // data.push(context.length);
        // data.push(context);

        // data.push(bin.toBytes(bin.DT.uint32, 0));
        //data.push(bin.toBytes(bin.DT.uint32, s.uniforms.length));
        // for (let i = 0; i < s.uniforms.length; i++) {
        //     data.push(bin.toBytes(bin.DT.uint32, Number(s.uniforms[i].type)));
        //     data.push(bin.toBytes(bin.DT.uint32, Number(s.uniforms[i].name.length)));
        //     data.push(bin.toBytes(bin.DT.uint32, s.uniforms[i].name));
        //     switch (s.uniforms[i].type) {
        //         case 0:
        //             //float
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data)));
        //             break;
            
        //         case 1:
        //             //bool
        //             data.push(bin.toBytes(bin.DT.uint8, Number(s.uniforms[i].data)));
        //             break;

        //         case 2:
        //             //int
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data)));
        //             break;

        //         case 3:
        //             //uint
        //             data.push(bin.toBytes(bin.DT.uint32, Number(s.uniforms[i].data)));
        //             break;

        //         case 4:
        //             //vec2
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.x)));
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.y)));
        //             break;

        //         case 5:
        //             //ivec2
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.x)));
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.y)));
        //             break;

        //         case 6:
        //             //vec3
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.x)));
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.y)));
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.z)));
        //             break;

        //         case 7:
        //             //ivec3
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.x)));
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.y)));
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.z)));
        //             break;

        //         case 8:
        //             //vec4
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.x)));
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.y)));
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.z)));
        //             data.push(bin.toBytes(bin.DT.float32, Number(s.uniforms[i].data.w)));
        //             break;

        //         case 9:
        //             //ivec4
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.x)));
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.y)));
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.z)));
        //             data.push(bin.toBytes(bin.DT.int32, Number(s.uniforms[i].data.w)));
        //             break;

        //         case 10:
        //             //texture 2d
        //             break;

        //         case 11:
        //             //texture cube
        //             break;

        //         default:{
        //             break;
        //         }
        //     }
        // }

    };
    for (let i = 0; i < d.shaders.length; i++) {
        calc_shader(d.shaders[i]);
    }

    //texture
    data.push(bin.toBytes(bin.DT.uint32, 0));

    //materials
    data.push(bin.toBytes(bin.DT.uint32, d.material.length));
    let calc_material = function(mat){
        data.push(bin.toBytes(bin.DT.uint8, Number(0)));

        let type = 0;
        switch (mat.type) {
            case "MeshPhongMaterial":{
                type = 0;
                break;
            }
            case "MeshStandardMaterial":{
                type = 1;
                break;
            }
        }

        data.push(bin.toBytes(bin.DT.uint32, type));
        data.push(bin.toBytes(bin.DT.uint32, mat.name.length));
        data.push(mat.name);

        data.push(crypto.createHash("md5").update(mat.uuid).digest("hex"));

        data.push(bin.toBytes(bin.DT.float32, Number(mat.opacity)));

        data.push(bin.toBytes(bin.DT.float32, Number(mat.color.r)));
        data.push(bin.toBytes(bin.DT.float32, Number(mat.color.g)));
        data.push(bin.toBytes(bin.DT.float32, Number(mat.color.b)));
        data.push(bin.toBytes(bin.DT.float32, Number(1)));
        if(mat.map !== null){
            data.push("O");
            data.push(bin.toBytes(bin.DT.uint8, 1));
            data.push(crypto.createHash("md5").update(mat.map.name + mat.map.image.width + mat.map.image.height).digest("hex"));
        }
        else{
            data.push("N");
        }

        if(type == 0){
            data.push(bin.toBytes(bin.DT.float32, Number(mat.specular.r)));
            data.push(bin.toBytes(bin.DT.float32, Number(mat.specular.g)));
            data.push(bin.toBytes(bin.DT.float32, Number(mat.specular.b)));
            data.push(bin.toBytes(bin.DT.float32, Number(1)));
            data.push(bin.toBytes(bin.DT.float32, Number(mat.shininess)));
            if(mat.specularMap !== null){
                data.push("O");
                data.push(bin.toBytes(bin.DT.uint8, 1));
                data.push(crypto.createHash("md5").update(mat.specularMap.name + mat.specularMap.image.width + mat.specularMap.image.height).digest("hex"));
            }
            else{
                data.push("N");
            }
        }

        data.push(bin.toBytes(bin.DT.float32, Number(mat.emissive.r)));
        data.push(bin.toBytes(bin.DT.float32, Number(mat.emissive.g)));
        data.push(bin.toBytes(bin.DT.float32, Number(mat.emissive.b)));
        data.push(bin.toBytes(bin.DT.float32, Number(mat.emissiveIntensity)));
        if(mat.emissiveMap !== null){
            data.push("O");
            data.push(bin.toBytes(bin.DT.uint8, 1));
            data.push(crypto.createHash("md5").update(mat.emissiveMap.name + mat.emissiveMap.image.width + mat.emissiveMap.image.height).digest("hex"));
        }
        else{
            data.push("N");
        }

        if(type == 1){
            data.push(bin.toBytes(bin.DT.float32, Number(mat.roughness)));
            if(mat.roughnessMap !== null){
                data.push("O");
                data.push(bin.toBytes(bin.DT.uint8, 1));
                data.push(crypto.createHash("md5").update(mat.roughnessMap.name + mat.roughnessMap.image.width + mat.roughnessMap.image.height).digest("hex"));
            }
            else{
                data.push("N");
            }

            data.push(bin.toBytes(bin.DT.float32, Number(mat.metalness)));
            if(mat.metalnessMap !== null){
                data.push("O");
                data.push(bin.toBytes(bin.DT.uint8, 1));
                data.push(crypto.createHash("md5").update(mat.metalnessMap.name + mat.metalnessMap.image.width + mat.metalnessMap.image.height).digest("hex"));
            }
            else{
                data.push("N");
            }
        }

        if(mat.bumpMap !== null){
            data.push("O");
            data.push(bin.toBytes(bin.DT.uint8, 1));
            data.push(crypto.createHash("md5").update(mat.bumpMap.name + mat.bumpMap.image.width + mat.bumpMap.image.height).digest("hex"));
        }
        else{
            data.push("N");
        }
        data.push(bin.toBytes(bin.DT.float32, Number(mat.bumpScale)));

        if(mat.normalMap !== null){
            data.push("O");
            data.push(bin.toBytes(bin.DT.uint8, 1));
            data.push(crypto.createHash("md5").update(mat.normalMap.name + mat.normalMap.image.width + mat.normalMap.image.height).digest("hex"));
        }
        else{
            data.push("N");
        }

        if(mat.aoMap !== null){
            data.push("O");
            data.push(bin.toBytes(bin.DT.uint8, 1));
            data.push(crypto.createHash("md5").update(mat.aoMap.name + mat.aoMap.image.width + mat.aoMap.image.height).digest("hex"));
        }
        else{
            data.push("N");
        }
        data.push(bin.toBytes(bin.DT.float32, Number(mat.aoMapIntensity)));

        data.push(bin.toBytes(bin.DT.float32, Number(mat.reflectivity)));
        data.push(bin.toBytes(bin.DT.float32, Number(mat.refractionRatio)));
        data.push(bin.toBytes(bin.DT.uint8, Number(mat.dynamic_cube)));

        data.push(bin.toBytes(bin.DT.uint32, 0));
        data.push(bin.toBytes(bin.DT.uint32, 0));
        data.push(bin.toBytes(bin.DT.uint32, 0));
        
        // if(mat.engine_shader !== null){
        //     data.push("O");
        //     data.push(bin.toBytes(bin.DT.uint8, 1));
        //     data.push(crypto.createHash("md5").update(fs.readFileSync(editor_data.dir + "/" + mat.engine_shader.path)).digest("hex"));
        // }
        // else{
        //     data.push("N");
        // }

    }
    for (let i = 0; i < d.material.length; i++) {
        calc_material(d.material[i]);
    }

    //renderer
    data.push(bin.toBytes(bin.DT.uint32, 0));

    //script
    data.push(bin.toBytes(bin.DT.uint32, 0));

    //obiekty
    data.push(bin.toBytes(bin.DT.uint32, d.object.length));
    let calc_object = function(obj){
        let type = 0;
        switch(obj.type){
            case "Mesh":{
                type = 1;
                break;
            }
            case "PointLight":{
                type = 2;
                break;
            }
            case "SpotLight":{
                type = 3;
                break;
            }
            case "DirectionalLight":{
                type = 4;
                break;
            }
            case "PerspectiveCamera":{
                type = 5;
                break;
            }
        }
        data.push(bin.toBytes(bin.DT.uint32, type));

        //name
        data.push(bin.toBytes(bin.DT.uint32, obj.name.length));
        data.push(obj.name);

        //display
        data.push(bin.toBytes(bin.DT.uint32, Number(obj.display_type)));
        data.push(bin.toBytes(bin.DT.uint32, Number(obj.display_priority)));

        //transform
        data.push(bin.toBytes(bin.DT.float32, Number(obj.position.x)));
        data.push(bin.toBytes(bin.DT.float32, Number(obj.position.y)));
        data.push(bin.toBytes(bin.DT.float32, Number(obj.position.z)));
        data.push(bin.toBytes(bin.DT.float32, Number((obj.rotation.x * 180.0) / Math.PI)));
        data.push(bin.toBytes(bin.DT.float32, Number((obj.rotation.y * 180.0) / Math.PI)));
        data.push(bin.toBytes(bin.DT.float32, Number((obj.rotation.z * 180.0) / Math.PI)));
        data.push(bin.toBytes(bin.DT.float32, Number(obj.scale.x)));
        data.push(bin.toBytes(bin.DT.float32, Number(obj.scale.y)));
        data.push(bin.toBytes(bin.DT.float32, Number(obj.scale.z)));

        //dodatkowe dane
        switch(type){
            case 1:{
                //armature
                data.push("N");
                
                //mesh
                data.push("O");
                let g = new THREE.Geometry().fromBufferGeometry(obj.geometry);
                //console.log(String(obj.geometry.name) + String(g.faces.length));
                //console.log(crypto.createHash("md5").update(String(obj.geometry.name) + String(g.faces.length)).digest("hex"));
                data.push(bin.toBytes(bin.DT.uint8, 1));
                data.push(crypto.createHash("md5").update(String(obj.geometry.name) + String(g.faces.length)).digest("hex"));

                //material
                if(obj.material !== null){
                    data.push("O");
                    data.push(bin.toBytes(bin.DT.uint8, 1));
                    data.push(crypto.createHash("md5").update(obj.material.uuid).digest("hex"));
                }
                else{
                    data.push("N");
                }
                break;
            }

            case 2:{
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.b)));

                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.b)));

                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.b)));

                let kl = 0;
                let kq = 0;
                while (true) {
                    let tmp = (1.0 / (obj.decay + kl * obj.distance + kq * Math.pow(obj.distance, 2)))*obj.intensity;
                    kl += 0.001;
                    kq += 0.0001;
                    if(tmp < 0.001){
                        break;
                    }
                }

                data.push(bin.toBytes(bin.DT.float32, Number(obj.decay)));
                data.push(bin.toBytes(bin.DT.float32, Number(kl)));
                data.push(bin.toBytes(bin.DT.float32, Number(kq)));
                break;
            }

            case 3:{
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.b)));

                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.b)));

                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.b)));

                if(obj.distance == 0){
                    obj.distance = 1;
                }

                let kl = 0.0;
                let kq = 0.0;
                while (true) {
                    let tmp = (1.0 / (1.0 + kl * obj.distance + kq * Math.pow(obj.distance, 2)))*obj.intensity;
                    kl += 0.001;
                    kq += 0.0001;
                    if(tmp < 0.001){
                        break;
                    }
                }

                data.push(bin.toBytes(bin.DT.float32, Number(1)));
                data.push(bin.toBytes(bin.DT.float32, Number(kl)));
                data.push(bin.toBytes(bin.DT.float32, Number(kq)));

                data.push(bin.toBytes(bin.DT.float32, Number(obj.angle)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.penumbra)));
                break;
            }

            case 4:{
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.ambient.b)));

                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.color.b)));

                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.r)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.g)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.specular.b)));
                break;
            }
            
            case 5:{
                data.push(bin.toBytes(bin.DT.uint8, Number(1)));
                data.push(bin.toBytes(bin.DT.uint8, Number(0)));
                data.push(bin.toBytes(bin.DT.uint8, Number(1)));

                data.push(bin.toBytes(bin.DT.float32, Number(0)));
                data.push(bin.toBytes(bin.DT.float32, Number(0)));
                data.push(bin.toBytes(bin.DT.float32, Number(0)));

                data.push(bin.toBytes(bin.DT.float32, Number(0)));
                data.push(bin.toBytes(bin.DT.float32, Number(1)));
                data.push(bin.toBytes(bin.DT.float32, Number(0)));

                data.push(bin.toBytes(bin.DT.float32, Number(obj.fov)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.far)));
                data.push(bin.toBytes(bin.DT.float32, Number(obj.near)));
                break;
            }

            default:{
                break;
            }
        }

        data.push(bin.toBytes(bin.DT.uint32, obj.children.length));
        for (let i = 0; i < obj.children.length; i++) {
            calc_object(obj.children[i]);
        }
    }
    for (let i = 0; i < d.object.length; i++) {
        calc_object(d.object[i]);
    }



    let out = new Uint8Array();
    for (let i = 0; i < data.length; i++) {
        let t = new Uint8Array(data[i].length);
        for (let j = 0; j < data[i].length; j++) {
            if(typeof data[i] == "string"){
                t[j] = String(data[i][j]).charCodeAt();
            }
            else{
                t[j] = data[i][j];
            }
        }
        let tmp = new Uint8Array(data[i].length + out.length);
        tmp.set(out);
        tmp.set(t, out.length);
        out = tmp;
    }

    fs.writeFileSync(p, out);

    console.log("Stop Export");
}

function run_engine(){

}

let menu_context = [
    {
        label: "File",
        submenu: [
            {
                label: "Open Project",
                click(){
                    dialog.showOpenDialog(
                        { 
                            properties: [ "openFile" ],
                            filters: [
                                {
                                    name: "Project",
                                    extensions: [ "json" ]
                                }
                            ]
                        },
                        function (files) {
                            load_data(files[0], function(){ });
                        }
                    );
                }
            },
            {
                label: "Open File"
            },
            {
                type: "separator"
            },
            {
                label: "New Project"
            },
            {
                label: "New File"
            },
            {
                type: "separator"
            },
            {
                label: "Import"
            },
            {
                label: "Export",
                click(){
                    dialog.showOpenDialog(
                        { 
                            properties: [ "openFile" ],
                            filters: [
                                {
                                    name: "Scene",
                                    extensions: [ "scene" ]
                                }
                            ]
                        },
                        function (files) {
                            export_data(files[0], editor_data.data);
                        }
                    );
                }
            },
            {
                type: "separator"
            },
            {
                label: "Save",
                accelerator: 'Ctrl+S',
                click(){ save_data(); }
            },
            
        ]
    },
    {
        label: "Edit",
        submenu: [
            {
                label: ""
            }
        ]
    },
    {
        label: "Object",
        submenu: [
            {
                label: "Light Point",
                click(){
                    let l = new THREE.PointLight( 0xFFFFFF, 1, 100 );
                    l.name = "Light Point";
                    l["ambient"] = new THREE.Color(0x222222);
                    l["specular"] = new THREE.Color(0xffffff);
                    editor_data.data.object.push(l);
                    editor_update_data();
                }
            },
            {
                label: "Light Spot",
                click(){
                    let l = new THREE.SpotLight( 0xffffff );
                    l.name = "Light Spot";
                    l["ambient"] = new THREE.Color(0x222222);
                    l["specular"] = new THREE.Color(0xffffff);
                    l.distance = 100;
                    editor_data.data.object.push(l);
                    editor_update_data();
                }
            },
            {
                label: "Light Dir",
                click(){
                    let l = new THREE.DirectionalLight(0xFFFFFF);
                    l.name = "Light Dir";
                    l["ambient"] = new THREE.Color(0x222222);
                    l["specular"] = new THREE.Color(0xffffff);
                    editor_data.data.object.push(l);
                    editor_update_data();
                }
            },
            {
                type: "separator"
            },
            {
                label: "Camera",
                click(){
                    let cam = new THREE.PerspectiveCamera( 45, 1, 1, 1000 );
                    cam.name = 'Camera';
                    editor_data.data.object.push(cam);
                    editor_update_data();
                }
            },
        ]
    },
    {
        label: "View",
        submenu: [
            {
                label: "Dev Console",
                accelerator: "Ctrl+Shift+I",
                click(){
                    WebContext.toggleDevTools();
                }
            },
            {
                type: "separator"
            }
        ]
    },
    {
        label: "Run",
        submenu: [
            {
                label: "Run",
                accelerator: "F5",
                click(){

                }
            },
            {
                label: "Restart",
                accelerator: "Ctrl+Shift+F5",
                click(){
                    
                }
            },
            {
                label: "Stop",
                accelerator: "Shift+F5",
                click(){
                    
                }
            },
            {
                label: "Console",
                accelerator: "Ctrl+F5",
                click(){
                    
                }
            }
        ]
    }
];

$(document).ready(function(){
    let comp = fs.readdirSync(module_path);
    let sm = 3;
    for (let i = 0; i < comp.length; i++) {
        let n = comp[i];
        n = n.replace(".html", "");
        menu_context[sm].submenu.push({
            label: n.replace("_", " "),
            click(){
                myLayout.root.contentItems[0].addChild({
                    type: "component",
                    componentName: "testComponent",
                    title: n.replace("_", " "),
                    componentState: {
                        label: n
                    },
                    isClosable: true,
                    reorderEnabled: true
                });
            }
        });
    }

    editor_data.data = default_data();
    editor_data.dir = "";
    
    remote.getCurrentWindow().setMenu(remote.Menu.buildFromTemplate(menu_context));
    
    WatchJS.watch(editor_data, ["file","data"], function(){
        if(editor_data_id_loaded){
            editor_data_change_is_save = false;
            for (let i = 0; i < editor_call_back.length; i++) {
                editor_call_back[i]();
            }
        }
    });

    WatchJS.watch(editor_data_select, ["type","data"], function(){
        if(editor_data_id_loaded){
            for (let i = 0; i < editor_select_call_back.length; i++) {
                editor_select_call_back[i]();
            }
        }
    });

    myLayout = new GoldenLayout(default_layout);
    myLayout.registerComponent("testComponent", function(container, componentState){
        try {
            container.getElement().html(fs.readFileSync(module_path + componentState.label + ".html").toString());
        } catch (err) {
            container.getElement().html("<h2>Not found</h2>");
        }
    });
    myLayout.init();
});
