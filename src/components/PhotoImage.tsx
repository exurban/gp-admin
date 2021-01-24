import { useState, useCallback, ChangeEvent } from "react";
import { useMutation } from "@apollo/client";
import {
  Image,
  UpdateImageMutationVariables,
  UpdateImageDocument,
  ImageUpdateInput
} from "../graphql-operations";
import { useDropzone } from "react-dropzone";
import { Box, Text, Flex, Label, styled, useToasts, Button } from "bumbag";
import Resizer from "react-image-file-resizer";
import Upload from "./Upload";

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
  image: Image;
  photoId: string;
  photoSku: number;
  photoTitle: string;
};

const PhotoImage: React.FC<Props> = ({ image, photoId, photoSku, photoTitle }) => {
  const [imageHasChanges, setImageHasChanges] = useState(false);
  const [imageUrl, setImageUrl] = useState(image.imageUrl);

  const toasts = useToasts();
  /**
   * on submit, upload image, if upload to S3 successful, update mutation for image, then photo
   */
  const [updateImage] = useMutation(UpdateImageDocument, {
    onCompleted(data) {
      console.log(`Updated Image: ${JSON.stringify(data, null, 2)}`);
      if (data.updateImage.success) {
        toasts.success({
          title: `Successfully updated`,
          message: `${data.updateImage.message}`
        });
      } else {
        toasts.danger({
          title: `Updates failed`,
          message: `${data.updateImage.message}`
        });
      }
    }
  });

  /**
   * Convert a dataUrl to a Blob so we can make a file to name and upload.
   */
  const dataURLtoBlob = (dataUrl: string) => {
    if (!dataUrl) {
      console.error(`dataURLtoBlob called without providing a dataUrl argument.`);
      return null;
    }

    const arr = dataUrl.split(",");

    if (!arr) {
      console.error(`Failed to parse dataUrl: ${dataUrl}`);
    }

    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  type ImageResponse = {
    success: boolean;
    message: string;
    url?: string | undefined;
  };

  const uploadNewImage = async (): Promise<ImageResponse> => {
    if (imageUrl && typeof imageUrl === "string") {
      const result = dataURLtoBlob(imageUrl);

      if (!result) {
        console.error(`Failed to convert dataUrl to Blob`);
        const failedResponse = {
          success: false,
          message: "Failed to convert dataUrl to Blob."
        };
        return failedResponse;
      }

      const blob: Blob = result;
      const mimetype = blob.type.replace("image/", ".");
      const filename = photoSku ? `photo_${photoSku}${mimetype}` : "Untitled";

      if (!filename) {
        console.error(`Failed to generate filename.`);
        const failedResponse: ImageResponse = {
          success: false,
          message: "Failed to generate filename."
        };
        return failedResponse;
      }
      const toUpload = new File([blob], filename, {
        lastModified: Date.now()
      });
      console.log(`Uploading: ${JSON.stringify(toUpload, null, 2)}`);
      return await Upload(toUpload);
    } else {
      const failedResponse = {
        success: false,
        message: "Image value is not a string."
      };
      return failedResponse;
    }
  };

  type SaveImageResponse = {
    success: boolean;
    message: string;
    image?: Image | undefined;
  };

  const onSaveImage = async (): Promise<SaveImageResponse> => {
    if (!imageHasChanges) {
      const noChanges = {
        success: true,
        message: "No changes to image."
      };
      return noChanges;
    }

    const imageUploadResponse = await uploadNewImage();

    if (imageUploadResponse && imageUploadResponse.success) {
      if (!imageUploadResponse.url) {
        const uploadFailed = {
          success: false,
          message: "Image upload failed."
        };
        return uploadFailed;
      }

      // send image update mutation
      const newImage = { ...image };
      newImage.altText = photoTitle ? photoTitle : "Untitled";
      newImage.imageUrl = imageUploadResponse.url;

      const str = imageUploadResponse.url;
      const parts = str.split("/");
      const lastPart = parts[4];
      console.log(`last part: ${lastPart}`);
      const nameParts = lastPart.split(".");
      const name = nameParts[0];
      const ext = nameParts[1];

      const img = document.getElementById("image") as HTMLImageElement;

      const input: ImageUpdateInput = {
        imageName: name,
        fileExtension: ext,
        imageUrl: newImage.imageUrl,
        altText: photoTitle,
        size: "XL",
        width: img.naturalWidth,
        height: img.naturalHeight,
        photoId: parseInt(photoId)
      };

      console.log(`image update input: ${JSON.stringify(input, null, 2)}`);

      const editImageVariables: UpdateImageMutationVariables = {
        id: parseInt(newImage.id),
        input
      };
      updateImage({
        variables: editImageVariables
      });
      setImageHasChanges(false);
      const success = {
        success: true,
        message: "Uploaded new image.",
        image: newImage
      };
      return success;
    }
    const uploadFailed = {
      success: false,
      message: "Image upload failed."
    };
    return uploadFailed;
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
        75,
        0,
        uri => {
          // console.log(`URI: ${uri}`);
          resolve(uri);
        },
        "base64"
      );
    });

  const resizeAndLoadPreview = async (file: File) => {
    const dataUrl = await resizeFile(file);
    setImageHasChanges(true);

    if (typeof dataUrl === "string") {
      setImageUrl(dataUrl);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: "image/*"
  });

  const StyledImage = styled.img`
    object-fit: contain;
  `;

  return (
    <Flex className="image-data-wrapper" flexDirection="row" width="900">
      <Flex className="output" flexDirection="column" width="720px" height="500px">
        {imageUrl && imageUrl.length > 0 ? (
          <Box>
            <StyledImage id="image" className="image" width="700px" height="468px" src={imageUrl} />
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
              borderRadius="4px"
              borderColor={isDragActive ? "blue" : "gray100"}
              backgroundColor="#fcfcfc"
            >
              <Text textAlign="center" padding="major-2" color="gray800">
                Drop image here or click to select an image.
              </Text>
            </Box>
          </Box>
        )}
        {imageUrl && (
          <Flex marginRight="major-1" marginLeft="auto" marginY="major-1">
            <Button variant="ghost" size="small" palette="info500" onClick={() => onSaveImage()}>
              Save
            </Button>
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
};

export default PhotoImage;
