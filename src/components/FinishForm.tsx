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
  AddFinishDocument,
  AddFinishMutationVariables,
  Finish,
  SearchFinishesDocument,
  UpdateFinishDocument,
  UpdateFinishMutationVariables
} from "../graphql-operations";
import { Dispatch, SetStateAction } from "react";
import CoverImageEditor from "./CoverImageEditor";

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
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const FinishForm: React.FC<Props> = ({
  item: fn,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing
}) => {
  const toasts = useToasts();
  const [addFinish] = useMutation(AddFinishDocument, {
    onCompleted(data) {
      console.log(`data.addFinish: ${JSON.stringify(data.addFinish, null, 2)}`);
      clearForm();
      toasts.success({
        title: `Succeessfully added`,
        message: `Added ${data.addFinish.name}.`
      });
    }
  });
  const [updateFinish] = useMutation(UpdateFinishDocument, {
    onCompleted(data) {
      clearForm();
      toasts.success({
        title: `Successfully updated`,
        message: `Updated ${data.updateFinish?.name}`
      });
    }
  });

  const clearForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const initialValues =
    isEditing && fn
      ? {
          name: fn.name,
          description: fn.description,
          finSku: fn.finSku,
          width: fn.width,
          height: fn.height,
          depth: fn.depth,
          weight: fn.weight,
          shippingWeight: fn.shippingWeight,
          basePrice: fn.basePrice,
          priceModifier: fn.priceModifier
          // coverImageId: parseInt(pg.coverImage?.id) || undefined
        }
      : {
          name: "",
          description: "",
          finSku: "",
          width: 0,
          height: 0,
          depth: 0,
          weight: 0,
          shippingWeight: 0,
          basePrice: 0,
          priceModifier: 0,
          coverImageId: undefined
        };

  const validationObject = {
    name: Yup.string().max(30, "Must be 30 characters or fewer.").required("Required"),
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
        {fn && <CoverImageEditor coverImage={fn.coverImage} isEditing={true} />}
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(validationObject)}
          onSubmit={values => {
            const input = { ...values };

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
