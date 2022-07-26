const fs = require('fs');
const path = require('path');
const glob = require('glob');
const webp = require('webp-converter');

webp.grant_permission();

let filesToCache = [];

module.exports = {

    onPreBuild: async ({ inputs, utils }) => {

        console.log('-- Starting to process images --');

        const imagesDir = `${inputs.dataDir}`;

        let imgToWebpList = [];
        let webpToRemoveList = [];

        // List images
        let normalImages = glob.sync(`${imagesDir}/*.{png,jpg}`);
        let webpImages = glob.sync(`${imagesDir}/*.webp`);

        // Make sure the webp converter has a temp directory
        if (!fs.existsSync('./node_modules/webp-converter/temp')) {
            fs.mkdirSync('./node_modules/webp-converter/temp');

            console.log(`Directory: ./node_modules/webp-converter/temp created`);
        }

        // Now filter them and save only the images that have no webp equivalent
        if(normalImages.length > 0){
            for(let i = 0; i < normalImages.length; i++){
                let filenameNormalized = path.parse(normalImages[i]).name;

                let found = false;
                for(let j = 0; j < webpImages.length; j++){
                    let filenameWebpNormalized = path.parse(webpImages[j]).name;

                    if(filenameNormalized === filenameWebpNormalized){
                        found = true;
                        break;
                    }
                }

                // If the normal image doesn't have an equivalent, save it.
                if(!found) {
                    imgToWebpList.push(normalImages[i]);
                }
            }
        }

        // Now with the webp images
        if(webpImages.length > 0){
            for(let i = 0; i < webpImages.length; i++){
                let filenameWebpNormalized = path.parse(webpImages[i]).name;

                let found = false;
                for(let j = 0; j < normalImages.length; j++){
                    let filenameNormalized = path.parse(normalImages[j]).name;

                    if(filenameWebpNormalized === filenameNormalized){
                        found = true;
                        break;
                    }
                }

                // If the normal image doesn't have an equivalent, save it.
                if(!found) {
                    webpToRemoveList.push(webpImages[i]);
                }
            }
        }

        // Now, delete unused webps
        if(webpToRemoveList.length > 0){
            console.log('-- Deleting unused webp images --');

            for(let i = 0; i < webpToRemoveList.length; i++){
                fs.rmSync(webpToRemoveList[i]);
                await utils.cache.remove(webpToRemoveList[i]);
                console.log(`Deleted and removed from cache: ${webpToRemoveList[i]}`);
            }

            console.log('-- Finished deleting unused webp images --');
        }

        // Now, convert normal imgs to webp
        if(imgToWebpList.length > 0){
            console.log('-- Converting normal images to webp --');

            for(let i = 0; i < imgToWebpList.length; i++){

                let fileExtension = (path.parse(imgToWebpList[i]).ext).replace('.', '');
                let newFileName = imgToWebpList[i].replace(fileExtension, 'webp');

                if ( await utils.cache.has(newFileName) ) {
                    await utils.cache.restore(newFileName);
                    console.log(`Restored from cache: ${newFileName}`);
                }else{
                    
                
                    let bufferResult = await webp.buffer2webpbuffer(fs.readFileSync(imgToWebpList[i]), fileExtension, '-q 80');
                    fs.writeFileSync(newFileName, bufferResult);
                    filesToCache.push(newFileName);
                    console.log(`Converted: ${newFileName}`);
                }
            }

            console.log('-- Finished converting normal images to webp --');
        }
    },
    onPostBuild: async ({ utils }) => {
        for(let i = 0; i < filesToCache.length; i++){
            await utils.cache.save(filesToCache[i]);
            console.log(`Cached: ${filesToCache[i]}`);
        }

        console.log('-- Images processed --');
    }

}