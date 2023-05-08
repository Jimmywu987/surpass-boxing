import aws from "aws-sdk";

aws.config.update({
  accessKeyId: process.env.S3_UPLOAD_KEY,
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
  region: process.env.S3_UPLOAD_REGION,
  signatureVersion: "v4",
});

const s3 = new aws.S3({ signatureVersion: "v4" });

const deleteFile = (fileName: string) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.S3_UPLOAD_BUCKET as string,
      Key: fileName.replace(
        `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com/`,
        ""
      ),
    };

    s3.deleteObject(params, (err, data) => {
      resolve(data);
    });
  });
};
export { deleteFile };
