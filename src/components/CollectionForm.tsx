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
  AddCollectionDocument,
  AddCollectionMutationVariables,
  Collection,
  SearchCollectionsDocument,
  UpdateCollectionDocument,
  UpdateCollectionMutationVariables
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageEditor from "./CoverImageEditor";

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
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const CollectionForm: React.FC<Props> = ({
  item: col,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const toasts = useToasts();
  const [addCollection] = useMutation(AddCollectionDocument, {
    onCompleted(data) {
      console.log(`data.addCollection: ${JSON.stringify(data.addCollection, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addCollection.name}.`
      });
    }
  });
  const [updateCollection] = useMutation(UpdateCollectionDocument, {
    onCompleted(data) {
      clearForm();
      toasts.success({
        title: `Successfully updated`,
        message: `Updated ${data.updateCollection?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues =
    isEditing && col
      ? {
          name: col.name,
          tag: col.tag,
          description: col.description
          // coverImageId: parseInt(pg.coverImage?.id) || undefined
        }
      : {
          name: "",
          tag: "",
          description: "",
          coverImageId: undefined
        };

  const validationObject = {
    name: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required"),
    tag: Yup.string().max(10, "Must be 10 characters or fewer.").required("Required"),
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
        {col && <CoverImageEditor coverImage={col.coverImage} isEditing={true} />}
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(validationObject)}
          onSubmit={values => {
            const input = { ...values };

            if (isAdding) {
              const addVariables: AddCollectionMutationVariables = {
                input
              };
              addCollection({
                variables: addVariables,
                refetchQueries: [
                  {
                    query: SearchCollectionsDocument,
                    variables: {
                      input: {
                        searchString: ""
                      }
                    }
                  }
                ]
              });
            }
            if (isEditing && col) {
              const editVariables: UpdateCollectionMutationVariables = {
                id: parseInt(col.id),
                input
              };
              updateCollection({
                variables: editVariables,
                refetchQueries: [
                  {
                    query: SearchCollectionsDocument,
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
