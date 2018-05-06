const path = require("path");
const watchjs = require("watchjs");

module.exports = class{

    constructor(){
        this.type = "display";
        this.name = "object_settings";
        this.containerName = "context_settings";
        this.html = `
        <div class="context_settings">
            <div class="context_settings_header">
                <div class="context_settings_header_icon">
                    <img src="">
                </div>
                <div class="context_settings_header_data">
                    <div class="context_settings_header_properites"><span class="icon-cog"></span></div>
                    <div class="context_settings_header_name">Not selected object</div>
                </div>
                <div style="clear:both"></div>
            </div>


            <div class="context_settings_div transform_settings">
                Transform<br>
                position:<br>
                <input type="number" class="transform_pos_x" value="0" step="0.1"><input type="number" class="transform_pos_y" value="0" step="0.1"><input type="number" class="transform_pos_z" value="0" step="0.1"><br>
                rotation:<br>
                <input type="number" class="transform_rot_x" value="0" step="1"><input type="number" class="transform_rot_y" value="0" step="1"><input type="number" class="transform_rot_z" value="0" step="1"><br>
                scale:<br>
                <input type="number" class="transform_sca_x" value="0" step="0.1"><input type="number" class="transform_sca_y" value="0" step="0.1"><input type="number" class="transform_sca_z" value="0" step="0.1"><br>
            </div>

            <div class="context_settings_div display_settings">
                Display:<br>
                <br>
                <span class="info">Type:     </span> <select class="display_type pp"><option>Normal</option><option>Background</option></select>
                <div class="bl"></div>
                <span class="info">Priority: </span> <input class="display_priority pp" type="number" value="10" step="1" min="0" max="10">
                <div class="bl"></div>
            </div>

            <div class="context_settings_div material_settings">
                <span class="o">Material:<br><br></span>
                <select class="material_name o"></select><br class="o">
                <br>
                <div class="material_viewer no-shader"></div>
                <br class="no-shader">
                <span class="info no-shader">Type:              </span> <select class="material_type pp no-shader"><option>Phong</option><option>PBR</option></select>
                <div class="bl no-shader"></div>
                <span class="info no-shader">Opacity:           </span> <input class="material_opacity pp no-shader" type="number" value="1" step="0.1" min="0" max="1">
                <div class="bl no-shader"></div>
                <span class="info">Shader:            </span> <select class="material_shader pp"><option>Ddefault</option></select>
                <div class="bl"></div>
                <!-- <span class="info">Auto Generate:     </span> <select class="material_auto_generate pp"><option>None</option><option>All</option><option>Only Light</option><option>None</option></select>
                <div class="bl"></div>
                <span class="info">Generate in shader:</span> <input class="material_generate_in pp" type="checkbox">
                <div class="bl"></div> -->
                <br class="no-shader">

                <br class="no-shader">

                <span class="no-shader">Diffuse:<br></span>
                <span class="info no-shader">Color:  </span> <input type="text" class="material_color_diffuse pp" />
                <div class="bl no-shader"></div>
                <span class="info no-shader">Texture:</span> <select class="material_map_diffuse pp no-shader"><option>None</option></select>
                <div class="bl no-shader"></div>
                
                <br class="no-shader">

                <span class="pbr no-shader">Roughness:<br></span>
                <span class="info pbr no-shader">Texture:   </span><select class="material_map_roughness pbr pp no-shader"><option>None</option></select>
                <div class="bl pbr no-shader"></div>
                <span class="info pbr no-shader">Intensity:   </span><input class="material_roughness pbr pp no-shader" type="number" value="0" step="0.001" min="0" max="1">
                <div class="bl pbr no-shader"></div>

                <br class="pbr no-shader">

                <span class="pbr no-shader">Metalness:<br></span>
                <span class="info pbr no-shader">Texture:   </span><select class="material_map_metalness pbr pp no-shader"><option>None</option></select>
                <div class="bl pbr no-shader"></div>
                <span class="info pbr no-shader">Intensity:   </span><input class="material_metalness pbr pp no-shader" type="number" value="0" step="0.001" min="0" max="1">
                <div class="bl pbr no-shader"></div>

                <br class="pbr no-shader">
                
                <span class="phong no-shader">Specular:<br></span>
                <span class="info phong no-shader">Color:     </span><input type="text" class="material_color_specular pp" />
                <div class="bl phong no-shader"></div>
                <span class="info phong no-shader">Texture:   </span><select class="material_map_specular phong pp no-shader"><option>None</option></select>
                <div class="bl phong no-shader"></div>
                <span class="info phong no-shader">Shininess: </span><input class="material_shi_specular phong pp no-shader" type="number" value="30" step="0.1" min="0" max="100">
                <div class="bl phong no-shader"></div>

                <br class="phong no-shader">

                <span class="info phong no-shader">Reflection:  </span> <input class="material_reflection phong pp no-shader" type="number" value="0" step="0.001" min="0" max="1">
                <div class="bl phong no-shader"></div>
                <span class="info no-shader">Refraction:  </span> <input class="material_refraction pp no-shader" type="number" value="0" step="0.001" min="0" max="1">
                <div class="bl no-shader"></div>
                <span class="info no-shader">Dynamic Cube:</span> <select class="material_dynamic_cube pp no-shader"><option>Scene</option><option>Single</option></select>
                <div class="bl no-shader"></div>

                <br class="no-shader">

                <span class="no-shader">Emission:<br></span>
                <span class="info no-shader">Color:    </span> <input type="text" class="material_color_emission pp" />
                <div class="bl no-shader"></div>
                <span class="info no-shader">Texture:  </span> <select class="material_map_emission pp no-shader"></select>
                <div class="bl no-shader"></div>
                <span class="info no-shader">Intensity:</span> <input class="material_int_emission pp no-shader" type="number" value="0" step="0.001" min="0" max="1">
                <div class="bl no-shader"></div>

                <br class="no-shader">

                <span class="no-shader">Bump:<br></span>
                <span class="info no-shader">BumpMap:  </span> <select class="material_bump_map pp no-shader"><option>Ddefault</option></select>
                <div class="bl no-shader"></div>
                <span class="info no-shader">BumpScale:</span> <input class="material_bump_scale pp no-shader" type="number" value="0.1" step="0.001" min="0" max="1">
                <div class="bl no-shader"></div>

                <br class="no-shader">

                <!-- Displacement:<br>
                <span class="info">displacementMap:  </span> <select class="material_displacement_map"><option>Ddefault</option></select>
                <div class="bl"></div>
                <span class="info">displacementBias:</span> <input class="material_displacement_bias" type="number" value="0.1" step="0.001" min="0" max="1">
                <div class="bl"></div>
                <span class="info">displacementScale:</span> <input class="material_displacement_scale" type="number" value="0.1" step="0.001" min="0" max="1">
                <div class="bl"></div>

                <br> -->

                <span class="info no-shader">NormalMap:</span> <select class="material_normal_map pp no-shader"><option>Ddefault</option></select>
                <div class="bl no-shader"></div>

                <br class="no-shader">

                <span class="no-shader">Ao:<br></span>
                <span class="info no-shader">aoMap:</span> <select class="material_ao_map pp no-shader"><option>Ddefault</option></select>
                <div class="bl no-shader"></div>
                <span class="info no-shader">aoIntensity:</span> <input class="material_ao_int pp no-shader" type="number" value="0" step="0.001" min="0" max="1">
                <div class="bl no-shader"></div>

                <br class="no-shader">

                <div class="shader">
                    cos w shaderze
                </div>

                <br>
            </div>

            <div class="context_settings_div light_settings">
                Light:<br>
                <span class="info">Diffuse:</span> <input type="text" class="light_diffuse" />
                <div class="bl"></div>
                <br>
                <span class="info">Specular:</span> <input type="text" class="light_specular" />
                <div class="bl"></div>
                <br>
                <span class="info">Ambient:</span> <input type="text" class="light_ambient" />
                <div class="bl"></div>
                <br>
                <span class="info">Intensity:</span> <input class="light_int pp" type="number" value="1" step="0.1" min="0" max="1">
                <div class="bl"></div>
                <div class="point_light">
                    <span class="info">Distance:</span> <input class="light_dis pp" type="number" value="1" step="0.1" min="0">
                    <div class="bl"></div>
                </div>
                <div class="spot_light">
                    <span class="info">Angle:   </span> <input class="light_angle pp" type="number" value="1" step="0.1" min="0" max="1">
                    <div class="bl"></div>
                    <span class="info">Penumbra:</span> <input class="light_pen pp" type="number" value="1" step="0.1" min="0" max="1">
                    <div class="bl"></div>
                </div>
                <br>
                <span class="info">Shadow:        </span> <input class="light_shadow pp" type="checkbox">
                <div class="bl"></div>
                <span class="info">Shadow Quality:</span> <input class="light_shadow_quality pp" type="number" value="5" step="1" min="0" max="10">
                <div class="bl"></div>
                <span class="info">Shadow Near:   </span> <input class="light_shadow_near pp" type="number" value="0.01" step="0.01" min="0" max="100">
                <div class="bl"></div>
                <span class="info">Shadow Far:    </span> <input class="light_shadow_far pp" type="number" value="1000" step="1" min="0">
                <div class="bl"></div>
            </div>

            <div class="context_settings_div model_settings">
                Model:<br><br>
                optimize Mesh: <input class="model_optimize_mesh" type="checkbox"><br>
                Auto Generate UV: <input class="model_auto_uv" type="checkbox"><br>
                Auto Generate Normal: <input class="model_auto_normal" type="checkbox"><br>
                Smoothing Normal: <input class="model_smooth_normal" type="checkbox"><br>
                Inport Material: <input class="model_inport_material" type="checkbox"><br>
                <br>
                <button class="model_add_to_scene">Add to Scene</button><br>
            </div>

            <div class="context_settings_div camera_settings">
                Camera:<br>
                <br>
                <span class="info">FOV: </span> <input class="camera_fov pp" type="number" value="0" step="0.1" min="0" max="180">
                <div class="bl"></div>
                <span class="info">Near:</span> <input class="camera_near pp" type="number" value="0" step="0.01" min="0">
                <div class="bl"></div>
                <span class="info">Far: </span> <input class="camera_far pp" type="number" value="0" step="1" min="0">
                <div class="bl"></div>
                <span class="info">Zoom:</span> <input class="camera_zoom pp" type="number" value="0" step="0.01" min="0">
                <div class="bl"></div>
            </div>

            <div class="context_settings_div scene_settings">

            </div>
            

        </div>
        `;

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