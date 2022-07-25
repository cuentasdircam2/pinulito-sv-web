const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = {

    onBuild: ({ inputs }) => {

        let dataDir = inputs.dataDir;

        // Aggregate menu
        let menuResult = {
            items: []
        };
        glob(`${dataDir}/menu/*.json`, function (err, files) {
            if(!err) {
                if(files) {
                    for(let i = 0; i < files.length; i++){
                        menuResult.items.push(JSON.parse(fs.readFileSync(`${dataDir}/menu/${files[i]}`, { encoding: 'utf8' })));
                    }
                }
            }else{
                console.error(err);
            }
        })

        if(ensureDirectoryExistence(`${dataDir}/merged/menu_merged.json`)){
            fs.writeFileSync(`${dataDir}/merged/menu_merged.json`, JSON.stringify(menuResult), { encoding: 'utf8' })
            utils.status.show({
                // Required.
                summary: 'Menu merged successfully',
                // Optional. Empty by default.
                text: 'Menu merged',
            });
            console.log(menuResult);
            console.log('menu merged');
        }
        // fs.writeFile(`${dataDir}/merged/menu_merged.json`, JSON.stringify(menuResult), { encoding: 'utf8' }, err => {
        //     if(!err) {
        //         console.log('menu merged');
        //     }else{
        //         console.error(err);
        //     }
        // })
    },

}

function ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}