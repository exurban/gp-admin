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
  Finish,
  SearchFinishesDocument,
  AddFinishDocument,
  AddFinishInput,
  AddFinishMutationVariables,
  UpdateFinishDocument,
  UpdateFinishInput,
  UpdateFinishMutationVariables
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageModal from "./CoverImageModal";

// * name
// * description
// * coverImage
// * finSku
// * width
// * height
// * depth
// * weight
// * shippingWeight
// * basePrice
// * priceModifier
// id
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  item: Finish | undefined;
  setSelectedItem: Dispatch<SetStateAction<Finish | undefined>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const FinishForm: React.FC<Props> = ({
  item: fn,
  setSelectedItem,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const [imageUrl, setImageUrl] = useState(fn?.coverImage?.imageUrl);
  const [coverImage, setCoverImage] = useState<Image | null | undefined>(fn?.coverImage);

  const toasts = useToasts();
  const [addFinish] = useMutation(AddFinishDocument, {
    refetchQueries: [
      {
        query: SearchFinishesDocument,
        variables: {
          input: {
            searchString: ""
          }
        }
      }
    ],
    onCompleted(data) {
      console.log(`data.addFinish: ${JSON.stringify(data.addFinish, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addFinish.newFinish?.name}.`
      });
    }
  });

  const [updateFinish] = useMutation(UpdateFinishDocument, {
    refetchQueries: [
      {
        query: SearchFinishesDocument,
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
        message: `Updated ${data.updateFinish.updatedFinish?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues = {
    name: fn?.name || "",
    description: fn?.description || "",
    finSku: fn?.finSku || "",
    width: fn?.width || 0,
    height: fn?.height || 0,
    depth: fn?.depth || 0,
    weight: fn?.weight || 0,
    shippingWeight: fn?.shippingWeight || 0,
    basePrice: fn?.basePrice || 0,
    priceModifier: fn?.priceModifier || 0
  };

  const validationObject = {
    name: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required"),
    description: Yup.string().required("Required")
  };

  const handleAdd = (values: AddFinishInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };
    console.log(`Adding Finish with input: ${JSON.stringify(input, null, 2)}`);

    if (isAdding) {
      const addVariables: AddFinishMutationVariables = {
        input
      };
      addFinish({
        variables: addVariables,
        refetchQueries: [
          {
            query: SearchFinishesDocument,
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

  const handleUpdate = (values: UpdateFinishInput) => {
    setSelectedItem(undefined);

    // if coverImage is set, add to input
    const coverImageId = coverImage ? parseInt(coverImage.id) : null;

    const input = { ...values, coverImageId };

    if (isEditing && fn) {
      const editVariables: UpdateFinishMutationVariables = {
        id: parseInt(fn.id),
        input
      };
      updateFinish({
        variables: editVariables,
        refetchQueries: [
          {
            query: SearchFinishesDocument,
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
            name={fn?.name || ""}
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
                  name="finSku"
                  label="Type"
                  type="text"
                  autoComplete="off"
                  value="finSku"
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
                  name="width"
                  label="Width"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="width"
                />
                <Field
                  component={InputField.Formik}
                  name="height"
                  label="Height"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="height"
                />
                <Field
                  component={InputField.Formik}
                  name="depth"
                  label="Depth"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="depth"
                />
              </FieldStack>
              <FieldStack orientation="horizontal">
                <Field
                  component={InputField.Formik}
                  name="weight"
                  label="Weight"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="weight"
                />
                <Field
                  component={InputField.Formik}
                  name="shippingWeight"
                  label="Shipping Weight"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value="shippingWeight"
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
        {fn?.id && <Text>id: {fn.id}</Text>}
        {fn?.__typename && <Text>type: {fn.__typename}</Text>}
        {fn?.countOfPhotos && <Text>Count of Photos: {fn.countOfPhotos}</Text>}
        {fn?.createdAt && <Text>Created: {new Date(fn.createdAt).toDateString()}</Text>}
        {fn?.updatedAt && <Text>Updated: {new Date(fn.updatedAt).toDateString()}</Text>}
      </Flex>
    </Flex>
  );
};

export default FinishForm;
