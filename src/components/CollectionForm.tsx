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
  Collection,
  SearchCollectionsDocument,
  AddCollectionDocument,
  AddCollectionInput,
  AddCollectionMutationVariables,
  UpdateCollectionDocument,
  UpdateCollectionInput,
  UpdateCollectionMutationVariables,
  PhotoEditOptionsDocument
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
  item: Collection | undefined;
  setSelectedItem: Dispatch<SetStateAction<Collection | undefined>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const CollectionForm: React.FC<Props> = ({
  item: col,
  setSelectedItem,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const [imageUrl, setImageUrl] = useState(col?.coverImage?.imageUrl);
  const [coverImage, setCoverImage] = useState<Image | null | undefined>(col?.coverImage);

  const toasts = useToasts();
  const [addCollection] = useMutation(AddCollectionDocument, {
    refetchQueries: [
      {
        query: SearchCollectionsDocument,
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
      console.log(`data.addCollection: ${JSON.stringify(data.addCollection, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addCollection.newCollection?.name}.`
      });
    }
  });
  const [updateCollection] = useMutation(UpdateCollectionDocument, {
    refetchQueries: [
      {
        query: SearchCollectionsDocument,
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
        message: `Updated ${data.updateCollection.updatedCollection?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues = {
    name: col?.name || "",
    tag: col?.tag || "",
    description: col?.description || ""
  };

  const validationObject = {
    name: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required"),
    tag: Yup.string().max(10, "Must be 10 characters or fewer.").required("Required"),
    description: Yup.string().required("Required")
  };

  const handleAdd = (values: AddCollectionInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };

    if (isAdding) {
      const addVariables: AddCollectionMutationVariables = {
        input
      };

      addCollection({
        variables: addVariables
      });
    }
    clearForm();
  };

  const handleUpdate = (values: UpdateCollectionInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };

    if (isEditing && col) {
      const editVariables: UpdateCollectionMutationVariables = {
        id: parseInt(col.id),
        input
      };
      updateCollection({
        variables: editVariables
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
            name={col?.name || ""}
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
        {col?.id && <Text>id: {col.id}</Text>}
        {col?.__typename && <Text>type: {col.__typename}</Text>}
        {col?.countOfPhotos && <Text>Count of Photos: {col.countOfPhotos}</Text>}
        {col?.createdAt && <Text>Created: {new Date(col.createdAt).toDateString()}</Text>}
        {col?.updatedAt && <Text>Updated: {new Date(col.updatedAt).toDateString()}</Text>}
      </Flex>
    </Flex>
  );
};

export default CollectionForm;
