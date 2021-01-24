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
  AddLocationDocument,
  AddLocationMutationVariables,
  Location,
  SearchLocationsDocument,
  UpdateLocationDocument,
  UpdateLocationMutationVariables
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
  item: Location | undefined;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const LocationForm: React.FC<Props> = ({
  item: loc,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const toasts = useToasts();
  const [addLocation] = useMutation(AddLocationDocument, {
    onCompleted(data) {
      console.log(`data.addLocation: ${JSON.stringify(data.addLocation, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addLocation.name}.`
      });
    }
  });
  const [updateLocation] = useMutation(UpdateLocationDocument, {
    onCompleted(data) {
      clearForm();
      toasts.success({
        title: `Successfully updated`,
        message: `Updated ${data.updateLocation?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues =
    isEditing && loc
      ? {
          name: loc.name,
          tag: loc.tag,
          description: loc.description
          // coverImageId: parseInt(pg.coverImage?.id) || undefined
        }
      : {
          name: "",
          tag: "",
          description: "",
          coverImageId: undefined
        };

  const validationObject = {
    name: Yup.string().max(50, "Must be 50 characters or fewer.").required("Required"),
    tag: Yup.string().max(20, "Must be 20 characters or fewer.").required("Required"),
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
        {loc && <CoverImageEditor coverImage={loc.coverImage} isEditing={true} />}
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(validationObject)}
          onSubmit={values => {
            const input = { ...values };

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
