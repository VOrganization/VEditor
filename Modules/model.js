
let modelLoaders = [
    {
        ext: ".bvh",
        loader: THREE.BVHLoader
    },
    {
        ext: ".dae",
        loader: THREE.ColladaLoader
    },
    {
        ext: ".fbx",
        loader: THREE.FBXLoader
    },
    {
        ext: ".gltf",
        loader: THREE.GLTFLoader
    },
    {
        ext: ".obj",
        loader: THREE.OBJLoader
    },
    {
        ext: ".ply",
        loader: THREE.PLYLoader
    },
    {
        ext: ".stl",
        loader: THREE.STLLoader
    },
];

function LoadModel(p, fun){
    const path = require("path");

    let calc_mat = function(obj){
        if(obj.type == "Mesh"){
            obj.material = editor.project.materials[0];
        }
        for (let i = 0; i < obj.children.length; i++) {
            calc_mat(obj.children[i]);
        }
    }

    let f = null;
    if(editor.project !== null){
        for (let i = 0; i < editor.project.files.length; i++) {
            if(editor.project.files[i].path == path.relative(editor.dirname, p)){
                f = editor.project.files[i];
                if(f.data !== null && f.data !== undefined){
                    calc_mat(f.data);
                    fun(f.data);
                    return;
                }
                break;
            }
        }
    }

    let calc_geo = function(obj){
        if(obj.geometry !== undefined){
            obj.geometry.name = obj.name;
            let g = new THREE.Geometry().fromBufferGeometry(obj.geometry);
            obj.geometry["EID"] = require("crypto").createHash("md5").update(String(obj.name) + String(g.faces.length)).digest("hex");
            if(editor.project !== null){
                editor.project.meshes.push(obj.geometry);
            }
        }
        for (let i = 0; i < obj.children.length; i++) {
            calc_geo(obj.children[i]);
        }
    }

    let e = path.extname(p).toLocaleLowerCase();
    if(e == ".dae"){
        //musze napisac dla dae
        fun(null);
        return;
    }
    for (let i = 0; i < modelLoaders.length; i++) {
        if(modelLoaders[i].ext == e){
            let l = new modelLoaders[i].loader(new THREE.LoadingManager());
            l.load(
                p,
                function(object){
                    object.name = path.basename(p, path.extname(p));
                    calc_geo(object);
                    if(f !== null){
                        f.data = object;
                    }
                    if(editor.project !== null){
                        editor.project.models.push(object);
                    }
                    fun(object);
                },
                function(){

                },
                function(){
                    fun(null);
                }
            );
            break;
        }
    }
}

function loadFile(f){
    switch (f.type) {

        case "model":{
            LoadModel(path.join(editor.dirname, f.path), function(d){
                f.data = d;
            });
            break;
        }
    
        case "image":{
            f.data = new THREE.TextureLoader().load(path.join(editor.dirname, f.path));
            f.data.name = f.name;
            editor.project.textures.push(f.data);
            break;
        }

        default:{
            break;
        }
    }
}