import { useState, useCallback, useImperativeHandle, forwardRef, ChangeEvent } from "react";
import { useMutation } from "@apollo/client";
import { Image, ImageDocument, UpdateImageDocument, UpdateImageInput } from "../graphql-operations";
import { useDropzone } from "react-dropzone";
import { Box, Text, Flex, Label, Image as BBImage, useToasts } from "bumbag";
import Resizer from "react-image-file-resizer";
import { blobToFile, dataUrlToBlob } from "../utils/ImageUtils";
import { uploadFile } from "../utils/UploadUtils";

/**
 * File requirements:
 * filename = photo.sku
 *
 * Image requirements:
 * imageName=photo.sku
 * fileExtension=".webp"
 * imageUrl
 * altText=title
 * size="xl"
 * width=img.naturalWidth
 * height=img.naturalHeight
 * photo?
 *
 * 1. ingest file
 *  - drop or select - dropzone
 *  - replace by selecting file
 * 2. resize file
 * 3. convert to .webp
 * 4. display preview
 * 5. send to upload-url for upload to S3
 * 6. build Image data and save to DB on Photo submit
 */

// this begins as a copy of the image in the cache.
type Props = {
  image: Image | null | undefined;
  photoId: string;
  photoSku: number;
  photoTitle: string;
};

