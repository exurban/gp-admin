import { useState, useCallback, useEffect, ChangeEvent, Dispatch, SetStateAction } from "react";
import { Image } from "../graphql-operations";
import { useDropzone } from "react-dropzone";
import { Box, Text, Flex, Label, styled } from "bumbag";
import Resizer from "react-image-file-resizer";

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
  setImageHasChanges: Dispatch<SetStateAction<boolean>>;
};

const PhotoImage: React.FC<Props> = ({ image, setImageHasChanges }) => {
  const [imageUrl, setImageUrl] = useState(image.imageUrl);

  useEffect(() => {
    const img = document.getElementById("image") as HTMLImageElement;

    if (img) {
      image.height = img.naturalHeight;
      image.width = img.naturalWidth;
    }
  }, [image, imageUrl]);

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
      // image.imageUrl = dataUrl;
      setImageUrl(dataUrl);
      image.imageUrl = dataUrl;

      console.log(`set new imageUrl.`);
    }

    const img = document.getElementById("image") as HTMLImageElement;

    image.height = img.naturalHeight;
    image.width = img.naturalHeight;

    console.log(`Temp Image data is now: ${JSON.stringify(image, null, 2)}`);
  };

  // function loadImagePreview(file: File) {
  //   const reader = new FileReader();
  //   console.log(`loading image ${file}`);

  //   reader.onloadend = () => {
  //     setFile(file);
  //     if (reader.result && typeof reader.result === "string") {
  //       setImageUrl(reader.result);
  //     }
  //     console.log(`imageUrl: ${imageUrl}`);
  //     console.log(`file: ${file}`);
  //   };
  //   reader.readAsDataURL(file);
  // }

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
      // loadImagePreview(file);
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
        {imageUrl ? (
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
              <Text textAlign="center" padding="major-2">
                Drop image here or click to select an image.
              </Text>
            </Box>
          </Box>
        )}
        {imageUrl && (
          <Flex marginRight="major-1" marginLeft="auto" marginY="major-1">
            <Label htmlFor="fileUpload" fontSize="100" color="info500">
              Replace Image
            </Label>
            <input type="file" id="fileUpload" onChange={onFileChange} accept="image/*" hidden />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default PhotoImage;
