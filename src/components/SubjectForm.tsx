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
  Subject,
  SearchSubjectsDocument,
  AddSubjectDocument,
  AddSubjectInput,
  AddSubjectMutationVariables,
  UpdateSubjectDocument,
  UpdateSubjectInput,
  UpdateSubjectMutationVariables
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
  item: Subject | undefined;
  setSelectedItem: Dispatch<SetStateAction<Subject | undefined>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const SubjectForm: React.FC<Props> = ({
  item: sbj,
  setSelectedItem,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const [imageUrl, setImageUrl] = useState(sbj?.coverImage?.imageUrl);
  const [coverImage, setCoverImage] = useState<Image | null | undefined>(sbj?.coverImage);

  const toasts = useToasts();
  const [addSubject] = useMutation(AddSubjectDocument, {
    refetchQueries: [
      {
        query: SearchSubjectsDocument,
        variables: {
          input: {
            searchString: ""
          }
        }
      }
    ],
    onCompleted(data) {
      console.log(`data.addSubject: ${JSON.stringify(data.addSubject, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addSubject.newSubject?.name}.`
      });
    }
  });

  const [updateSubject] = useMutation(UpdateSubjectDocument, {
    refetchQueries: [
      {
        query: SearchSubjectsDocument,
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
        message: `Updated ${data.updateSubject?.updatedSubject?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues = {
    name: sbj?.name || "",
    description: sbj?.description || ""
  };

  const validationObject = {
    name: Yup.string().max(16, "Must be 16 characters or fewer.").required("Required"),
    description: Yup.string().required("Required")
  };

  const handleAdd = (values: AddSubjectInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };
    console.log(`Adding Subject with input: ${JSON.stringify(input, null, 2)}`);

    if (isAdding) {
      const addVariables: AddSubjectMutationVariables = {
        input
      };
      addSubject({
        variables: addVariables,
        refetchQueries: [
          {
            query: SearchSubjectsDocument,
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

  const handleUpdate = (values: UpdateSubjectInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    console.log(values);
    const input = { ...values, coverImageId };

    if (isEditing && sbj) {
      const editVariables: UpdateSubjectMutationVariables = {
        id: parseInt(sbj.id),
        input
      };
      updateSubject({
        variables: editVariables,
        refetchQueries: [
          {
            query: SearchSubjectsDocument,
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
            name={sbj?.name || ""}
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
        {sbj?.id && <Text>id: {sbj.id}</Text>}
        {sbj?.__typename && <Text>type: {sbj.__typename}</Text>}
        {sbj?.countOfPhotos && <Text>Count of Photos: {sbj.countOfPhotos}</Text>}
        {sbj?.createdAt && <Text>Created: {new Date(sbj.createdAt).toDateString()}</Text>}
        {sbj?.updatedAt && <Text>Updated: {new Date(sbj.updatedAt).toDateString()}</Text>}
      </Flex>
    </Flex>
  );
};

export default SubjectForm;
