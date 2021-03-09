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
  Frame,
  SearchFramesDocument,
  AddFrameDocument,
  AddFrameInput,
  AddFrameMutationVariables,
  UpdateFrameDocument,
  UpdateFrameInput,
  UpdateFrameMutationVariables,
  PhotoEditOptionsDocument
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";

// * name
// * type
// * description
// * coverImage
// * printSku
// * dimension1
// * dimension2
// * shippingCost
// * basePrice
// * priceModifier
// id
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  item: Frame | undefined;
  setSelectedItem: Dispatch<SetStateAction<Frame | undefined>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const FrameForm: React.FC<Props> = ({
  item: fr,
  setSelectedItem,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const toasts = useToasts();
  const [addFrame] = useMutation(AddFrameDocument, {
    refetchQueries: [
      {
        query: SearchFramesDocument,
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
      console.log(`data.addMat: ${JSON.stringify(data.addFrame, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addFrame.newFrame?.name}.`
      });
    }
  });

  const [updateFrame] = useMutation(UpdateFrameDocument, {
    refetchQueries: [
      {
        query: SearchFramesDocument,
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
        message: `Updated ${data.updateFrame.updatedFrame?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues = {
    name: fr?.name || "",
    displayName: fr?.displayName || "",
    description: fr?.description || "",
    material: fr?.material || "",
    color: fr?.color || "",
    printType: fr?.printType || "",
    frameSku: fr?.frameSku || "",
    dimension1: fr?.dimension1 || 0,
    dimension2: fr?.dimension2 || 0,
    cost: fr?.cost || 0,
    shippingCost: fr?.shippingCost || 0,
    basePrice: fr?.basePrice || 100,
    priceModifier: fr?.priceModifier || 1
  };

  const validationObject = {
    name: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required"),
    description: Yup.string().required("Required")
  };

  const handleAdd = (values: AddFrameInput) => {
    setSelectedItem(undefined);

    const input = { ...values };

    if (isAdding) {
      const addVariables: AddFrameMutationVariables = {
        input
      };
      addFrame({
        variables: addVariables,
        refetchQueries: [
          {
            query: SearchFramesDocument,
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

  const handleUpdate = (values: UpdateFrameInput) => {
    setSelectedItem(undefined);

    const input = { ...values };

    if (isEditing && fr) {
      const editVariables: UpdateFrameMutationVariables = {
        id: parseInt(fr.id),
        input
      };
      updateFrame({
        variables: editVariables,
        refetchQueries: [
          {
            query: SearchFramesDocument,
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

  const imageUrl = fr?.coverImage?.imageUrl;

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
        {imageUrl && imageUrl.length > 0 && (
          <img
            key={Date.now()}
            src={imageUrl}
            width="225px"
            height="225px"
            style={{ borderRadius: "6px" }}
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
                name="displayName"
                label="Display Name"
                type="text"
                autoComplete="off"
                value="displayName"
              />
              <FieldStack orientation="horizontal">
                <Field
                  component={InputField.Formik}
                  name="printType"
                  label="Print Type"
                  type="text"
                  autoComplete="off"
                  value="printType"
                />
                <Field
                  component={InputField.Formik}
                  name="material"
                  label="Material"
                  type="text"
                  autoComplete="off"
                  value="material"
                />
                <Field
                  component={InputField.Formik}
                  name="color"
                  label="Color"
                  type="text"
                  autoComplete="off"
                  value="color"
                />
                <Field
                  component={InputField.Formik}
                  name="frameSku"
                  label="Sku"
                  type="text"
                  autoComplete="off"
                  value="frameSku"
                />
              </FieldStack>
              <FieldStack orientation="horizontal">
                <Field
                  component={InputField.Formik}
                  name="basePrice"
                  label="Base Price"
                  type="number"
                  autoComplete="off"
                  value="basePrice"
                />
                <Field
                  component={InputField.Formik}
                  name="priceModifier"
                  label="Price modifier"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="priceModifier"
                />
                <Field
                  component={InputField.Formik}
                  name="cost"
                  label="Cost"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="cost"
                />
              </FieldStack>
              <FieldStack orientation="horizontal">
                <Field
                  component={InputField.Formik}
                  name="dimension1"
                  label="Shorter Dimension"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="width"
                />
                <Field
                  component={InputField.Formik}
                  name="dimension2"
                  label="Longer Dimension"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="height"
                />
                <Field
                  component={InputField.Formik}
                  name="shippingCost"
                  label="Shipping Cost"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="shippingCost"
                />
              </FieldStack>
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
        {fr?.id && <Text>id: {fr.id}</Text>}
        {fr?.__typename && <Text>type: {fr.__typename}</Text>}
        {fr?.createdAt && <Text>Created: {new Date(fr.createdAt).toDateString()}</Text>}
        {fr?.updatedAt && <Text>Updated: {new Date(fr.updatedAt).toDateString()}</Text>}
      </Flex>
    </Flex>
  );
};

export default FrameForm;
