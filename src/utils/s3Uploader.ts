import aws from "aws-sdk";
import { getServerConfig } from "./getServerConfig";
const config = getServerConfig();

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
      Bucket: "zpace",
      Key: fileName.replace(
        "https://zpace.s3.ap-southeast-1.amazonaws.com/",
        ""
      ),
    };

    s3.deleteObject(params, (err, data) => {
      resolve(data);
    });
  });
};
export { deleteFile };
