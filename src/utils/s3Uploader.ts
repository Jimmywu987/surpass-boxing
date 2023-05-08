import aws from "aws-sdk";

aws.config.update({
  accessKeyId: process.env.S3_UPLOAD_KEY,
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
  region: process.env.S3_UPLOAD_REGION,
  signatureVersion: "v4",
});

let s3 = new aws.S3({ signatureVersion: "v4" });

const deleteFile = (fileName: string) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: "surpass-boxing-gym",
      Key: fileName.replace(
        "https://surpass-boxing-gym.s3.ap-southeast-1.amazonaws.com/",
        ""
      ),
    };

    s3.deleteObject(params, (err, data) => {
      resolve(data);
    });
  });
};
export { deleteFile };