const PhotoImage: React.FC<Props> = forwardRef(({ image, photoId, photoSku, photoTitle }, ref) => {
  const [imageHasChanges, setImageHasChanges] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(image?.imageUrl);

  const toasts = useToasts();

  useImperativeHandle(ref, () => ({
    async saveImage() {
      if (!imageHasChanges) {
        return {
          success: true,
          message: `No changes made to cover image.`
        };
      }

      const saveResult = await uploadAndSave();
      console.log(`Imperative Handle save result: ${JSON.stringify(saveResult, null, 2)}`);

      if (!saveResult || !saveResult.success) {
        return {
          success: false,
          message: `Failed to save and upload cover image.`
        };
      }
      return {
        success: true,
        message: `Successfully uploaded image to S3.`
      };
    }
  }));

  const [updateImage] = useMutation(UpdateImageDocument, {
    onCompleted(data) {
      if (data.updateImage.success) {
        toasts.success({
          title: `Success`,
          message: data.updateImage.message
        });
      } else {
        toasts.danger({
          title: `Failure`,
          message: data.updateImage.message
        });
      }
    }
  });

  const updatePhotoImage = (imageId: number, input: UpdateImageInput) => {
    updateImage({
      variables: {
        id: imageId,
        input
      },
      refetchQueries: [
        {
          query: ImageDocument,
          variables: {
            id: imageId
          }
        }
      ]
    });
  };

  // type SaveResponse = {
  //   success: boolean;
  //   message: string;
  //   coverImage?: Image | null;
  // };

  // /**
  //  * Convert a dataUrl to a Blob so we can make a file to name and upload.
  //  */
  // const dataURLtoBlob = (dataUrl: string): Blob | null => {
  //   if (!dataUrl) {
  //     console.error(`dataURLtoBlob called without providing a dataUrl argument.`);
  //     return null;
  //   }

  //   const arr = dataUrl.split(",");

  //   if (!arr) {
  //     console.error(`Failed to parse dataUrl: ${dataUrl}`);
  //   }

  //   const mime = arr[0].match(/:(.*?);/)?.[1];
  //   const bstr = atob(arr[1]);
  //   let n = bstr.length;
  //   const u8arr = new Uint8Array(n);
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }
  //   return new Blob([u8arr], { type: mime });
  // };

  // type ImageResponse = {
  //   success: boolean;
  //   message: string;
  //   url?: string | undefined;
  // };

  // const uploadNewImage = async (): Promise<ImageResponse> => {
  //   if (imageUrl && typeof imageUrl === "string") {
  //     const result = dataURLtoBlob(imageUrl);

  //     if (!result) {
  //       console.error(`Failed to convert dataUrl to Blob`);
  //       const failedResponse = {
  //         success: false,
  //         message: "Failed to convert dataUrl to Blob."
  //       };
  //       return failedResponse;
  //     }

  //     const blob: Blob = result;
  //     const mimetype = blob.type.replace("image/", ".");
  //     const filename = photoSku ? `photo_${photoSku}${mimetype}` : "Untitled";

  //     if (!filename) {
  //       console.error(`Failed to generate filename.`);
  //       const failedResponse: ImageResponse = {
  //         success: false,
  //         message: "Failed to generate filename."
  //       };
  //       return failedResponse;
  //     }
  //     const toUpload = new File([blob], filename, {
  //       lastModified: Date.now()
  //     });
  //     console.log(`Uploading: ${JSON.stringify(toUpload, null, 2)}`);
  //     return await Upload(toUpload);
  //   } else {
  //     const failedResponse = {
  //       success: false,
  //       message: "Image value is not a string."
  //     };
  //     return failedResponse;
  //   }
  // };

  // const onSaveImage = async (): Promise<SaveImageResponse> => {
  //   if (!imageHasChanges) {
  //     return {
  //       success: true,
  //       message: "No changes to image."
  //     };
  //   }

  //   const imageUploadResponse = await uploadNewImage();

  //   if (imageUploadResponse && imageUploadResponse.success) {
  //     if (!imageUploadResponse.url) {
  //       return {
  //         success: false,
  //         message: "Image upload failed."
  //       };
  //     }

  //     // send image update mutation
  //     const newImage = { ...image };
  //     newImage.altText = photoTitle ? photoTitle : "Untitled";
  //     newImage.imageUrl = imageUploadResponse.url;

  //     const str = imageUploadResponse.url;
  //     const parts = str.split("/");
  //     const lastPart = parts[4];
  //     console.log(`last part: ${lastPart}`);
  //     const nameParts = lastPart.split(".");
  //     const name = nameParts[0];
  //     const ext = nameParts[1];

  //     const img = document.getElementById("image") as HTMLImageElement;

  //     const input: UpdateImageInput = {
  //       imageName: name,
  //       fileExtension: ext,
  //       imageUrl: newImage.imageUrl,
  //       altText: photoTitle,
  //       size: "xl",
  //       width: img.naturalWidth,
  //       height: img.naturalHeight,
  //       photoId: parseInt(photoId)
  //     };

  //     console.log(`image update input: ${JSON.stringify(input, null, 2)}`);

  //     const editImageVariables: UpdateImageMutationVariables = {
  //       id: parseInt(newImage.id),
  //       input
  //     };
  //     updateImage({
  //       variables: editImageVariables
  //     });
  //     setImageHasChanges(false);
  //     const success = {
  //       success: true,
  //       message: "Uploaded new image.",
  //       image: newImage
  //     };
  //     return success;
  //   }
  //   const uploadFailed = {
  //     success: false,
  //     message: "Image upload failed."
  //   };
  //   return uploadFailed;
  // };

  // * save image

  type SaveResponse = {
    success: boolean;
    message: string;
    image?: Image | null | undefined;
  };

  const saveImageData = (url: string) => {
    if (!image) {
      return;
    }
    const newImageUrl = new URL(url);
    const pathname = newImageUrl.pathname;
    const nameExt: string = pathname.split("/")?.[2];
    const imageName = nameExt.split(".")?.[0];
    const fileExtension = nameExt.split(".")?.[1];

    const img = document.getElementById("image") as HTMLImageElement;
    const height = img.naturalHeight;
    const width = img.naturalWidth;
    console.log(`IMAGE H:${height} W:${width}`);

    const input: UpdateImageInput = {
      imageName: imageName,
      imageUrl: url,
      altText: photoTitle,
      fileExtension: fileExtension,
      size: "xl",
      width: width,
      height: height,
      photoId: parseInt(photoId)
    };
    console.log(`updating image with input: ${JSON.stringify(input, null, 2)}`);
    updatePhotoImage(parseInt(image.id), input);
    // const result = await updatePhotoImage(parseInt(image.id), input);
    // console.log(`saveImageData result is: ${JSON.stringify(result, null, 2)}`);

    // return result;
  };

  // * 5. upload to S3 and save Image
  const uploadAndSave = async (): Promise<SaveResponse> => {
    if (!imageUrl) {
      return {
        success: false,
        message: `No image loaded.`
      };
    }
    const blob = dataUrlToBlob(imageUrl);

    if (!blob) {
      return {
        success: false,
        message: `Failed to transform cropped string to Blob.`
      };
    }

    // * blobToFile
    const ident = photoSku ? `photo_${photoSku}-${Date.now()}` : `new-item-${Date.now()}`;
    const mimetype = blob.type.split("/")?.[1];
    const filename = `${ident}.${mimetype}`;
    const fileToUpload = blobToFile(blob, filename);
    if (!fileToUpload) {
      return {
        success: false,
        message: `Failed to convert Blob to File.`
      };
    }

    // * upload File
    const uploadResult = await uploadFile(fileToUpload);
    if (!uploadResult || !uploadResult.success) {
      return {
        success: false,
        message: `Failed to upload file.`
      };
    }

    if (!uploadResult.url) {
      return {
        success: false,
        message: `Failed to retrieve URL from S3 save.`
      };
    }

    console.log(`Result from S3 save: ${JSON.stringify(uploadResult, null, 2)}`);

    // * setImageUrl
    // setImageUrl(uploadResult.url);

    // * save Image Data
    saveImageData(uploadResult.url);

    // const saveDataResult = await saveImageData(uploadResult.url);

    // console.log(`Save data result in PhotoImage: ${JSON.stringify(saveDataResult, null, 2)}`);
    // return saveDataResult;
    return uploadResult;
  };

  /**
   * https://github.com/onurzorluer/react-image-file-resizer#readme
   * @param file image file to resize
   * Returns a base64-encoded string (DataUrl) with the reduced-size file (max Dimension = 1400)
   * encoded as .webp with 75% quality.
   */
  const resizeFile = (file: File) =>
    new Promise(resolve => {
      Resizer.imageFileResizer(
        file,
        1400,
        1400,
        "WEBP",
        100,
        0,
        uri => {
          // console.log(`URI: ${uri}`);
          resolve(uri);
        },
        "base64"
      );
    });

  const resizeAndLoadPreview = useCallback(async (file: File) => {
    const dataUrl = await resizeFile(file);
    setImageHasChanges(true);

    if (typeof dataUrl === "string") {
      setImageUrl(dataUrl);
    }
  }, []);

  /**
   * Used when user clicks `replace image`
   */
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      resizeAndLoadPreview(file);
    }
  };

  /**
   * Dropzone methods
   */
  const onDrop = useCallback(
    async acceptedFiles => {
      const file = acceptedFiles[0];
      console.log(`dropped file: ${file} ${file.name} ${file.type} ${file.size}`);
      resizeAndLoadPreview(file);
    },
    [resizeAndLoadPreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: "image/*"
  });

  console.log(
    `PhotoImage loading with imageUrl: ${imageUrl} sku: ${photoSku} title: ${photoTitle}`
  );

  return (
    <Flex className="image-data-wrapper" flexDirection="row" width="900">
      <Flex className="output" flexDirection="column" width="720px" height="500px">
        {imageUrl && imageUrl.length > 0 ? (
          <Box width="700px" height="468px" alignX="center" alignY="center">
            <BBImage
              id="image"
              className="image"
              src={imageUrl}
              maxWidth="700px"
              maxHeight="468px"
              borderRadius="6px"
              altitude="300"
              objectFit="contain"
            />
          </Box>
        ) : (
          <Box {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <Box
              width="700px"
              height="468px"
              alignX="center"
              alignY="center"
              border="2px solid"
              borderRadius="6px"
              borderColor={isDragActive ? "blue" : "gray100"}
              backgroundColor="default"
            >
              <Text textAlign="center" padding="major-2" color="gray800">
                Drop image here or click to select an image.
              </Text>
            </Box>
          </Box>
        )}
        {imageUrl && (
          <Flex marginRight="major-1" marginLeft="auto" marginY="major-1">
            <form>
              <Label htmlFor="fileUpload" fontSize="100" color="info500">
                Replace Image
              </Label>
              <input type="file" id="fileUpload" onChange={onFileChange} accept="image/*" hidden />
            </form>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
});

export default PhotoImage;
