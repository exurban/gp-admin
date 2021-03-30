import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { useMutation } from "@apollo/client";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { Box, Flex, Text, Label, Stack, useToasts } from "bumbag";
import { blobToFile, resizeBlob, dataUrlToBlob } from "../utils/ImageUtils";
import { uploadFile } from "../utils/UploadUtils";
import {
  Image,
  ImageDocument,
  AddImageDocument,
  AddImageInput,
  UpdateImageDocument,
  UpdateImageInput,
  UpdatePhotoMutationVariables,
  UpdatePhotoDocument,
  PhotoWithSkuDocument,
  ImageInfoFragment
} from "../graphql-operations";
import { getCroppedImgAsBase64String } from "../utils/CanvasUtils";

/**
 * 1. if image exists, hydrate it
 * 2. select or drop new image
 * 3. crop and rotate
 * 4. save image to s3
 * 5. if image existed, update image in database, else add image
 */

type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type Props = {
  photoId: number;
  photoSku: number;
  sharingImage: ImageInfoFragment | null | undefined;

  closeModal: () => void;
};

const SharingImageEditorOLD: React.FC<Props> = forwardRef(
  ({ photoId, photoSku, sharingImage, closeModal }, ref) => {
    // true if sharingImage already exists, set on load
    const [isEditing, setIsEditing] = useState(false);
    const [imageHasChanges, setImageHasChanges] = useState(false);
    // const [imageUrl, setImageUrl] = useState<string | null>(
    //   photo.sharingImage ? photo.sharingImage.imageUrl : photo.images[0].imageUrl
    // );
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [, setCroppedImage] = useState<string | null>(null);
    const toasts = useToasts();

    const [updatePhoto] = useMutation(UpdatePhotoDocument, {
      refetchQueries: [
        {
          query: PhotoWithSkuDocument,
          variables: {
            sku: photoSku
          }
        }
      ],
      onCompleted(data) {
        console.log(`Saved sharing image id to photo.`);
        if (data.updatePhoto.success) {
          toasts.success({
            title: `Successfully updated`,
            message: `${data.updatePhoto.message}`
          });
        } else {
          toasts.danger({
            title: `Updates failed`,
            message: `${data.updatePhoto.message}`
          });
        }
      }
    });

    const updatePhotoWithInput = (input: UpdatePhotoMutationVariables) => {
      updatePhoto({
        variables: input
      });
    };

    const [addImage] = useMutation(AddImageDocument, {
      onCompleted(data) {
        if (data.addImage.success && data.addImage.newImage) {
          const input = {
            id: photoId,
            input: {
              sharingImageId: parseInt(data.addImage.newImage.id)
            }
          };
          updatePhotoWithInput(input);
        } else {
          console.log(`failed to save sharing image to database.`);
        }
        resetAndCloseEditor();
      }
    });

    const [updateImage] = useMutation(UpdateImageDocument, {
      onCompleted(data) {
        console.log(`sharing image updated and saved to DB. Updating sharing image ref on photo.`);
        if (data.updateImage.success && data.updateImage.updatedImage) {
          const input = {
            id: photoId,
            input: {
              sharingImageId: parseInt(data.updateImage.updatedImage.id)
            }
          };
          updatePhotoWithInput(input);
        } else {
          console.log(`failed to save sharing image to database.`);
        }
        resetAndCloseEditor();
      }
    });

    const resetAndCloseEditor = () => {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setCroppedImage(null);
      closeModal();
    };

    useImperativeHandle(ref, () => ({
      async saveImage() {
        if (!imageHasChanges) {
          resetAndCloseEditor();
          return {
            success: true,
            message: `No changes made to cover image.`
          };
        }

        const saveResult = await uploadAndSave();

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

    /**
     * Converts file or Binary Large Object (BLOB) to Base64-encoded string.
     */
    function readBlob(blob: Blob) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result), false);
        reader.readAsDataURL(blob);
      });
    }

    useEffect(() => {
      setImageHasChanges(true);
    }, [setImageUrl, setCrop, setRotation, setZoom, setCroppedAreaPixels]);

    const addSharingImage = (input: AddImageInput) => {
      addImage({
        variables: {
          input
        }
      });
    };

    const updateSharingImage = (imageId: number, input: UpdateImageInput) => {
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

    // * 6. save sharing image to database
    const saveImageData = (url: string) => {
      console.log(`Sharing Image URL: ${url}`);
      const newImageUrl = new URL(url);
      const pathname = newImageUrl.pathname;
      const nameExt: string = pathname.split("/")?.[2];
      const imageName = nameExt.split(".")?.[0];
      const fileExtension = nameExt.split(".")?.[1];

      if (!isEditing) {
        const input: AddImageInput = {
          imageName: imageName,
          imageUrl: url,
          altText: `${photoSku}_share-image`,
          fileExtension: fileExtension,
          size: "sharing",
          width: 1200,
          height: 630
        };
        console.log(`Adding share image with input: ${JSON.stringify(input, null, 2)}`);
        addSharingImage(input);
      } else {
        if (!sharingImage) {
          console.error(`something bad happened`);
          return;
        }
        const imageId = parseInt(sharingImage?.id);

        const input: UpdateImageInput = {
          imageName: imageName,
          imageUrl: url,
          altText: `${photoSku}_share-image`,
          fileExtension: fileExtension,
          size: "sharing",
          width: 1200,
          height: 630
        };
        updateSharingImage(imageId, input);
      }
    };

    type SaveResponse = {
      success: boolean;
      message: string;
      coverImage?: Image | null;
    };

    // * 5. resize, upload to S3 and save Image
    const uploadAndSave = async (): Promise<SaveResponse> => {
      setImageUrl("");
      const croppedImageAsBase64String = await cropImage();

      if (!croppedImageAsBase64String) {
        return {
          success: false,
          message: "Failed to crop image."
        };
      }

      const croppedBlob = dataUrlToBlob(croppedImageAsBase64String);

      if (!croppedBlob) {
        return {
          success: false,
          message: `Failed to transform cropped string to Blob.`
        };
      }

      // * resizeBlob
      const width = 1200;
      const height = 630;
      const format = "WEBP";

      const resizedBlob = await resizeBlob(croppedBlob, width, height, format);
      if (!resizedBlob) {
        return {
          success: false,
          message: `Failed to resize Blob as .webp.`
        };
      }

      // * blobToFile
      const ident = `${photoSku}_share-image-${Date.now()}`;
      const mimetype = resizedBlob.type.split("/")?.[1];
      const filename = `${ident}.${mimetype}`;
      const fileToUpload = blobToFile(resizedBlob, filename);
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

      console.log(`Received URL from S3 save: ${uploadResult.url}`);

      // * setImageUrl
      setImageUrl(null);
      setImageUrl(uploadResult.url);

      // * save Image Data
      saveImageData(uploadResult.url);
      return {
        success: true,
        message: `Successfully uploaded image data.`
      };
    };

    // * 4. Resize

    // * 3. Crop & Rotate
    const onCropComplete = useCallback(async (_, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const cropImage = async (): Promise<string | null> => {
      console.log(`cropping image.`);
      if (!imageUrl || typeof imageUrl !== "string") {
        return null;
      }
      if (croppedAreaPixels && croppedAreaPixels === null) {
        return null;
      }
      try {
        console.log(`Cropped area pixels: ${croppedAreaPixels}`);
        if (croppedAreaPixels && croppedAreaPixels !== null) {
          return await getCroppedImgAsBase64String(imageUrl, croppedAreaPixels, rotation);
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    };

    // * 2. load preview
    function readFile(file: File) {
      console.log(`reading file`);
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result), false);
        reader.readAsDataURL(file);
      });
    }

    const loadPreview = useCallback(async (file: File) => {
      console.log(`loading preview`);
      const dataUrl = await readFile(file);
      if (typeof dataUrl === "string") {
        setImageUrl(dataUrl);
      }
    }, []);

    // * 1. select image
    /**
     * Used when user clicks `replace image`
     */
    const removeSharingImage = () => {
      console.info(`FILE CHANGED AFTER CLICKING REPLACE FILE`);
      setImageUrl(null);
    };

    /**
     * Dropzone methods
     */
    const onDrop = useCallback(
      async acceptedFiles => {
        const file = acceptedFiles[0];
        console.log(
          `dropped or selected file: ${Object.keys(file)} ${file.path} ${file.name} ${file.type} ${
            file.size
          }`
        );
        loadPreview(file);
        setImageHasChanges(true);
      },
      [loadPreview]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      maxFiles: 1,
      accept: "image/*"
    });

    /**
     * 1. if image exists, load and hydrate it
     */
    /**
     * convert an image file or blob to base64 string (imageData)
     * reads file or blob to base64 string
     * rotates file or blob, as needed
     * sets imageData var to string value
     */
    const fileOrBlobToData = useCallback(async (blob: Blob) => {
      const result = await readBlob(blob);

      let base64String = "";

      if (typeof result !== "string") {
        return;
      } else {
        base64String = result;
      }

      setImageUrl(base64String);
    }, []);

    // ? if image exists on load, hydrate that image and set isEditing to true. Used to pick between add image and update image in database.
    useEffect(() => {
      const shareImgUrl = sharingImage?.imageUrl;

      if (!shareImgUrl) {
        return;
      }

      console.log(`sharing image exists. Hydrate it and setIsEditing(true)`);

      (async function hydrateImage() {
        const response = await fetch(shareImgUrl);
        const blob = await response.blob();
        fileOrBlobToData(blob);
        console.log(`Image Editor onFileChange mimetype: ${blob.type}`);
      })();

      sharingImage ? setIsEditing(true) : setIsEditing(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Flex flexDirection="column">
        {imageUrl && imageUrl.length > 0 ? (
          <>
            <Box
              className="crop-container"
              position="relative"
              width="100%"
              height="315px"
              alignX="center"
              backgroundColor="default"
              borderRadius="4px"
            >
              <Cropper
                image={imageUrl}
                crop={crop}
                rotation={rotation}
                zoom={zoom}
                aspect={600 / 315}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </Box>
            <Flex marginRight="major-1" marginLeft="auto" marginY="major-1">
              <Label
                htmlFor="fileUpload"
                fontSize="100"
                color="info500"
                onClick={() => removeSharingImage()}
              >
                Replace Image
              </Label>
            </Flex>
            <Box paddingY="major-3">
              <Stack spacing="major-5" width="500px" orientation="horizontal">
                <input
                  type="range"
                  id="zoom"
                  name="zoom"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  width="260px"
                  onChange={e => setZoom(parseFloat(e.target.value))}
                />
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={e => setRotation(parseInt(e.target.value))}
                />
              </Stack>
              <Stack spacing="major-2" width="500px" orientation="horizontal">
                <Text.Block textAlign="center" fontSize="100">
                  Zoom
                </Text.Block>
                <Text.Block textAlign="center" fontSize="100">
                  Rotation
                </Text.Block>
              </Stack>
            </Box>
          </>
        ) : (
          <Box {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <Box
              width="600px"
              height="315px"
              alignX="center"
              alignY="center"
              backgroundColor="default"
              border="2px solid"
              borderRadius="4px"
              borderColor={isDragActive ? "blue" : "gray100"}
            >
              <Text textAlign="center" padding="major-2" color="text">
                Drop image here or click to select an image.
              </Text>
            </Box>
          </Box>
        )}
      </Flex>
    );
  }
);

export default SharingImageEditorOLD;
