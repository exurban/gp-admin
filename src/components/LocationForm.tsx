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
  Box,
  useToasts
} from "bumbag";
import {
  Image,
  Location,
  SearchLocationsDocument,
  AddLocationDocument,
  AddLocationInput,
  AddLocationMutationVariables,
  UpdateLocationDocument,
  UpdateLocationInput,
  UpdateLocationMutationVariables
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageModal from "./CoverImageModal";

// * name
// * tag
// * description
// * coverImage
// id
// name
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  item: Location | undefined;
  setSelectedItem: Dispatch<SetStateAction<Location | undefined>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const LocationForm: React.FC<Props> = ({
  item: loc,
  setSelectedItem,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const [imageUrl, setImageUrl] = useState(loc?.coverImage?.imageUrl);
  const [coverImage, setCoverImage] = useState<Image | null | undefined>(loc?.coverImage);

  const toasts = useToasts();
  const [addLocation] = useMutation(AddLocationDocument, {
    refetchQueries: [
      {
        query: SearchLocationsDocument,
        variables: {
          input: {
            searchString: ""
          }
        }
      }
    ],
    onCompleted(data) {
      console.log(`data.addLocation: ${JSON.stringify(data.addLocation, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addLocation.newLocation?.name}.`
      });
    }
  });

  const [updateLocation] = useMutation(UpdateLocationDocument, {
    refetchQueries: [
      {
        query: SearchLocationsDocument,
        variables: {
          input: {
            searchString: ""
          }
        }
      }
    ],
    onCompleted(data) {
      clearForm();
      toasts.success({
        title: `Successfully updated`,
        message: `Updated ${data.updateLocation?.updatedLocation?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues = {
    name: loc?.name || "",
    tag: loc?.tag || "",
    description: loc?.description || ""
  };

  const validationObject = {
    name: Yup.string().max(50, "Must be 50 characters or fewer.").required("Required"),
    tag: Yup.string().max(20, "Must be 20 characters or fewer.").required("Required"),
    description: Yup.string().required("Required")
  };

  const handleAdd = (values: AddLocationInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };
    console.log(`Adding Location with input: ${JSON.stringify(input, null, 2)}`);

    if (isAdding) {
      const addVariables: AddLocationMutationVariables = {
        input
      };
      addLocation({
        variables: addVariables,
        refetchQueries: [
          {
            query: SearchLocationsDocument,
            variables: {
              input: {
                searchString: ""
              }
            }
          }
        ]
      });
    }
    clearForm();
  };

  const handleUpdate = (values: UpdateLocationInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    console.log(values);
    const input = { ...values, coverImageId };

    if (isEditing && loc) {
      const editVariables: UpdateLocationMutationVariables = {
        id: parseInt(loc.id),
        input
      };
      updateLocation({
        variables: editVariables,
        refetchQueries: [
          {
            query: SearchLocationsDocument,
            variables: {
              input: {
                searchString: ""
              }
            }
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
            name={loc?.name || ""}
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
            isAdding ? handleAdd(values) : handleUpdate(values);
          }}
        >
          <Form autoComplete="off" style={{ margin: 0, width: "100%" }}>
            <FieldStack orientation="vertical" spacing="major-2">
              <Field
                component={InputField.Formik}
                name="name"
                label="Name"
                type="text"
                autoComplete="off"
                value="name"
              />
              <Field
                component={InputField.Formik}
                name="tag"
                label="Tag"
                type="text"
                autoComplete="off"
                value="tag"
              />
              <Field
                component={TextareaField.Formik}
                name="description"
                label="Description"
                value="description"
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
        {loc?.id && <Text>id: {loc.id}</Text>}
        {loc?.__typename && <Text>type: {loc.__typename}</Text>}
        {loc?.countOfPhotos && <Text>Count of Photos: {loc.countOfPhotos}</Text>}
        {loc?.createdAt && <Text>Created: {new Date(loc.createdAt).toDateString()}</Text>}
        {loc?.updatedAt && <Text>Updated: {new Date(loc.updatedAt).toDateString()}</Text>}
      </Flex>
    </Flex>
  );
};

export default LocationForm;
