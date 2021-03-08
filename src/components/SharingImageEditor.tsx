import {
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
  Dispatch,
  SetStateAction
} from "react";
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
  UpdateImageInput
} from "../graphql-operations";
import { getCroppedImgAsBase64String } from "../utils/CanvasUtils";

/**
 * 1. select image
 * 2. load preview
 * 3. crop & rotate
 * 4. save
 *    4a. resize
 *    4b. upload to S3
 *    4c. save Image to database
 */

type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type Props = {
  sharingImage: Image | null | undefined;
  setSharingImage: Dispatch<SetStateAction<Image | null | undefined>>;
  imageUrl: string | undefined;
  setImageUrl: Dispatch<SetStateAction<string | undefined>>;
  name: string;
  closeModal: () => void;
};

const CoverImageEditor: React.FC<Props> = forwardRef(
  ({ sharingImage, setSharingImage, imageUrl, setImageUrl, name, closeModal }, ref) => {
    const [imageHasChanges, setImageHasChanges] = useState(false);
    const [editorImageUrl, setEditorImageUrl] = useState(imageUrl);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [, setCroppedImage] = useState<string | null>(null);
    const toasts = useToasts();

    const [addImage] = useMutation(AddImageDocument, {
      onCompleted(data) {
        if (data.addImage.success) {
          data.addImage.newImage ? setSharingImage(data.addImage.newImage) : null;
          toasts.success({
            title: `Success`,
            message: data.addImage.message
          });
        } else {
          toasts.danger({
            title: `Failure`,
            message: data.addImage.message
          });
        }
        resetAndCloseEditor();
      }
    });

    const [updateImage] = useMutation(UpdateImageDocument, {
      onCompleted(data) {
        if (data.updateImage.success) {
          data.updateImage.updatedImage ? setSharingImage(data.updateImage.updatedImage) : null;
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

    useEffect(() => {
      setImageHasChanges(true);
    }, [setEditorImageUrl, setCrop, setRotation, setZoom, setCroppedAreaPixels]);

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

    // * 6. save image
    const saveImageData = (url: string) => {
      console.log(`Sharing Image URL: ${url}`);
      const newImageUrl = new URL(url);
      const pathname = newImageUrl.pathname;
      const nameExt: string = pathname.split("/")?.[2];
      const imageName = nameExt.split(".")?.[0];
      const fileExtension = nameExt.split(".")?.[1];

      if (!sharingImage) {
        const input: AddImageInput = {
          imageName: imageName,
          imageUrl: url,
          altText: name,
          fileExtension: fileExtension,
          size: "sharing",
          width: 1200,
          height: 630
        };
        console.log(`Adding cover image with input: ${JSON.stringify(input, null, 2)}`);
        addSharingImage(input);
      } else {
        const imageId = parseInt(sharingImage?.id);

        const input: UpdateImageInput = {
          imageName: imageName,
          imageUrl: url,
          altText: name,
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
      const ident = name ? `cover_${name}-${Date.now()}` : `new-item-${Date.now()}`;
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
      setImageUrl(undefined);
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
      if (!editorImageUrl || typeof editorImageUrl !== "string") {
        return null;
      }
      if (croppedAreaPixels && croppedAreaPixels === null) {
        return null;
      }
      try {
        console.log(`Cropped area pixels: ${croppedAreaPixels}`);
        if (croppedAreaPixels && croppedAreaPixels !== null) {
          return await getCroppedImgAsBase64String(editorImageUrl, croppedAreaPixels, rotation);
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    };

    // * 2. load preview
    function readFile(file: File) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result), false);
        reader.readAsDataURL(file);
      });
    }

    const loadPreview = useCallback(async (file: File) => {
      const dataUrl = await readFile(file);
      if (typeof dataUrl === "string") {
        setEditorImageUrl(dataUrl);
      }
    }, []);

    // * 1. select image
    /**
     * Used when user clicks `replace image`
     */
    const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setImageHasChanges(true);

        loadPreview(file);
      }
    };

    /**
     * Dropzone methods
     */
    const onDrop = useCallback(
      async acceptedFiles => {
        const file = acceptedFiles[0];
        console.log(
          `dropped file: ${Object.keys(file)} ${file.path} ${file.name} ${file.type} ${file.size}`
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

    return (
      <Flex flexDirection="column">
        {editorImageUrl && editorImageUrl.length > 0 ? (
          <>
            <Box
              className="crop-container"
              position="relative"
              width="100%"
              height="630px"
              alignX="center"
              backgroundColor="default"
              borderRadius="4px"
            >
              <Cropper
                image={editorImageUrl}
                crop={crop}
                rotation={rotation}
                zoom={zoom}
                aspect={1200 / 630}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </Box>
            <Flex marginRight="major-1" marginLeft="auto" marginY="major-1">
              <form>
                <Label htmlFor="fileUpload" fontSize="100" color="info500">
                  Replace Image
                </Label>
                <input
                  type="file"
                  id="fileUpload"
                  onChange={onFileChange}
                  accept="image/*"
                  hidden
                />
              </form>
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
              width="1200px"
              height="630px"
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

export default CoverImageEditor;
