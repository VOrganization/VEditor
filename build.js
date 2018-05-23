const packager = require("electron-packager");
const fs = require("fs");
const path = require("path");

let options = {
    dir: ".",
    out: "builds",
    name: "VEditor",
    platform: "win32",
    arch: "x64",
    all: false,
    asar: false,
    prune: true,
    overwrite: true,
    icon: "./ResourcesStatic/icons/iconRound",
    ignore: [
        ".vscode",
        ".git",
        ".gitattributes",
        ".gitignore",
        "README.md",
        "LICENSE",
        "builds",
        "Modules",
        "Plugins",
        "ResourcesDynamic",
        "default_layout.json",
        "build.js",
        "package-lock.json",
        "node_modules/.bin",
        "node_modules/electron",
        "node_modules/electron-packager",
    ]
};

if(process.argv[2] == "all"){
    options.all = true;
}
else{
    options.platform = process.platform;
    options.arch = process.arch;
}

if(options.platform == "win32"){
    options.icon += ".ico";
}
else{
    options.icon += ".png";
}

console.log(options.icon);

packager(options).then(appPaths => {
    let toCopy = [
        "Modules",
        "Plugins",
        "ResourcesDynamic",
        "default_layout.json",
    ];

    let copy = function(from, to){
        if(fs.lstatSync(from).isDirectory()){
            fs.mkdirSync(path.join(to, path.basename(from)));
            let files = fs.readdirSync(from);
            for (let i = 0; i < files.length; i++) {
                copy(path.join(from, files[i]), path.join(to, path.basename(from)));
            }
        }
        else{
            fs.copyFileSync(from, path.join(to, path.basename(from)));
        }
    }

    for (let i = 0; i < appPaths.length; i++) {
        let p = appPaths[i];
        for (let j = 0; j < toCopy.length; j++) {
            copy(path.join(__dirname, toCopy[j]), p);
        }
    }

    console.log("Finish");
});