const path = require("path");
const watchjs = require("watchjs");

module.exports = class{

    constructor(){
        this.type = "display";
        this.name = "object_settings";
        this.containerName = "context_settings";
        this.html = "object_settings2.html";

        this.saveCallback = null;
        this.loadCallback = null;
        this.createCallback = null;
        this.exportCallback = null;
        this.importCallback = null;
        this.exitCallback = null;
        this.selectCallback = this.update;
        
        this.container = null;
        
        this.selectObject = { position: null, rotation: null, scale: null };

        this.materialRenderer = null;
        this.materialScene = null;
        this.materialObject = null;

    }

    destroy() {
        
    }

    findObject(uuid, obj){
        if(obj.uuid == uuid){
            return obj;
        }
        for (let i = 0; i < obj.children.length; i++) {
            let o = this.findObject(uuid, obj.children[i]);
            if(o !== null){
                return o;
            }
        }
        return null;
    }

    update(editor){
        this.container.children(".context_settings_div").hide();

        if(editor.selected.type == "file"){
            let f = null;
            for (let i = 0; i < editor.project.files.length; i++) {
                if(editor.project.files[i].path == path.relative(editor.dirname, editor.selected.filename)){
                   f = editor.project.files[i];
                   break;
                }
            }
            if(f == null){
                $(this.container).children(".context_settings_header").children(".context_settings_header_icon").children("img").attr("src", "");
                $(this.container).children(".context_settings_header").children(".context_settings_header_data").children(".context_settings_header_name").html("Not selected object");    
                console.log("Error File dosen't exist");
                console.log(editor.selected.filename);
                return;
            }

            $(this.container).children(".context_settings_header").children(".context_settings_header_icon").children("img").attr("src", "ResourcesStatic/img/" + f.type + ".png");
            $(this.container).children(".context_settings_header").children(".context_settings_header_data").children(".context_settings_header_name").html(f.name);

            switch (f.type) {
                case "model":{
                    $(this.container).children(".model_settings").show();
                    $(this.container).children(".model_settings").children(".model_optimize_mesh").val(0);
                    $(this.container).children(".model_settings").children(".model_auto_uv").val(0);
                    $(this.container).children(".model_settings").children(".model_auto_normal").val(0);
                    $(this.container).children(".model_settings").children(".model_smooth_normal").val(0);
                    $(this.container).children(".model_settings").children(".model_inport_material").val(0);
                    break;
                }
            
                default:
                    break;
            }

        }
        else if(editor.selected.type == "object"){
            this.selectObject = this.findObject(editor.selected.uuid, editor.project.scene.data);
            if(this.selectObject === null){
                return;
            }

            let obj = this.selectObject;

            this.container.children(".context_settings_header").children(".context_settings_header_icon").children("img").attr("src", "ResourcesStatic/img/" + obj.type + ".png");
            this.container.children(".context_settings_header").children(".context_settings_header_data").children(".context_settings_header_name").html(obj.name);

            this.setTransform(editor);
            
            //display type and priority

            if(String(obj.type).indexOf("Light") > -1){
                this.setLight();
            }

            if(obj.type == "Mesh"){
                this.setMaterial(editor);
            }

        }
        else{
            $(this.container).children(".context_settings_header").children(".context_settings_header_icon").children("img").attr("src", "");
            $(this.container).children(".context_settings_header").children(".context_settings_header_data").children(".context_settings_header_name").html("Not selected object");
        }
    }

    initModel(editor){
        $(this.container).children(".model_settings").children(".model_add_to_scene").click(function(){
            if(editor.selected.type == "file"){
                LoadModel(editor.selected.filename, function(d){
                    if(d !== null){
                        editor.project.scene.data.add(d);
                        CallFunctionFromModules("changeDataCallback");
                    }
                    else{
                        console.log("Error while loading model");
                        console.log(editor.selected.filename);
                    }
                });
            }
        });
    }

    initTransform(editor){
        let t = this;

        t.container.children(".transform_settings").children(".transform_pos_x").change(function(){
            if(t.selectObject !== null){
                t.selectObject.position.x = Number($(this).val());
            }
        });
        t.container.children(".transform_settings").children(".transform_pos_y").change(function(){
            if(t.selectObject !== null){
                t.selectObject.position.y = Number($(this).val());
            }
        });
        t.container.children(".transform_settings").children(".transform_pos_z").change(function(){
            if(t.selectObject !== null){
                t.selectObject.position.z = Number($(this).val());
            }
        });


        t.container.children(".transform_settings").children(".transform_rot_x").change(function(){
            if(t.selectObject !== null){
                t.selectObject.rotation.x = Number(($(this).val() * 3.14) / 180);
            }
        });
        t.container.children(".transform_settings").children(".transform_rot_y").change(function(){
            if(t.selectObject !== null){
                t.selectObject.rotation.y = Number(($(this).val() * 3.14) / 180);
            }
        });
        t.container.children(".transform_settings").children(".transform_rot_z").change(function(){
            if(t.selectObject !== null){
                t.selectObject.rotation.z = Number(($(this).val() * 3.14) / 180);
            }
        });


        t.container.children(".transform_settings").children(".transform_sca_x").change(function(){
            if(t.selectObject !== null){
                t.selectObject.scale.x = Number($(this).val());
            }
        });
        t.container.children(".transform_settings").children(".transform_sca_y").change(function(){
            if(t.selectObject !== null){
                t.selectObject.scale.y = Number($(this).val());
            }
        });
        t.container.children(".transform_settings").children(".transform_sca_z").change(function(){
            if(t.selectObject !== null){
                t.selectObject.scale.z = Number($(this).val());
            }
        });
    }

    setTransform(editor){
        let t = this;
        let obj = this.selectObject;

        this.container.children(".transform_settings").show();
        this.container.children(".transform_settings").children(".transform_pos_x").val(Number(obj.position.x).toFixed(3));
        this.container.children(".transform_settings").children(".transform_pos_y").val(Number(obj.position.y).toFixed(3));
        this.container.children(".transform_settings").children(".transform_pos_z").val(Number(obj.position.z).toFixed(3));
        this.container.children(".transform_settings").children(".transform_rot_x").val(((obj.rotation.x * 180) / 3.14).toFixed(3));
        this.container.children(".transform_settings").children(".transform_rot_y").val(((obj.rotation.y * 180) / 3.14).toFixed(3));
        this.container.children(".transform_settings").children(".transform_rot_z").val(((obj.rotation.z * 180) / 3.14).toFixed(3));
        this.container.children(".transform_settings").children(".transform_sca_x").val(obj.scale.x.toFixed(3));
        this.container.children(".transform_settings").children(".transform_sca_y").val(obj.scale.y.toFixed(3));
        this.container.children(".transform_settings").children(".transform_sca_z").val(obj.scale.z.toFixed(3));

        watchjs.watch(obj, "position", function(){
            t.container.children(".transform_settings").children(".transform_pos_x").val(Number(obj.position.x).toFixed(3));
            t.container.children(".transform_settings").children(".transform_pos_y").val(Number(obj.position.y).toFixed(3));
            t.container.children(".transform_settings").children(".transform_pos_z").val(Number(obj.position.z).toFixed(3));
        });

        watchjs.watch(obj, "rotation", function(){
            t.container.children(".transform_settings").children(".transform_rot_x").val(((obj.rotation.x * 180) / 3.14).toFixed(3));
            t.container.children(".transform_settings").children(".transform_rot_y").val(((obj.rotation.y * 180) / 3.14).toFixed(3));
            t.container.children(".transform_settings").children(".transform_rot_z").val(((obj.rotation.z * 180) / 3.14).toFixed(3));
        });

        watchjs.watch(obj, "scale", function(){
            t.container.children(".transform_settings").children(".transform_sca_x").val(obj.scale.x.toFixed(3));
            t.container.children(".transform_settings").children(".transform_sca_y").val(obj.scale.y.toFixed(3));
            t.container.children(".transform_settings").children(".transform_sca_z").val(obj.scale.z.toFixed(3));
        });
    }

    initLight(editor){
        let t = this;

        t.container.children(".light_settings").children(".light_diffuse").spectrum({
            color: "#f00",
            showButtons: false,
            containerClassName: "pcolor0",
            replacerClassName: "pcolor1 pp",
            move: function(color) {
                if(t.selectObject !== null){
                    t.selectObject.color = new THREE.Color(color.toHexString());
                }
            }
        });

        t.container.children(".light_settings").children(".light_specular").spectrum({
            color: "#f00",
            showButtons: false,
            containerClassName: "pcolor0",
            replacerClassName: "pcolor1 pp",
            move: function(color) {
                if(t.selectObject !== null){
                    t.selectObject.specular = new THREE.Color(color.toHexString());
                }
            }
        });

        t.container.children(".light_settings").children(".light_ambient").spectrum({
            color: "#f00",
            showButtons: false,
            containerClassName: "pcolor0",
            replacerClassName: "pcolor1 pp",
            move: function(color) {
                if(t.selectObject !== null){
                    t.selectObject.ambient = new THREE.Color(color.toHexString());
                }
            }
        });

        t.container.children(".light_settings").children(".light_int").change(function(){
            if(t.selectObject !== null){
                t.selectObject.intensity = Number($(this).val());
            }
        });

        t.container.children(".light_settings").children(".point_light").children(".light_dis").change(function(){
            if(t.selectObject !== null){
                t.selectObject.distance = Number($(this).val());
            }
        });

        t.container.children(".light_settings").children(".spot_light").children(".light_angle").change(function(){
            if(t.selectObject !== null){
                t.selectObject.angle = Number($(this).val());
            }
        });

        t.container.children(".light_settings").children(".spot_light").children(".light_pen").change(function(){
            if(t.selectObject !== null){
                t.selectObject.penumbra = Number($(this).val());
            }
        });

        t.container.children(".light_settings").children(".light_shadow").change(function(){
            if(t.selectObject !== null){
                t.selectObject.castShadow = $(this).prop("checked");
                t.selectObject.shadow.bias = -0.01;
            }
        });

        t.container.children(".light_settings").children(".light_shadow_quality").change(function(){
            if(t.selectObject !== null){
                t.selectObject.shadow.quality = Number($(this).val());
            }
        });

        t.container.children(".light_settings").children(".light_shadow_near").change(function(){
            if(t.selectObject !== null){
                t.selectObject.shadow.camera.near = Number($(this).val());
            }
        });

        t.container.children(".light_settings").children(".light_shadow_far").change(function(){
            if(t.selectObject !== null){
                t.selectObject.shadow.camera.far = Number($(this).val());
            }
        });
    }

    setLight(editor){
        let t = this;
        let obj = this.selectObject;

        t.container.children(".light_settings").show();
        t.container.children(".light_settings").children(".light_diffuse").spectrum("set", obj.color.getHexString());
        t.container.children(".light_settings").children(".light_specular").spectrum("set", obj.specular.getHexString());
        t.container.children(".light_settings").children(".light_ambient").spectrum("set", obj.ambient.getHexString());
        t.container.children(".light_settings").children(".light_int").val(obj.intensity);
        t.container.children(".light_settings").children(".light_shadow").prop("checked", obj.castShadow);
        t.container.children(".light_settings").children(".light_shadow_quality").val(obj.shadow.quality);
        t.container.children(".light_settings").children(".light_shadow_near").val(obj.shadow.camera.near);
        t.container.children(".light_settings").children(".light_shadow_far").val(obj.shadow.camera.far);

        watchjs.watch(obj, "color", function(){
            t.container.children(".light_settings").children(".light_diffuse").spectrum("set", obj.color.getHexString());
        });

        watchjs.watch(obj, "specular", function(){
            t.container.children(".light_settings").children(".light_specular").spectrum("set", obj.specular.getHexString());
        });

        watchjs.watch(obj, "ambient", function(){
            t.container.children(".light_settings").children(".light_ambient").spectrum("set", obj.ambient.getHexString());
        });

        watchjs.watch(obj, "intensity", function(){
            t.container.children(".light_settings").children(".light_int").val(obj.intensity);
        });

        watchjs.watch(obj, "castShadow", function(){
            t.container.children(".light_settings").children(".light_shadow").prop("checked", obj.castShadow);
        });

        watchjs.watch(obj, "shadow", function(){
            t.container.children(".light_settings").children(".light_shadow_quality").val(obj.shadow.quality);
            t.container.children(".light_settings").children(".light_shadow_near").val(obj.shadow.camera.near);
            t.container.children(".light_settings").children(".light_shadow_far").val(obj.shadow.camera.far);
        });

        if(obj.type == "DirectionalLight"){
            t.container.children(".light_settings").children(".point_light").hide();
            t.container.children(".light_settings").children(".spot_light").hide();
        }
        if(obj.type == "SpotLight"){
            t.container.children(".light_settings").children(".point_light").show();
            t.container.children(".light_settings").children(".spot_light").show();
            t.container.children(".light_settings").children(".point_light").children(".light_dis").val(obj.distance);
            t.container.children(".light_settings").children(".spot_light").children(".light_angle").val(obj.angle);
            t.container.children(".light_settings").children(".spot_light").children(".light_pen").val(obj.penumbra);

            watchjs.watch(obj, "distance", function(){
                t.container.children(".light_settings").children(".point_light").children(".light_dis").val(obj.distance);
            });
    
            watchjs.watch(obj, "angle", function(){
                t.container.children(".light_settings").children(".spot_light").children(".light_angle").val(obj.angle);
            });
    
            watchjs.watch(obj, "penumbra", function(){
                t.container.children(".light_settings").children(".spot_light").children(".light_pen").val(obj.penumbra);
            });
        }
        if(obj.type == "PointLight"){
            t.container.children(".light_settings").children(".point_light").show();
            t.container.children(".light_settings").children(".spot_light").hide();
            t.container.children(".light_settings").children(".point_light").children(".light_dis").val(obj.distance);

            watchjs.watch(obj, "distance", function(){
                t.container.children(".light_settings").children(".point_light").children(".light_dis").val(obj.distance);
            });
        }
    }

    initMaterial(editor){
        let t = this;

        this.materialRenderer = new THREE.WebGLRenderer({antialias: true});
        this.materialRenderer.setSize( 200, 200 );
        this.container.children(".material_settings").children(".material_viewer").append(this.materialRenderer.domElement);
        
        this.materialObject = new THREE.Mesh(new THREE.SphereGeometry(2.5, 64, 64), new THREE.MeshPhongMaterial({color: new THREE.Color(0xffffff)}));
        
        let light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.z = 4;

        let camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 10000 );
        camera.position.z = 5.5;

        this.materialScene = new THREE.Scene();
        this.materialScene.add(this.materialObject);
        this.materialScene.add(light);
        this.materialScene.background = new THREE.Color(0x333333);

        let renderFunction = function(){
            requestAnimationFrame(renderFunction);
            t.materialRenderer.render(t.materialScene, camera);
        };
        renderFunction();



    }

    setMaterial(editor){
        let t = this;
        this.container.children(".material_settings").show();

        if(editor.project !== undefined){
            this.container.children(".material_settings").children(".material_name").html("");
            for (let i = 0; i < editor.project.materials.length; i++) {
                let mat = editor.project.materials[i];
                this.container.children(".material_settings").children(".material_name").html(`<option value="` + mat.name + "_" + i + `">` + mat.name + `</option>`);   
            }
        }

    }

    init(editor){
        this.initModel(editor);
        this.initTransform(editor);
        this.initLight(editor);
        this.initMaterial(editor);
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        $(this.container).children(".context_settings_div").hide();
        this.init(editor);
    }
}