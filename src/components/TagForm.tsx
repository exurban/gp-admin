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
  AddTagDocument,
  AddTagMutationVariables,
  Tag,
  SearchTagsDocument,
  UpdateTagDocument,
  UpdateTagMutationVariables
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
  item: Tag | undefined;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const TagForm: React.FC<Props> = ({
  item: tag,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const toasts = useToasts();
  const [addTag] = useMutation(AddTagDocument, {
    onCompleted(data) {
      console.log(`data.addTag: ${JSON.stringify(data.addTag, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addTag.name}.`
      });
    }
  });
  const [updateTag] = useMutation(UpdateTagDocument, {
    onCompleted(data) {
      clearForm();
      toasts.success({
        title: `Successfully updated`,
        message: `Updated ${data.updateTag?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues =
    isEditing && tag
      ? {
          name: tag.name,
          description: tag.description
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
        {tag && <CoverImageEditor coverImage={tag.coverImage} isEditing={true} />}
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(validationObject)}
          onSubmit={values => {
            const input = { ...values };

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
