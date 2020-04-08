const path = require('path');
const cwd = path.join(__dirname, '../downloads');
console.log(cwd);

function main(
  bucketName = 'seema-sandesh-epaper',
  srcFilename = '2020/4/7/seema-sandesh-07-04-2020.pdf',
  destFilename = path.join(cwd, 'seema-sandesh-07-04-2020.pdf')
) {
  // [START storage_download_file]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Name of a bucket, e.g. my-bucket';
  // const srcFilename = 'Remote file to download, e.g. file.txt';
  // const destFilename = 'Local destination for file, e.g. ./local/path/to/file.txt';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function downloadFile() {
    const options = {
      // The path to which the file should be downloaded, e.g. "./file.txt"
      destination: destFilename,
    };

    await storage
      .bucket(bucketName)
      .file(srcFilename)
      .download(options);

    console.log(
      `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
    );
  }

  downloadFile().catch(console.error);
  // [END storage_download_file]
}
main(...process.argv.slice(2));