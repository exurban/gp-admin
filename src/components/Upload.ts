type ImageResponse = {
  success: boolean;
  message: string;
  url?: string | undefined;
};

const Upload = async (file: File): Promise<ImageResponse> => {
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
    const successResponse: ImageResponse = {
      success: true,
      message: "Uploaded successfully!",
      url: url + `/${filename}`
    };
    return successResponse;
  } else {
    console.error("Upload failed.");
    const failResponse: ImageResponse = {
      success: false,
      message: "Failed to upload image to Amazon S3."
    };
    return failResponse;
  }
};

export default Upload;
