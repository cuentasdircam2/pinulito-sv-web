const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = {

    async onPostBuild({ inputs, constants }) {

        let dataDir = `${inputs.dataDir}`;
        console.log(constants);
        console.log(dataDir);

        // Aggregate menu
        let menuResult = {
            items: []
        };
        glob(`${dataDir}/menu/*.json`, function (err, files) {
            console.log('inside glob');
            if(!err) {
                console.log('inside glob - no err');
                if(files) {
                    console.log('inside glob - no err - files');
                    for(let i = 0; i < files.length; i++){
                        console.log(files[i]);
                        let _tempData = await fs.readFileSync(`${dataDir}/menu/${files[i]}`);
                        menuResult.items.push(JSON.parse(_tempData));
                    }
                }else{
                    console.log('inside glob - no err - no files');
                }
            }else{
                console.log('inside glob - yes err');
                console.error(err);
            }
        })

        if(ensureDirectoryExistence(`${dataDir}/merged/menu_merged.json`)){
            await fs.writeFileSync(`${dataDir}/merged/menu_merged.json`, JSON.stringify(menuResult));
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

async function ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
    if (await fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    await fs.mkdirSync(dirname);
}