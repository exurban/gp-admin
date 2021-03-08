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
  Print,
  SearchPrintsDocument,
  AddPrintDocument,
  AddPrintInput,
  AddPrintMutationVariables,
  UpdatePrintDocument,
  UpdatePrintInput,
  UpdatePrintMutationVariables,
  PhotoEditOptionsDocument
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageModal from "./CoverImageModal";

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
  item: Print | undefined;
  setSelectedItem: Dispatch<SetStateAction<Print | undefined>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const PrintForm: React.FC<Props> = ({
  item: pr,
  setSelectedItem,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const [imageUrl, setImageUrl] = useState(pr?.coverImage?.imageUrl);
  const [coverImage, setCoverImage] = useState<Image | null | undefined>(pr?.coverImage);

  const toasts = useToasts();
  const [addPrint] = useMutation(AddPrintDocument, {
    refetchQueries: [
      {
        query: SearchPrintsDocument,
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
      console.log(`data.addPrint: ${JSON.stringify(data.addPrint, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addPrint.newPrint?.name}.`
      });
    }
  });

  const [updatePrint] = useMutation(UpdatePrintDocument, {
    refetchQueries: [
      {
        query: SearchPrintsDocument,
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
        message: `Updated ${data.updatePrint.updatedPrint?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues = {
    name: pr?.name || "",
    type: pr?.type || "",
    description: pr?.description || "",
    printSku: pr?.printSku || "",
    dimension1: pr?.dimension1 || 0,
    dimension2: pr?.dimension2 || 0,
    shippingCost: pr?.shippingCost || 0,
    cost: pr?.cost || 0,
    basePrice: pr?.basePrice || 100,
    priceModifier: pr?.priceModifier || 1
  };

  const validationObject = {
    name: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required"),
    description: Yup.string().required("Required")
  };

  const handleAdd = (values: AddPrintInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };
    console.log(`Adding Print with input: ${JSON.stringify(input, null, 2)}`);

    if (isAdding) {
      const addVariables: AddPrintMutationVariables = {
        input
      };
      addPrint({
        variables: addVariables,
        refetchQueries: [
          {
            query: SearchPrintsDocument,
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

  const handleUpdate = (values: UpdatePrintInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };

    if (isEditing && pr) {
      const editVariables: UpdatePrintMutationVariables = {
        id: parseInt(pr.id),
        input
      };
      updatePrint({
        variables: editVariables,
        refetchQueries: [
          {
            query: SearchPrintsDocument,
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
            name={pr?.name || ""}
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
              <FieldStack orientation="horizontal">
                <Field
                  component={InputField.Formik}
                  name="type"
                  label="Type"
                  type="text"
                  autoComplete="off"
                  value="type"
                />
                <Field
                  component={InputField.Formik}
                  name="printSku"
                  label="Sku"
                  type="text"
                  autoComplete="off"
                  value="printSku"
                />
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
        {pr?.id && <Text>id: {pr.id}</Text>}
        {pr?.__typename && <Text>type: {pr.__typename}</Text>}
        {pr?.createdAt && <Text>Created: {new Date(pr.createdAt).toDateString()}</Text>}
        {pr?.updatedAt && <Text>Updated: {new Date(pr.updatedAt).toDateString()}</Text>}
      </Flex>
    </Flex>
  );
};

export default PrintForm;
