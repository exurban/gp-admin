import { useState, useEffect, useCallback, ChangeEvent, Dispatch, SetStateAction } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { Box, Flex, Paragraph, Text, Label, Stack } from "bumbag";
import { getOrientation } from "get-orientation/browser";
import { getCroppedImg, getRotatedImage } from "../utils/CanvasUtils";

/**
 * Purpose: Crop, zoom and rotate an image.
 *
 * 5 Main Components:
 * 1. convert file or path to imageData
 * 2. manipulate imageData
 * 3. capture changes into croppedImage
 * 4. upload croppedImageData
 * 5. update database and preview
 *
 * 1. Take file, blob or path and convert to imageData.
 * 2. Manipulate imageData by cropping, rotating and zooming.
 * 3. Capture cropped data and save it as croppedImageData.
 * 4. Upload croppedImageData through server's API endpoint.
 * 5. On API endpoint, convert to .webp using imagemin.
 * 6. On successful save, get path / URL and image metadata
 *
 * Image Input:
 *  - from file pathname (S3, etc.)
 *    - load the file at the path
 *    - convert to data (base64-encoded string)
 *  - dropped or selected from local file system (file or blob)
 *    - convert to data
 *
 * imageData, setImageData - refers to base64-encoded string
 *  - needed for cropping, zooming and rotating
 *
 *
 *
 * If no image passed in, shows drop zone where a local file can be dropped or selected.
 * If image is passed in, it is converted to a base64 string (blob). Image can be replaced by
 * clicking 'replace image' and selecting from the local file system. These images are also
 * converted to blobs.
 *
 * When editing is complete and user selects 'save changes', previewBlob is converted back
 * to an image file represented by a url (`previewSrc`) which is passed back via the
 * setPreviewSrc variable.
 */

/**
 * Orientation
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
  imageSrc: string | undefined;
  setHasChanges: Dispatch<SetStateAction<boolean>>;
  setFilename: Dispatch<SetStateAction<string>>;
  setFileExtension: Dispatch<SetStateAction<string>>;
};

const ImageEditor: React.FC<Props> = ({
  imageSrc,
  setHasChanges,
  setFilename,
  setFileExtension
}) => {
  const [imageData, setImageData] = useState<string>("");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels] = useState<Area>({ width: 0, height: 0, x: 0, y: 0 });
  const [, setCroppedImage] = useState("");

  /**
   * If image is switched, cropped, zoomed or rotated, setHasChanges is set to true to give
   * the user the option to save these changes.
   */
  useEffect(() => {
    setHasChanges(true);
  }, [imageData, setHasChanges, setCrop, setRotation, setZoom]);

  /**
   * Converts file or Binary Large Object (BLOB) to Base64-encoded string.
   */
  function readFile(file: Blob) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  }

  /**
   * convert an image file or blob to base64 string (imageData)
   * reads file or blob to base64 string
   * rotates file or blob, as needed
   * sets imageData var to string value
   */
  const fileOrBlobToData = useCallback(
    async (blob: Blob) => {
      const result = await readFile(blob);

      let base64String = "";

      if (typeof result !== "string") {
        return;
      } else {
        base64String = result;
      }

      console.log(`image data: ${base64String}`);
      // apply rotation if needed
      const orientation = await getOrientation(blob);
      // eslint-disable-next-line
      const rotation = ORIENTATION_TO_ANGLE[orientation];
      let rotationResult;
      if (rotation) {
        rotationResult = await getRotatedImage(base64String, rotation);
      }

      if (typeof rotationResult === "string") {
        base64String = rotationResult;
      }

      setHasChanges(true);
      setImageData(base64String);
    },
    [setHasChanges]
  );

  /**
   * Used to hydrate existing cover image passed in by parent
   */
  useEffect(() => {
    if (!imageSrc) {
      return;
    }

    (async function hydrateImage() {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      fileOrBlobToData(blob);
      console.log(`Image Editor onFileChange mimetype: ${blob.type}`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilenameAndExtension = (file: File) => {
    setFilename(file.name);
    switch (file.type) {
      case "image/jpeg":
        setFileExtension(".jpg");
        break;
      case "image/png":
        setFileExtension(".png");
        break;
      case "image/webp":
        setFileExtension(".webp");
        break;
      default:
        console.log(`Unknown image type: ${file.type}`);
    }
  };

  /**
   * Used when user clicks `replace image`
   */
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      setFilenameAndExtension(file);

      fileOrBlobToData(file);
    }
  };

  /**
   * Dropzone methods
   */
  const onDrop = useCallback(
    async acceptedFiles => {
      const file = acceptedFiles[0];
      console.log(`dropped file: ${file} ${file.name} ${file.type} ${file.size}`);
      setFilenameAndExtension(file);

      fileOrBlobToData(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileOrBlobToData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: "image/*"
  });

  /**
   * Called each time a crop completes.
   * Takes base64String (imageData variable), applies croppedArea and rotation and
   * returns the result as croppedImage to its parent via getBlobUrl
   */
  // const onCropComplete = async croppedAreaPixels => {
  //   const croppedImage = await getCroppedImg(imageData, croppedAreaPixels, rotation);
  //   console.log(`croppedImage: ${croppedImage}`);
  //   getBlobUrl(croppedImage);
  // };

  // const showCroppedImage = useCallback(async () => {
  //   try {
  //     const croppedImage = await getCroppedImg(imageData, croppedAreaPixels, rotation);
  //     console.log({ croppedImage });
  //     setCroppedImage(croppedImage);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }, [croppedAreaPixels, imageData, rotation]);

  // const onClose = useCallback(() => {
  //   setCroppedImage(null);
  //   console.log(`closing image editor.`);
  // }, []);

  return (
    <>
      <Box className="page-wrapper" width="600px" marginX="auto">
        <Box
          width="500px"
          height="750px"
          alignX="center"
          marginX="auto"
          margin="20px"
          borderRadius="6px"
        >
          {imageData ? (
            <>
              <Box
                className="crop-container"
                position="relative"
                width="100%"
                height="100%"
                backgroundColor="#333"
                borderRadius="6px"
              >
                <Cropper
                  image={imageData}
                  crop={crop}
                  rotation={rotation}
                  zoom={zoom}
                  aspect={2 / 3}
                  onCropChange={setCrop}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete} // eslint-disable-line
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
            </>
          ) : (
            <Box {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <Box
                width="100%"
                height="600px"
                marginX="auto"
                marginY="major-2"
                border="2px solid"
                borderRadius="4px"
                borderColor={isDragActive ? "blue" : "gray100"}
                backgroundColor="#fcfcfc"
              >
                <Paragraph color="gray400" height="100%" alignX="center" alignY="center">
                  <Text textAlign="center" padding="major-2">
                    Drop image here or click to select an image.
                  </Text>
                </Paragraph>
              </Box>
            </Box>
          )}

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
      </Box>
    </>
  );
};

export default ImageEditor;
