import { dataURLtoFile, resizeFileToBlob, blobToFile } from "../utils/ImageUtils";

type UploadImageResponse = {
  success: boolean;
  message: string;
  url?: string | undefined;
};

export const uploadDataUrl = async (
  imageUrl: string,
  name: string
): Promise<UploadImageResponse> => {
  if (!imageUrl || typeof imageUrl !== "string") {
    return {
      success: false,
      message: `imageUrl either not provided or not a string (dataUrl)`
    };
  }

  const filename = `cover_${name}`;
  const fileFromImageDataUrl = dataURLtoFile(imageUrl, filename);

  if (!fileFromImageDataUrl || typeof fileFromImageDataUrl !== "object") {
    return {
      success: false,
      message: `Failed to convert imageUrl to file`
    };
  }
  return await uploadFile(fileFromImageDataUrl);
};

export const resizeAndUploadDataUrl = async (
  imageUrl: string,
  name: string,
  width: number,
  height: number,
  format: string
): Promise<UploadImageResponse> => {
  if (!imageUrl || typeof imageUrl !== "string") {
    return {
      success: false,
      message: `imageUrl either not provided or not a string (dataUrl)`
    };
  }

  const filename = `cover_${name}`;
  const fileFromImageDataUrl = dataURLtoFile(imageUrl, filename);

  if (!fileFromImageDataUrl || typeof fileFromImageDataUrl !== "object") {
    return {
      success: false,
      message: `Failed to convert imageUrl to file`
    };
  }

  const resizedBlob = (await resizeFileToBlob(fileFromImageDataUrl, width, height, format)) as Blob;

  const mimetype = resizedBlob?.type.split("/")?.[1];
  console.log(`resized blob: ${resizedBlob} ${resizedBlob.type} ${resizedBlob.size}`);
  console.log(`Filename for resized blob: ${filename}.${mimetype}`);

  const fileToUpload = blobToFile(resizedBlob, `${filename}.${mimetype}`);
  if (!fileToUpload || fileToUpload === null) {
    console.error(`Failed to convert blob to file.`);
    return {
      success: false,
      message: `Failed to convert blob to file.`
    };
  }
  console.log(`uploading file with name: ${fileToUpload.name}`);
  return await uploadFile(fileToUpload);
};

export const uploadFile = async (file: File): Promise<UploadImageResponse> => {
  console.log(`uploading file: ${file.name} ${file.size}`);
  const filename = encodeURIComponent(file.name);
  console.log(filename);
  const res = await fetch(`/api/upload-url?file=${filename}`);
  const { url, fields } = await res.json();
  const formData = new FormData();

  Object.entries({ ...fields, file }).forEach(([key, value]) => {
    // @ts-ignore
    formData.append(key, value);
  });

  const upload = await fetch(url, {
    method: "POST",
    body: formData
  });

  if (upload.ok) {
    console.log(`Upload response: ${JSON.stringify(upload, null, 2)}`);
    const successResponse: UploadImageResponse = {
      success: true,
      message: "Uploaded successfully!",
      url: url + `/${filename}`
    };
    return successResponse;
  } else {
    console.error("Upload failed.");
    const failResponse: UploadImageResponse = {
      success: false,
      message: "Failed to upload image to Amazon S3."
    };
    return failResponse;
  }
};
