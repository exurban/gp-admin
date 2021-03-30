import { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useMutation } from "@apollo/client";
import {
  Image,
  ImageInfoFragment,
  ImageDocument,
  AddImageDocument,
  AddImageInput,
  UpdateImageDocument,
  UpdateImageInput,
  UpdatePhotoDocument,
  UpdatePhotoMutationVariables,
  PhotoWithSkuDocument
} from "../graphql-operations";
import Cropper from "react-easy-crop";
import { getOrientation } from "get-orientation/browser";
import { getCroppedImgAsBase64String, getRotatedImage } from "../utils/CanvasUtils";
import { blobToFile, resizeBlob, dataUrlToBlob } from "../utils/ImageUtils";
import { uploadFile } from "../utils/UploadUtils";
import { Box, Flex, Stack, Text, useToasts } from "bumbag";

/**
 * on open, hydrate image from photo.images[0].imageUrl
 */

const ORIENTATION_TO_ANGLE = {
  3: 180,
  6: 90,
  8: -90
};

type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type Props = {
  photoId: number;
  photoSku: number;
  photoImage: ImageInfoFragment | null | undefined;
  sharingImageId: number | undefined;

  closeModal: () => void;
};

const SharingImageEditor: React.FC<Props> = forwardRef(
  ({ photoId, photoSku, photoImage, sharingImageId, closeModal }, ref) => {
    const [sharingImageUrl, setSharingImageUrl] = useState<string | undefined>();
    const toasts = useToasts();

    // react-easy-crop vars
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [, setCroppedImage] = useState<string | null>(null);

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
      console.log(`updating photo with input ${JSON.stringify(input, null, 2)}`);
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
          console.log(`updating photo with newly added input: ${JSON.stringify(input, null, 2)}`);
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
          console.log(`updating photo with updated imagae: ${JSON.stringify(input, null, 2)}`);
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

    const saveImageData = (url: string) => {
      console.log(`Sharing Image URL: ${url}`);
      const newImageUrl = new URL(url);
      const pathname = newImageUrl.pathname;
      const nameExt: string = pathname.split("/")?.[2];
      const imageName = nameExt.split(".")?.[0];
      const fileExtension = nameExt.split(".")?.[1];

      if (!sharingImageId) {
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
        const input: UpdateImageInput = {
          imageName: imageName,
          imageUrl: url,
          altText: `${photoSku}_share-image`,
          fileExtension: fileExtension,
          size: "sharing",
          width: 1200,
          height: 630
        };
        console.log(`Updating share image with input: ${JSON.stringify(input, null, 2)}`);
        updateSharingImage(sharingImageId, input);
      }
    };

    type SaveResponse = {
      success: boolean;
      message: string;
      coverImage?: Image | null;
    };

    const uploadAndSave = async (): Promise<SaveResponse> => {
      setSharingImageUrl("");
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
      setSharingImageUrl(undefined);
      setSharingImageUrl(uploadResult.url);

      // * save Image Data
      saveImageData(uploadResult.url);
      return {
        success: true,
        message: `Successfully uploaded image data.`
      };
    };

    const onCropComplete = useCallback(async (_, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // const onClose = useCallback(() => {
    //   setCroppedImage(null);
    // }, []);

    const cropImage = async (): Promise<string | null> => {
      if (!sharingImageUrl || typeof sharingImageUrl !== "string") {
        return null;
      }
      if (croppedAreaPixels && croppedAreaPixels === null) {
        return null;
      }
      try {
        if (croppedAreaPixels && croppedAreaPixels !== null) {
          return await getCroppedImgAsBase64String(sharingImageUrl, croppedAreaPixels, rotation);
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    };

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

    const blobToData = useCallback(async (blob: Blob) => {
      const result = await readBlob(blob);

      let base64String = "";

      if (typeof result !== "string") {
        return;
      } else {
        base64String = result;
      }

      // console.log(`image data: ${base64String}`);
      // apply rotation if needed
      const orientation = await getOrientation(blob);
      // @ts-ignore
      // eslint-disable-next-line
      const rotation = ORIENTATION_TO_ANGLE[orientation];
      let rotationResult;
      if (rotation) {
        rotationResult = await getRotatedImage(base64String, rotation);
      }

      if (typeof rotationResult === "string") {
        base64String = rotationResult;
      }

      // setSharingImageUrl(base64String);
      return base64String;
    }, []);

    useEffect(() => {
      const photoUrl = photoImage?.imageUrl;

      if (!photoUrl) {
        return;
      }

      console.log(`hydrating image`);

      (async function hydrateImage() {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const hydratedImage = await blobToData(blob);
        setSharingImageUrl(hydratedImage);
        console.log(`Image Editor onFileChange mimetype: ${blob.type}`);
      })();

      // sharingImage ? setIsEditing(true) : setIsEditing(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Flex flexDirection="column">
        {sharingImageUrl && sharingImageUrl.length > 0 && (
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
                image={sharingImageUrl}
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
        )}
      </Flex>
    );
  }
);

export default SharingImageEditor;
