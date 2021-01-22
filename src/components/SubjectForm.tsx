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
  useToasts
} from "bumbag";
import {
  AddSubjectDocument,
  AddSubjectMutationVariables,
  Subject,
  SearchSubjectsDocument,
  UpdateSubjectDocument,
  UpdateSubjectMutationVariables
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageEditor from "./CoverImageEditor";

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
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const SubjectForm: React.FC<Props> = ({
  item: sbj,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const toasts = useToasts();
  const [addSubject] = useMutation(AddSubjectDocument, {
    onCompleted(data) {
      console.log(`data.addSubject: ${JSON.stringify(data.addSubject, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addSubject.name}.`
      });
    }
  });
  const [updateSubject] = useMutation(UpdateSubjectDocument, {
    onCompleted(data) {
      clearForm();
      toasts.success({
        title: `Successfully updated`,
        message: `Updated ${data.updateSubject?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues =
    isEditing && sbj
      ? {
          name: sbj.name,
          description: sbj.description
          // coverImageId: parseInt(pg.coverImage?.id) || undefined
        }
      : {
          name: "",
          description: "",
          coverImageId: undefined
        };

  const validationObject = {
    name: Yup.string().max(16, "Must be 16 characters or fewer.").required("Required"),
    description: Yup.string().required("Required")
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
        {sbj && <CoverImageEditor coverImage={sbj.coverImage} isEditing={true} />}
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(validationObject)}
          onSubmit={values => {
            const input = { ...values };

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
