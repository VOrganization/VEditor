const path = require("path");
const watchjs = require("watchjs");

module.exports = class{

    constructor(){
        this.type = "display";
        this.name = "object_settings";
        this.containerName = "context_settings";
        this.html = "object_settings.html";

        this.selectCallback = this.update;
        
        this.container = null;
        
        this.selectObject = null;

        this.materialRenderer = null;
        this.materialScene = null;
        this.materialObject = null;

    }

    destroy() { }

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

            if(String(obj.type).indexOf("Camera") > -1){
                this.setCamera(editor);
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
                        let obj = d.clone();
                        editor.project.scene.data.add(obj);
                        CallFunctionFromModules("changeDataCallback");
                        editor.selected = {
                            type: "object",
                            uuid: obj.uuid
                        };
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

        // t.container.children(".light_settings").children(".light_diffuse").spectrum({
        //     color: "#f00",
        //     showButtons: false,
        //     containerClassName: "pcolor0",
        //     replacerClassName: "pcolor1 pp",
        //     move: function(color) {
        //         if(t.selectObject !== null){
        //             t.selectObject.color = new THREE.Color(color.toHexString());
        //         }
        //     }
        // });

        // t.container.children(".light_settings").children(".light_specular").spectrum({
        //     color: "#f00",
        //     showButtons: false,
        //     containerClassName: "pcolor0",
        //     replacerClassName: "pcolor1 pp",
        //     move: function(color) {
        //         if(t.selectObject !== null){
        //             t.selectObject.specular = new THREE.Color(color.toHexString());
        //         }
        //     }
        // });

        // t.container.children(".light_settings").children(".light_ambient").spectrum({
        //     color: "#f00",
        //     showButtons: false,
        //     containerClassName: "pcolor0",
        //     replacerClassName: "pcolor1 pp",
        //     move: function(color) {
        //         if(t.selectObject !== null){
        //             t.selectObject.ambient = new THREE.Color(color.toHexString());
        //         }
        //     }
        // });

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
        // t.container.children(".light_settings").children(".light_diffuse").spectrum("set", obj.color.getHexString());
        // t.container.children(".light_settings").children(".light_specular").spectrum("set", obj.specular.getHexString());
        // t.container.children(".light_settings").children(".light_ambient").spectrum("set", obj.ambient.getHexString());
        t.container.children(".light_settings").children(".light_int").val(obj.intensity);
        t.container.children(".light_settings").children(".light_shadow").prop("checked", obj.castShadow);
        t.container.children(".light_settings").children(".light_shadow_quality").val(obj.shadow.quality);
        t.container.children(".light_settings").children(".light_shadow_near").val(obj.shadow.camera.near);
        t.container.children(".light_settings").children(".light_shadow_far").val(obj.shadow.camera.far);

        // watchjs.watch(obj, "color", function(){
        //     t.container.children(".light_settings").children(".light_diffuse").spectrum("set", obj.color.getHexString());
        // });

        // watchjs.watch(obj, "specular", function(){
        //     t.container.children(".light_settings").children(".light_specular").spectrum("set", obj.specular.getHexString());
        // });

        // watchjs.watch(obj, "ambient", function(){
        //     t.container.children(".light_settings").children(".light_ambient").spectrum("set", obj.ambient.getHexString());
        // });

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
        
        this.materialObject = new THREE.Mesh(new THREE.SphereGeometry(2.5, 128, 128), new THREE.MeshPhongMaterial({color: new THREE.Color(0xffffff)}));
        
        let light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.z = 4;

        let camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 10000 );
        camera.position.z = 4.2;

        this.materialScene = new THREE.Scene();
        this.materialScene.add(this.materialObject);
        this.materialScene.add(light);
        this.materialScene.background = new THREE.Color(0x333333);

        let renderFunction = function(){
            requestAnimationFrame(renderFunction);
            t.materialRenderer.render(t.materialScene, camera);
        };
        renderFunction();


        //Events
        let matC = $(this.container).children(".material_settings");
        let mat = t.materialObject.material;

        //add support for selectedObject
        matC.children(".material_header").children(".material_name").change(function(){
            let id = Number($(this).val());
            t.materialObject.material = editor.project.materials[id];
            mat = t.materialObject.material;
            t.selectObject.material = editor.project.materials[id];
            t.update(editor);
        });

        matC.children(".material_header").children(".material_name").dblclick(function(){
            let id = Number(matC.children(".material_header").children(".material_name").val());
            matC.children(".material_header").children(".material_name").hide();
            matC.children(".material_header").children(".material_change_name").show().focus().val(editor.project.materials[id].name);

            $(document).keypress(function(e){
                if(e.key == "Enter"){
                    editor.project.materials[id].name = matC.children(".material_header").children(".material_change_name").val();
                    matC.children(".material_header").children(".material_name").children('select option[value="' + id + '"]').html(editor.project.materials[id].name);
                    matC.children(".material_header").children(".material_name").show();
                    matC.children(".material_header").children(".material_change_name").hide();
                }
            });

        });

        matC.children(".material_options").children(".material_copy").click(function(){
            let id = Number(matC.children(".material_header").children(".material_name").val());

            let copy = editor.project.materials[id].clone();
            copy.name += " copy";

            editor.project.materials.push(copy);

            matC.children(".material_header").children(".material_name").append(`<option value="` + (id + 1) + `">` + editor.project.materials[id + 1].name + `</option>`);
            matC.children(".material_header").children(".material_name").val(id + 1);

        });

        matC.children(".material_options").children(".material_del").click(function(){
            if(editor.project.materials.length == 1){
                alert("You can't delete default material"); //convert to electron dialog
            }
            else{
                //replace in objects with default
                //remove
            }
        });

        matC.children(".material_options").children(".material_new").click(function(){
            let id = editor.project.materials.length;
            editor.project.materials.push(new THREE.MeshPhongMaterial({side: THREE.DoubleSide}));

            matC.children(".material_header").children(".material_name").append(`<option value="` + id + `"></option>`);

            matC.children(".material_header").children(".material_name").hide();
            matC.children(".material_header").children(".material_change_name").show().focus().val("");

            $(document).keypress(function(e){
                if(e.key == "Enter"){
                    editor.project.materials[id].name = matC.children(".material_header").children(".material_change_name").val();
                    matC.children(".material_header").children(".material_name").children('select option[value="' + id + '"]').html(editor.project.materials[id].name);
                    matC.children(".material_header").children(".material_name").val(id);
                    matC.children(".material_header").children(".material_name").show();
                    matC.children(".material_header").children(".material_change_name").hide();
                }
            });
        });

        //changes in materials

        {
            let updateTexture = function(id, mapName){
                if(id == NaN){
                    t.materialObject.material[mapName] = null;
                    t.materialObject.material.needsUpdate = true;
                    t.selectObject.material[mapName] = null;
                    t.selectObject.material.needsUpdate = true;
                }
                else{
                    if(editor.project.textures[id] !== undefined){
                        t.materialObject.material[mapName] = editor.project.textures[id];
                        t.materialObject.material.needsUpdate = true;
                        t.selectObject.material[mapName] = editor.project.textures[id];
                        t.selectObject.material.needsUpdate = true;
                    }
                    else{
                        t.materialObject.material[mapName] = null;
                        t.materialObject.material.needsUpdate = true;
                        t.selectObject.material[mapName] = null;
                        t.selectObject.material.needsUpdate = true;
                    }
                }
            };

            let updateData = function(data, name){
                t.selectObject.material[name] = data;
                t.materialObject.material[name] = data;
            };

            let objectUpdate = function(mat, newMat, obj){
                if(obj["material"] == mat){
                    obj["material"] = newMat;
                }

                for (let i = 0; i < obj.children.length; i++) {
                    objectUpdate(mat, newMat, obj.children[i]);
                }
            };

            matC.children(".material_type").change(function(){
                let val = String($(this).val()).toLocaleLowerCase();
                let mat = t.selectObject.material;
                let c = THREE.MeshPhongMaterial;
                switch (val) {

                    case "phong":
                        c = THREE.MeshPhongMaterial;
                        break;
                
                    case "pbr":
                        c = THREE.MeshPhysicalMaterial;
                        break;

                    default:
                        break;
                }

                for (let i = 0; i < editor.project.materials.length; i++) {
                    if(editor.project.materials[i] == mat){
                        let newMat = new c({side: THREE.DoubleSide});
                        newMat.name = mat.name;

                        objectUpdate(mat, newMat, editor.project.scene.data);
                        editor.project.materials[i] = newMat;
                        t.selectObject.material = editor.project.materials[i];
                        t.update(editor);
                        break;
                    }
                }
            });

            matC.children(".material_opacity").change(function(){
                updateData(Number($(this).val()), "opacity");
                updateData(true, "transparent");
                updateData(true, "needsUpdate");
            });

            // matC.children(".material_color_diffuse").spectrum({
            //     color: "#f00",
            //     showButtons: false,
            //     containerClassName: "pcolor0",
            //     replacerClassName: "pcolor1 pp no-shader",
            //     move: function(color) {
            //         updateData(new THREE.Color(color.toHexString()), "color");
            //     }
            // });

            matC.children(".material_map_diffuse").change(function(){
                updateTexture(Number($(this).val()), "map");
            });

            matC.children(".material_map_roughness").change(function(){
                updateTexture(Number($(this).val()), "roughnessMap");
            });

            matC.children(".material_roughness").change(function(){
                updateData(Number($(this).val()), "roughness");
            });

            matC.children(".material_map_metalness").change(function(){
                updateTexture(Number($(this).val()), "metalnessMap");
            });

            matC.children(".material_roughness").change(function(){
                updateData(Number($(this).val()), "metalness");
            });

            // matC.children(".material_color_specular").spectrum({
            //     color: "#f00",
            //     showButtons: false,
            //     containerClassName: "pcolor0",
            //     replacerClassName: "pcolor1 phong pp no-shader",
            //     move: function(color) {
            //         updateData(new THREE.Color(color.toHexString()), "specular");
            //     }
            // });

            matC.children(".material_map_specular").change(function(){
                updateTexture(Number($(this).val()), "specularMap");
            });

            matC.children(".material_shi_specular").change(function(){
                updateData(Number($(this).val()), "shininess");
            });

            // matC.children(".material_color_emission").spectrum({
            //     color: "#f00",
            //     showButtons: false,
            //     containerClassName: "pcolor0",
            //     replacerClassName: "pcolor1 pp no-shader",
            //     move: function(color) {
            //         updateData(new THREE.Color(color.toHexString()), "emissive");
            //     }
            // });

            matC.children(".material_map_emission").change(function(){
                updateTexture(Number($(this).val()), "emissiveMap");
            });

            matC.children(".material_int_emission").change(function(){
                updateData(Number($(this).val()), "emissiveIntensity");
            });

            matC.children(".material_reflection").change(function(){
                updateData(Number($(this).val()), "reflectivity");
            });

            matC.children(".material_refraction").change(function(){
                updateData(Number($(this).val()), "refractionRatio");
            });

            matC.children(".material_dynamic_cube").change(function(){
                let v = $(this).val();
                if(v == "Scene"){
                mat["dynamic_cube"] = 0;
                }
                else if(v == "Single"){
                    mat["dynamic_cube"] = 1;
                }
                else{
                    mat["dynamic_cube"] = -1;
                }
            });

            matC.children(".material_normal_map").change(function(){
                updateTexture(Number($(this).val()), "normalMap");
            });

            matC.children(".material_bump_map").change(function(){
                updateTexture(Number($(this).val()), "bumpMap");
            });

            matC.children(".material_bump_scale").change(function(){
                updateData(Number($(this).val()), "bumpScale");
            });

            matC.children(".material_ao_map").change(function(){
                updateTexture(Number($(this).val()), "aoMap");
            });

            matC.children(".material_ao_int").change(function(){
                updateData(Number($(this).val()), "aoMapIntensity");
            });        

        }

    }

    getTextureValue(tex){
        for (let i = 0; i < editor.project.textures.length; i++) {
            if(editor.project.textures[i] == tex){
                return i;
            }
        }
        return "none";
    }

    setMaterial(editor){
        let t = this;
        let mat = t.selectObject.material;
        t.materialObject.material = mat.clone();
        let matC = $(this.container).children(".material_settings");
        matC.show();

        matC.children(".material_header").children(".material_name").html("");
        for (let i = 0; i < editor.project.materials.length; i++) {
            let _mat = editor.project.materials[i].name;
            matC.children(".material_header").children(".material_name").append(`<option value="` + i + `">` + _mat + `</option>`);   
            if(editor.project.materials[i] == mat){
                matC.children(".material_header").children(".material_name").val(i);
            }
        }

        matC.children(".material_map_diffuse").html(`<option value="none">None</option>`);
        matC.children(".material_map_roughness").html(`<option value="none">None</option>`);
        matC.children(".material_map_metalness").html(`<option value="none">None</option>`);
        matC.children(".material_map_specular").html(`<option value="none">None</option>`);
        matC.children(".material_map_emission").html(`<option value="none">None</option>`);
        matC.children(".material_bump_map").html(`<option value="none">None</option>`);
        matC.children(".material_normal_map").html(`<option value="none">None</option>`);
        matC.children(".material_ao_map").html(`<option value="none">None</option>`);
        for (let i = 0; i < editor.project.textures.length; i++) {
            let tex = editor.project.textures[i];
            matC.children(".material_map_diffuse").append(`<option value="` + i + `">` + tex.name + `</option>`);
            matC.children(".material_map_roughness").append(`<option value="` + i + `">` + tex.name + `</option>`);
            matC.children(".material_map_metalness").append(`<option value="` + i + `">` + tex.name + `</option>`);
            matC.children(".material_map_specular").append(`<option value="` + i + `">` + tex.name + `</option>`);
            matC.children(".material_map_emission").append(`<option value="` + i + `">` + tex.name + `</option>`);
            matC.children(".material_bump_map").append(`<option value="` + i + `">` + tex.name + `</option>`);
            matC.children(".material_normal_map").append(`<option value="` + i + `">` + tex.name + `</option>`);
            matC.children(".material_ao_map").append(`<option value="` + i + `">` + tex.name + `</option>`);
        }

        matC.children(".material_map_diffuse").val(t.getTextureValue(mat.map));
        // matC.children(".material_color_diffuse").spectrum("set", mat.color.getHexString());
        matC.children(".material_map_emission").val(t.getTextureValue(mat.emissiveMap));
        // matC.children(".material_color_emission").spectrum("set", mat.emissive.getHexString());
        matC.children(".material_int_emission").val(mat.emissiveIntensity);
        matC.children(".material_refraction").val(mat.refractionRatio);
        matC.children(".material_normal_map").val(t.getTextureValue(mat.normalMap));
        matC.children(".material_bump_map").val(t.getTextureValue(mat.bumpMap));
        matC.children(".material_bump_scale").val(mat.bumpScale);
        matC.children(".material_ao_map").val(t.getTextureValue(mat.aoMap));
        matC.children(".material_ao_int").val(mat.aoMapIntensity);


        if(mat.type == "MeshPhysicalMaterial"){
            matC.children(".phong").hide();
            matC.children(".pbr").show();
            matC.children(".material_type").val("PBR");
            matC.children(".material_map_roughness").val(t.getTextureValue(mat.roughnessMap));
            matC.children(".material_roughness").val(mat.roughness);
            matC.children(".material_map_metalness").val(t.getTextureValue(mat.metalnessMap));
            matC.children(".material_metalness").val(mat.metalness);
        }
        else{
            matC.children(".phong").show();
            matC.children(".pbr").hide();
            matC.children(".material_type").val("Phong");
            matC.children(".material_reflection").val(mat.reflectivity);
            // matC.children(".material_color_specular").spectrum("set", mat.specular.getHexString());
            matC.children(".material_map_specular").val(t.getTextureValue(mat.specularMap));
            matC.children(".material_shi_specular").val(mat.shininess);
        }

    }

    initCamera(editor){
        let t = this;
        let c = $(this.container).children(".camera_settings");

        c.children(".camera_fov").change(function(){
            t.selectObject.fov = Number($(this).val());
        });

        c.children(".camera_near").change(function(){
            t.selectObject.near = Number($(this).val());
        });

        c.children(".camera_far").change(function(){
            t.selectObject.far = Number($(this).val());
        });

        c.children(".camera_zoom").change(function(){
            t.selectObject.zoom = Number($(this).val());
        });

    }

    setCamera(editor){
        let t = this;
        let c = $(this.container).children(".camera_settings");
        c.show();

        c.children(".camera_fov").val(t.selectObject.fov);
        c.children(".camera_near").val(t.selectObject.near);
        c.children(".camera_far").val(t.selectObject.far);
        c.children(".camera_zoom").val(t.selectObject.zoom);

    }

    init(editor){
        this.initModel(editor);
        this.initTransform(editor);
        this.initLight(editor);
        this.initMaterial(editor);
        this.initCamera(editor);
    }

    setContainer(jqueryObject, editor){
        this.container = jqueryObject;
        $(this.container).children(".context_settings_div").hide();
        this.init(editor);
    }

}