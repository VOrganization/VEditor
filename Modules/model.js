
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
    let e = require("path").extname(p).toLocaleLowerCase();
    for (let i = 0; i < modelLoaders.length; i++) {
        if(modelLoaders[i].ext == e){
            let l = new modelLoaders[i].loader(new THREE.LoadingManager());
            l.load(
                p,
                function(object){
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

// Testing
// LoadModel("C:\\Users\\wiktortr\\Desktop\\tmp_nngp\\mountains.fbx", function(d){
//     console.log(d);
// });