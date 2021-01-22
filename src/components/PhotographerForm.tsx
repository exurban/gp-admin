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
  AddPhotographerDocument,
  AddPhotographerMutationVariables,
  Photographer,
  SearchPhotographersDocument,
  UpdatePhotographerDocument,
  UpdatePhotographerMutationVariables
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageEditor from "./CoverImageEditor";

// * firstName
// * lastName
// * email
// * bio
// * coverImage
// id
// name
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  item: Photographer | undefined;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const PhotographerForm: React.FC<Props> = ({
  item: pg,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const toasts = useToasts();
  const [addPhotographer] = useMutation(AddPhotographerDocument, {
    onCompleted(data) {
      console.log(`data.addPhotographer: ${JSON.stringify(data.addPhotographer, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addPhotographer.name}.`
      });
    }
  });
  const [updatePhotographer] = useMutation(UpdatePhotographerDocument, {
    onCompleted(data) {
      clearForm();
      toasts.success({
        title: `Successfully updated`,
        message: `Updated ${data.updatePhotographer?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues =
    isEditing && pg
      ? {
          firstName: pg.firstName,
          lastName: pg.lastName,
          email: pg.email,
          bio: pg.bio
          // coverImageId: parseInt(pg.coverImage?.id) || undefined
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          bio: "",
          coverImageId: undefined
        };

  const validationObject = {
    firstName: Yup.string().max(16, "Must be 16 characters or fewer.").required("Required"),
    lastName: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required"),
    email: Yup.string().email("Invalid email address").required("Required"),
    bio: Yup.string().required("Required")
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
        {pg && <CoverImageEditor coverImage={pg.coverImage} isEditing={true} />}
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(validationObject)}
          onSubmit={values => {
            const name = `${values.firstName} ${values.lastName}`;
            const input = { name, ...values };

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
                  }
                ]
              });
            }
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
                  }
                ]
              });
            }
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
