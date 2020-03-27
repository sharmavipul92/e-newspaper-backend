const {Storage} = require('@google-cloud/storage');
const {Datastore} = require('@google-cloud/datastore');
const fs = require('fs');

const storage = new Storage();
const datastore = new Datastore();

async function uploadFiles(dateString, pageNumber) {
  // Uploads a local file to the bucket
  let filePath = '../images/' + pageNumber + '/';
  let bucketName = 'seema-sandesh-epaper';
  let today = new Date(dateString);
  let uploadPath = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate() + '/' + pageNumber + '/';
  let fileCount = 1;
  let kind = 'images';

  fs.readdirSync(filePath).forEach(async fileName => {
    let destination = uploadPath + (fileName.includes('main') ? 'main.jpg' : (fileCount++ + '.jpg'));

    let [{metadata: {id, mediaLink, name, bucket, timeCreated}}] = await storage.bucket(bucketName).upload(filePath + fileName, {
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
    console.log(`Saved ${fileName} to datastore as ${(fileName.includes('main') ? 'main.jpg' : (fileCount++ + '.jpg'))}`);
  });

}

uploadFiles('2020-03-23', 12).catch(console.error);