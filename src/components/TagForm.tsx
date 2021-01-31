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
  Tag,
  SearchTagsDocument,
  AddTagDocument,
  AddTagInput,
  AddTagMutationVariables,
  UpdateTagDocument,
  UpdateTagInput,
  UpdateTagMutationVariables
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageModal from "./CoverImageModal";

// * name
// * description
// * coverImage
// id
// name
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  item: Tag | undefined;
  setSelectedItem: Dispatch<SetStateAction<Tag | undefined>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const TagForm: React.FC<Props> = ({
  item: tag,
  setSelectedItem,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const [imageUrl, setImageUrl] = useState(tag?.coverImage?.imageUrl);
  const [coverImage, setCoverImage] = useState<Image | null | undefined>(tag?.coverImage);

  const toasts = useToasts();
  const [addTag] = useMutation(AddTagDocument, {
    refetchQueries: [
      {
        query: SearchTagsDocument,
        variables: {
          input: {
            searchString: ""
          }
        }
      }
    ],
    onCompleted(data) {
      console.log(`data.addTag: ${JSON.stringify(data.addTag, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addTag.newTag?.name}.`
      });
    }
  });

  const [updateTag] = useMutation(UpdateTagDocument, {
    refetchQueries: [
      {
        query: SearchTagsDocument,
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
        message: `Updated ${data.updateTag?.updatedTag?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues = {
    name: tag?.name || "",
    description: tag?.description || ""
  };

  const validationObject = {
    name: Yup.string().max(16, "Must be 16 characters or fewer.").required("Required"),
    description: Yup.string().required("Required")
  };

  const handleAdd = (values: AddTagInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };
    console.log(`Adding Photographer with input: ${JSON.stringify(input, null, 2)}`);

    if (isAdding) {
      const addVariables: AddTagMutationVariables = {
        input
      };
      addTag({
        variables: addVariables,
        refetchQueries: [
          {
            query: SearchTagsDocument,
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

  const handleUpdate = (values: UpdateTagInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    console.log(values);
    const input = { ...values, coverImageId };

    if (isEditing && tag) {
      const editVariables: UpdateTagMutationVariables = {
        id: parseInt(tag.id),
        input
      };
      updateTag({
        variables: editVariables,
        refetchQueries: [
          {
            query: SearchTagsDocument,
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
            name={tag?.name || ""}
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
              />
              <Field
                component={TextareaField.Formik}
                name="description"
                label="Description"
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
        {tag?.id && <Text>id: {tag.id}</Text>}
        {tag?.__typename && <Text>type: {tag.__typename}</Text>}
        {tag?.countOfPhotos && <Text>Count of Photos: {tag.countOfPhotos}</Text>}
        {tag?.createdAt && <Text>Created: {new Date(tag.createdAt).toDateString()}</Text>}
        {tag?.updatedAt && <Text>Updated: {new Date(tag.updatedAt).toDateString()}</Text>}
      </Flex>
    </Flex>
  );
};

export default TagForm;
