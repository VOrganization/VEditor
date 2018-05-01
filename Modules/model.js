
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
    let e = path.extname(p).toLocaleLowerCase();
    for (let i = 0; i < modelLoaders.length; i++) {
        if(modelLoaders[i].ext == e){
            let l = new modelLoaders[i].loader(new THREE.LoadingManager());
            l.load(
                p,
                function(object){
                    object.name = path.basename(p, path.extname(p));
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

function LoadModelSync(p){
    const path = require("path");
    let SN = require("sync-node");
    let pn = SN.createQueue();

    let e = path.extname(p).toLocaleLowerCase();
    let data = undefined;

    pn.pushJob(function(){
        for (let i = 0; i < modelLoaders.length; i++) {
            if(modelLoaders[i].ext == e){
                let l = new modelLoaders[i].loader(new THREE.LoadingManager());
                l.load(
                    p,
                    function(object){
                        object.name = path.basename(p, path.extname(p));
                        data = object;
                    },
                    function(){
    
                    },
                    function(){
                        data = null;
                    }
                );
                break;
            }
        }
    });

    return data;
}

// LoadModel("C:\\Users\\wiktortr\\Desktop\\tmp_nngp\\cube.obj", function(d){
//     console.log(d);
// });

// LoadModel("C:\\Users\\wiktortr\\Desktop\\tmp_nngp\\untitled.fbx", function(d){
//     console.log(d);
// });