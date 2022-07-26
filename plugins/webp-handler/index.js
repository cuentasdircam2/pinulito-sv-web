const fs = require('fs');
const path = require('path');
const glob = require('glob');
const webp = require('webp-converter');

webp.grant_permission();

module.exports = {

    onPostBuild: async ({ inputs }) => {

        console.log('Starting to process images')

        const imagesDir = `${inputs.dataDir}`;

        let imgToWebpList = [];
        let webpToRemoveList = [];

        // List images
        let normalImages = glob.sync(`${imagesDir}/*.{png,jpg}`);
        let webpImages = glob.sync(`${imagesDir}/*.webp`);

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
            console.log('Deleting unused webp images')
            for(let i = 0; i < webpToRemoveList.length; i++){
                fs.rmSync(webpToRemoveList[i]);
            }
            console.log('Finished deleting unused webp images')
        }

        // Now, convert normal imgs to webp
        if(imgToWebpList.length > 0){
            console.log('Converting normal images to webp');
            for(let i = 0; i < imgToWebpList.length; i++){
                let fileExtension = (path.parse(imgToWebpList[i]).ext).replace('.', '');
                let result = await webp.buffer2webpbuffer(fs.readFileSync(imgToWebpList[i]), fileExtension, '-q 80');

                result.then(res => {
                    let newFileName = imgToWebpList[i].replace(fileExtension, 'webp');
                    fs.writeFileSync(newFileName, res);
                })
            }
            console.log('Finished converting normal images to webp');
        }

        console.log('Images processed');
    },

}