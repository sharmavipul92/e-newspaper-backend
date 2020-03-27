const {Storage} = require('@google-cloud/storage');
const {Datastore} = require('@google-cloud/datastore');
const fs = require('fs');

const storage = new Storage();
const datastore = new Datastore();

async function createBucket() {
  let today = new Date();
  // let bucketName = 'seema-sandesh-epaper/' + today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate() + '/';
  let bucketName = 'seema-sandesh-epaper2';
  console.log(bucketName);
  const [bucket] = await storage.createBucket(bucketName, {
    location: 'ASIA-SOUTH1'
  });

  console.log(`Bucket ${bucket.name} created.`);
}

async function listBuckets() {
  // Lists all buckets in the current project

  const [buckets] = await storage.getBuckets();
  console.log('Buckets:');
  buckets.forEach(bucket => {
    console.log(bucket.name);
  });
}

async function getBucket(){
  let bucketName = 'seema-sandesh-epaper';
  const [metadata] = await storage.bucket(bucketName).getMetadata();

  for (const [key, value] of Object.entries(metadata)) {
    console.log(`${key}: ${value}`);
  }
}

async function uploadFiles() {
  // Uploads a local file to the bucket
  let filePath = '../images/1/';
  let bucketName = 'seema-sandesh-epaper';
  let today = new Date();
  let uploadPath = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate() + '/';
  let fileCount = 1;
  let kind = 'images';
  let images = [];
  let data;

  fs.readdirSync(filePath).forEach(async fileName => {
    console.log(fileName);
    let destination = uploadPath + (fileName.includes('main') ? 'main.jpg' : (fileCount++ + '.jpg'));
    console.log(destination);

    data = await storage.bucket(bucketName).upload(filePath + fileName, {
      destination,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    console.log(`${destination} uploaded to ${bucketName}.`);

    images.push({
      key: datastore.key([kind, ]),
      data: country
    });

  });
  console.log(data);
}

uploadFiles().catch(console.error);
// createBucket().catch(console.error);
