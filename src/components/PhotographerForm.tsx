import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useMutation } from "@apollo/client";

import {
  Flex,
  Stack,
  FieldStack,
  InputField,
  TextareaField,
  ActionButtons,
  Text,
  useToasts,
  Box
} from "bumbag";
import {
  Image,
  Photographer,
  SearchPhotographersDocument,
  AddPhotographerDocument,
  AddPhotographerInput,
  AddPhotographerMutationVariables,
  UpdatePhotographerInput,
  UpdatePhotographerDocument,
  UpdatePhotographerMutationVariables,
  PhotoEditOptionsDocument
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageModal from "./CoverImageModal";

// * firstName
// * lastName
// * email
// * bio
// * coverImage
//    imageName: `bio_${photographer.name}${mimetype}`
//    imageUrl: comes from url in upload response
// id
// name
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  item: Photographer | undefined;
  setSelectedItem: Dispatch<SetStateAction<Photographer | undefined>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const PhotographerForm: React.FC<Props> = ({
  item: pg,
  setSelectedItem,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const [imageUrl, setImageUrl] = useState(pg?.coverImage?.imageUrl);
  const [coverImage, setCoverImage] = useState<Image | null | undefined>(pg?.coverImage);

  const toasts = useToasts();
  const [addPhotographer] = useMutation(AddPhotographerDocument, {
    refetchQueries: [
      {
        query: SearchPhotographersDocument,
        variables: {
          input: {
            searchString: ""
          }
        }
      },
      {
        query: PhotoEditOptionsDocument
      }
    ],
    onCompleted(data) {
      console.log(`data.addPhotographer: ${JSON.stringify(data.addPhotographer, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addPhotographer.newPhotographer?.name}.`
      });
    }
  });

  const [updatePhotographer] = useMutation(UpdatePhotographerDocument, {
    refetchQueries: [
      {
        query: SearchPhotographersDocument,
        variables: {
          input: {
            searchString: ""
          }
        }
      },
      {
        query: PhotoEditOptionsDocument
      }
    ],
    onCompleted(data) {
      clearForm();
      toasts.success({
        title: `Successfully updated`,
        message: `Updated ${data.updatePhotographer.updatedPhotographer?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues = {
    firstName: pg?.firstName || "",
    lastName: pg?.lastName || "",
    email: pg?.email || "",
    bio: pg?.bio || ""
  };

  const validationObject = {
    firstName: Yup.string().max(16, "Must be 16 characters or fewer.").required("Required"),
    lastName: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required"),
    email: Yup.string().email("Invalid email address").required("Required"),
    bio: Yup.string().required("Required")
  };

  const handleAdd = (values: AddPhotographerInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const name = `${values.firstName} ${values.lastName}`;
    const input = { ...values, name, coverImageId };
    console.log(`Adding Photographer with input: ${JSON.stringify(input, null, 2)}`);

    if (isAdding) {
      const addVariables: AddPhotographerMutationVariables = {
        input
      };
      addPhotographer({
        variables: addVariables,
        refetchQueries: [
          {
            query: SearchPhotographersDocument,
            variables: {
              input: {
                searchString: ""
              }
            }
          },
          {
            query: PhotoEditOptionsDocument
          }
        ]
      });
    }
    clearForm();
  };

  const handleUpdate = (values: UpdatePhotographerInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    console.log(values);
    const name = `${values.firstName} ${values.lastName}`;
    const input = { ...values, name, coverImageId };

    if (isEditing && pg) {
      const editVariables: UpdatePhotographerMutationVariables = {
        id: parseInt(pg.id),
        input
      };
      updatePhotographer({
        variables: editVariables,
        refetchQueries: [
          {
            query: SearchPhotographersDocument,
            variables: {
              input: {
                searchString: ""
              }
            }
          },
          {
            query: PhotoEditOptionsDocument
          }
        ]
      });
    }
    clearForm();
  };

  return (
    <Flex className="form-wrapper">
      <Flex
        className="image-wrapper"
        flexDirection="column"
        margin="major-2"
        marginTop="30px"
        flex="1 1 25%"
        alignItems="flex-end"
        padding="major-2"
      >
        {imageUrl && imageUrl.length > 0 ? (
          <img
            key={Date.now()}
            src={imageUrl}
            width="200px"
            height="300px"
            style={{ borderRadius: "6px" }}
          />
        ) : (
          <Box
            width="200px"
            height="300px"
            backgroundColor="default"
            border="1px solid"
            borderColor="grey800"
            borderRadius="6px"
            alignX="center"
            alignY="center"
          >
            No Cover Image
          </Box>
        )}
        {(isAdding || isEditing) && (
          <CoverImageModal
            coverImage={coverImage}
            setCoverImage={setCoverImage}
            name={pg?.name || ""}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
          />
        )}
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(validationObject)}
          onSubmit={values => {
            // @ts-ignore
            isAdding ? handleAdd(values) : handleUpdate(values);
          }}
        >
          <Form autoComplete="off" style={{ margin: 0, width: "100%" }}>
            <FieldStack spacing="major-2">
              <FieldStack orientation="horizontal">
                <Field
                  component={InputField.Formik}
                  name="firstName"
                  label="First name"
                  type="text"
                  autoComplete="off"
                />
                <Field
                  component={InputField.Formik}
                  name="lastName"
                  label="Last name"
                  type="text"
                  autocomplete="off"
                />
              </FieldStack>
              <Field
                component={InputField.Formik}
                name="email"
                label="Email"
                type="text"
                autocomplete="off"
              />
              <Field
                component={TextareaField.Formik}
                name="bio"
                label="Bio"
                rows={6}
                textareaProps={{ rows: 6, resize: "none" }}
              />
            </FieldStack>
            <Stack direction="horizontal" marginY="major-2">
              <ActionButtons type="submit" alignX="right" onClickCancel={() => clearForm()} />
            </Stack>
          </Form>
        </Formik>
      </Flex>
      <Flex
        className="data-wrapper"
        flexDirection="column"
        margin="major-2"
        marginTop="60px"
        flex="1 1 25%"
        fontSize="100"
      >
        {pg?.id && <Text>id: {pg.id}</Text>}
        {pg?.__typename && <Text>type: {pg.__typename}</Text>}
        {pg?.countOfPhotos && <Text>Count of Photos: {pg.countOfPhotos}</Text>}
        {pg?.createdAt && <Text>Created: {new Date(pg.createdAt).toDateString()}</Text>}
        {pg?.updatedAt && <Text>Updated: {new Date(pg.updatedAt).toDateString()}</Text>}
      </Flex>
    </Flex>
  );
};

export default PhotographerForm;
