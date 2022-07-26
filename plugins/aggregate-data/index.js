const fs = require('fs');
const glob = require('glob');

module.exports = {

    onPreBuild: ({ inputs }) => {

        let dataDir = `${inputs.dataDir}`;

        // START Aggregate menu
        let menuResult = {
            items: []
        };

        let menuFiles = glob.sync(`${dataDir}/menu/*.json`);
        if(menuFiles) {
            for(let i = 0; i < menuFiles.length; i++){
                let _tempData = JSON.parse(fs.readFileSync(`${menuFiles[i]}`));
                menuResult.items.push(_tempData);
            }
            console.log('Menu merged');
        }else{
            console.log('No menu files to merge');
        }
        // END Aggregate menu


        // START Aggregate sucursales
        let sucursalesResult = {
            'ahuachapan': [],
            'cabanas': [],
            'chalatenango': [],
            'cuscatlan': [],
            'la-libertad': [],
            'la-paz': [],
            'la-union': [],
            'morazan': [],
            'san-miguel': [],
            'san-salvador': [],
            'san-vicente': [],
            'santa-ana': [],
            'sonsonate': [],
            'usulutan': [],
        };
        let sucursalesFiles = glob.sync(`${dataDir}/sucursales/**/*.json`);
        if(sucursalesFiles) {
            for(let i = 0; i < sucursalesFiles.length; i++){
                let _tempData = JSON.parse(fs.readFileSync(`${sucursalesFiles[i]}`));
                sucursalesResult[_tempData['departamento-sucursal']].push(_tempData);
            }
            console.log('Sucursales merged');
        }else{
            console.log('No sucursales files to merge');
        }
        // END Aggregate sucursales


        if (!fs.existsSync(`${dataDir}/merged`)) {
            fs.mkdirSync(`${dataDir}/merged`);
            console.log(`Directory: ${dataDir}/merged created.`)
        }

        fs.writeFileSync(`${dataDir}/merged/menu_merged.json`, JSON.stringify(menuResult));
        console.log(`Menu merged written to ${dataDir}/merged/menu_merged.json`);

        fs.writeFileSync(`${dataDir}/merged/sucursales_merged.json`, JSON.stringify(sucursalesResult));
        console.log(`Menu merged written to ${dataDir}/merged/sucursales_merged.json`);
    },

}