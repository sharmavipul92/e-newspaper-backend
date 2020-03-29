const {Storage} = require('@google-cloud/storage');
const {Datastore} = require('@google-cloud/datastore');
const fs = require('fs');

const storage = new Storage();
const datastore = new Datastore();

async function uploadFiles(dateString) {
  let filePath = '../images/' + dateString;
  let bucketName = 'seema-sandesh-epaper';
  let today = new Date(dateString);
  let uploadPath = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate() + '/';
  let kind = 'images';

  fs.readdirSync(filePath).forEach(async folderName => {
    console.log(folderName);
    let pageNumber = folderName;
    let fileCount = 1;

    fs.readdirSync(`${filePath}/${pageNumber}`).forEach(async fileName => {
      let destination = uploadPath + pageNumber + '/' + (fileName.includes('main') ? 'main.jpg' : (fileCount++ + '.jpg'));
      
      let [{metadata: {id, mediaLink, name, bucket, timeCreated}}] = await storage.bucket(bucketName).upload(`${filePath}/${pageNumber}/${fileName}`, {
        destination,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });
      console.log(`${destination} uploaded to ${bucketName}.`);
  
      await datastore.save({
        key: datastore.key([kind, name]),
        data: { 
          id, 
          mediaLink, 
          name, 
          bucket, 
          timeCreated,
          date: today,
          pageNumber
        }
      });
      
      console.log(`Saved ${fileName} to datastore as ${(fileName.includes('main') ? 'main.jpg' : ((fileCount-1) + '.jpg'))}`);
    });
  });
}

if(!isNaN(Date.parse(process.argv[2]))){
  uploadFiles(process.argv[2]).catch(console.error);
} else {
  console.error('The date argument is not correct. Please check.');
}
