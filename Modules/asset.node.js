
// module.exports.contextHTML = `
// <div class="context_asset">
//     <div class="context_asset_header"><span class="context_asset_header_btn">asset</span><span class="icon-right-open"></span></div>
//     <div class="context_asset_data">
//         <div class="context_asset_item">
//             <div class="context_asset_item_icon"><span class="icon-folder"></span></div>
//             <div class="context_asset_item_name">Testy</div>
//         </div>
//         <div class="context_asset_item">
//             <div class="context_asset_item_icon"><span class="icon-folder"></span></div>
//             <div class="context_asset_item_name">Testy</div>
//         </div>
//     </div>
// </div>
// `;

// module.exports.contextCSS  = "";
// module.exports.contextJS   = "";


module.exports = class{
    constructor(){
        this.type = "display";
        this.saveCallback = null;
        this.loadCallback = null;
        this.exportCallback = null;
        this.importCallback = null;
        this.exitCallback = null;

        this.container = null;
        this.layoutContainer = null;
    }

    destroy() {
        
    }

    getHTML(){
        return `
        <div class="context_asset">
            <div class="context_asset_header"><span class="context_asset_header_btn">asset</span><span class="icon-right-open"></span></div>
            <div class="context_asset_data">
                <div class="context_asset_item">
                    <div class="context_asset_item_icon"><span class="icon-folder"></span></div>
                    <div class="context_asset_item_name">Testy</div>
                </div>
                <div class="context_asset_item">
                    <div class="context_asset_item_icon"><span class="icon-folder"></span></div>
                    <div class="context_asset_item_name">Testy</div>
                </div>
            </div>
        </div>
        `;
    }

    getContainerName(){
        return "context_asset";
    }

    setContainer(jqueryObject, layoutObject){

    }
}