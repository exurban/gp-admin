import { useEffect, useState } from "react";
import NextPortal from "./NextPortal";
import { Box, Flex, Button, FieldStack, InputField } from "bumbag";
import ImageEditor from "./ImageEditor";
import { getCroppedImg, loadImageAtUrl } from "../utils/CanvasUtils";
import { useMutation } from "@apollo/client";
import {
  AddImageDocument,
  AddImageMutationVariables,
  Image as CoverImage,
  UpdateImageDocument,
  UpdateImageMutationVariables
} from "../graphql-operations";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import Upload from "./Upload";
import { Dispatch, SetStateAction } from "react";

/**
 * passes coverImage.imageUrl from page to ImageEditor
 * gets croppedImage back from ImageEditor via getBlob
 * handles form data for Image (name and alt text)
 *
 * handles uploading to S3
 * handles updating Image with database
 */

/**
 * https://tinloof.com/blog/how-to-create-an-accessible-react-modal/
 */

const baseUrl = "https://configcdkstack-gpbucketc7c11d3d-qtgzc43jqi2c.s3.us-east-2.amazonaws.com/";

type Props = {
  coverImage: CoverImage | null | undefined;
  modalIsOpen: boolean;
  setModalIsOpen: Dispatch<SetStateAction<boolean>>;
  setImageUrl: Dispatch<SetStateAction<string | undefined>>;
};

const Modal: React.FC<Props> = ({ coverImage, modalIsOpen, setModalIsOpen, setImageUrl }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageName, setImageName] = useState("");
  const [filename, setFilename] = useState("");
  const [fileExtension, setFileExtension] = useState("");
  // const [imageUrl, setImageUrl] = useState("");

  const [addImage] = useMutation(AddImageDocument, {
    onCompleted(data) {
      console.log(`data.addImage: ${JSON.stringify(data.addImage, null, 2)}`);
    }
  });

  const [updateImage] = useMutation(UpdateImageDocument, {
    onCompleted(data) {
      console.log(`data.updateImage: ${JSON.stringify(data.updateImage, null, 2)}`);
    }
  });

  useEffect(() => {
    const nameExt = filename.split(".");
    setImageName(nameExt[0]);
    console.log(`set image name to ${imageName}`);
  }, [setFilename, filename, imageName]);

  const defaultValues = {
    size: "sm",
    width: 200,
    height: 300
  };

  const initialValues = coverImage
    ? {
        imageName: coverImage.imageName,
        fileExtension: coverImage.fileExtension,
        imageUrl: coverImage.imageUrl,
        altText: coverImage.altText,
        ...defaultValues
      }
    : {
        imageName: "",
        fileExtension: "",
        imageUrl: "",
        altText: "",
        ...defaultValues
      };

  const validationObject = {
    imageName: Yup.string().max(20, "Must be 20 characters or fewer.").required("Required"),
    altText: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required")
  };

  // used to take the cropped image up from the Image Editor
  const [blobUrl, setBlobUrl] = useState<string>();

  const getBlobUrl = (blobUrl: string) => {
    // get blob from ImageEditor
    setBlobUrl(blobUrl);
  };

  const handleClose = () => {
    // reset the modal
    setHasChanges(false);
    setModalIsOpen(false);
  };

  /**
   * Fetch blob using blobUrl (blobUrl is a DOMString in the form of "blob:http:")
   * Take filename from image's path or from form
   * Create new file using blob & filename
   *
   *
   * SHOULD USE MUTATION HERE TO:
   * 1. Delete existing cover image
   *    - delete Image from database
   *    - delete image file from S3 bucket
   * 2. Create new cover image
   *    - add new Image to database
   *    - add image to S3 bucket
   *    - associate image with Photographer / Location / Subject, etc.
   *
   * imageUrl (baseUrl + image name from form field as pathname)
   * altText (from form field)
   * fileType = get it from blob.type in handleSave()
   * fileExtension
   * size ="sm"
   * width = 200
   * height = 300
   */

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

  const uploadImage = async (filename: string) => {
    if (blobUrl && blobUrl !== null) {
      console.log(`blob url: ${blobUrl}`);

      const response = await fetch(blobUrl);
      const blob = await response.blob();

      console.log(`got blob: ${blob} ${blob.size} ${blob.type}`);

      setImageUrl(blobUrl);
      // const result = await readFile(blob);

      // let base64String;

      // if (typeof result !== "string") {
      //   return;
      // } else {
      //   base64String = result;
      // }

      // console.log(`image data: ${base64String}`);

      // use blob.type to get fileExtension and contentType
      const contentType = blob.type;
      const file = new File([blob], "scott.png", {
        type: contentType,
        lastModified: Date.now()
      });
      console.log(`should be saving file: ${file} ${file.name} ${file.type} ${file.size}`);
      // Upload(file);
    }
  };

  return (
    <>
      {modalIsOpen && (
        <NextPortal selector="#modal">
          <Box
            className="backdrop"
            alignX="center"
            alignY="center"
            style={{
              position: "fixed",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            }}
          >
            <Box
              className="modal"
              backgroundColor="white"
              position="relative"
              maxWidth="800px"
              marginX="auto"
              padding="major-3"
              borderRadius="6px"
            >
              <ImageEditor
                imageSrc={coverImage?.imageUrl}
                getBlobUrl={getBlobUrl}
                setHasChanges={setHasChanges}
                setFilename={setFilename}
                setFileExtension={setFileExtension}
              />
              <Flex
                className="fields-wrapper"
                flexDirection="column"
                margin="major-3"
                flex="2 1 50%"
              >
                <Formik
                  initialValues={initialValues}
                  validationSchema={Yup.object(validationObject)}
                  onSubmit={values => {
                    uploadImage(values.imageName);

                    const input = {
                      imageName: values.imageName,
                      fileExtension: fileExtension,
                      imageUrl: baseUrl + values.imageName + fileExtension,
                      altText: values.altText,
                      size: "sm",
                      width: 200,
                      height: 300
                    };

                    console.log(`input: ${JSON.stringify(input, null, 2)}`);

                    // if (isEditing && coverImage) {
                    //   const editVariables: UpdateImageMutationVariables = {
                    //     id: parseInt(coverImage.id),
                    //     input
                    //   };
                    //   updateImage({
                    //     variables: editVariables
                    //   });
                    // } else {
                    //   const addVariables: AddImageMutationVariables = {
                    //     input
                    //   };
                    //   addImage({ variables: addVariables });
                    // }
                  }}
                >
                  <Form autoComplete="off" style={{ margin: 0, width: "100%" }}>
                    <FieldStack orientation="horizontal" spacing="major-2">
                      <Field
                        component={InputField.Formik}
                        name="imageName"
                        label="Image name"
                        type="text"
                        autoComplete="off"
                        default={coverImage?.imageName}
                        value={imageName}
                      />
                      <Field
                        component={InputField.Formik}
                        name="altText"
                        label="Alt text"
                        type="text"
                        autocomplete="off"
                        default={coverImage?.altText}
                      />
                    </FieldStack>
                    <Flex width="100%" alignX="right" marginTop="major-2" marginRight="major-1">
                      <Button size="small" onClick={() => handleClose()}>
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        palette="primary"
                        marginLeft="major-2"
                        disabled={!hasChanges}
                        type="submit"
                      >
                        Save Changes
                      </Button>
                    </Flex>
                  </Form>
                </Formik>
              </Flex>
            </Box>
          </Box>
        </NextPortal>
      )}
    </>
  );
};

export default Modal;
