import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  SearchPhotosDocument,
  Image,
  PhotoEditOptionsDocument,
  UpdatePhotoDocument,
  UpdatePhotoInput,
  UpdatePhotoMutationVariables,
  PhotoInfoFragment
} from "../graphql-operations";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import PhotoImage from "./PhotoImage";
import SharingImageModal from "./SharingImageModal";

import {
  Level,
  Divider,
  Box,
  Flex,
  Button,
  Stack,
  Heading,
  Text,
  FieldStack,
  Input,
  InputField,
  Switch,
  TextareaField,
  SelectMenuField,
  Label,
  styled,
  useToasts
} from "bumbag";

type SaveImageResponse = {
  success: boolean;
  message: string;
  image?: Image | undefined;
};

interface PhotoImageEditorRef {
  saveImage: () => SaveImageResponse;
}

type MenuOption = {
  key: number;
  label: string;
  value: string;
};

type Props = {
  photo: PhotoInfoFragment;
  isEditing: boolean;
};

const PhotoForm: React.FC<Props> = ({ photo, isEditing }) => {
  const imageEditorRef = useRef<PhotoImageEditorRef>();
  const [imageUrl, setImageUrl] = useState(photo?.sharingImage?.imageUrl);
  const [sharingImage, setSharingImage] = useState<Image | null | undefined>(photo?.sharingImage);

  const router = useRouter();
  const [photoTitle, setPhotoTitle] = useState("");
  const [photographerSelectionOptions, setPhotographerSelectionOptions] = useState<
    MenuOption[] | []
  >([]);
  const [locationSelectionOptions, setLocationSelectionOptions] = useState<MenuOption[] | []>([]);
  const [subjectSelectionOptions, setSubjectSelectionOptions] = useState<MenuOption[] | []>([]);
  const [tagSelectionOptions, setTagSelectionOptions] = useState<MenuOption[] | []>([]);
  const [collectionSelectionOptions, setCollectionSelectionOptions] = useState<MenuOption[] | []>(
    []
  );

  const [initialized, setInitialized] = useState(false);
  const toasts = useToasts();

  // * BUILD MENUS
  useQuery(PhotoEditOptionsDocument, {
    onCompleted(data) {
      const pgOptions = data?.photoEditOptions?.photographers?.map(pg => {
        const menuOption: MenuOption = {
          key: pg.id,
          label: pg.name,
          value: pg.id.toString()
        };
        return menuOption;
      });
      setPhotographerSelectionOptions(pgOptions);

      // const initialPg = photographerSelectionOptions?.find(
      //   x => x.value === photo?.photographer?.id
      // );
      // setInitialPhotographer(initialPg);

      const locOptions = data?.photoEditOptions?.locations?.map(l => {
        const menuOption: MenuOption = {
          key: l.id,
          label: l.name,
          value: l.id.toString()
        };
        return menuOption;
      });
      setLocationSelectionOptions(locOptions);

      // const initialLoc = locationSelectionOptions?.find(x => x.value === photo?.location?.id);
      // setInitialLocation(initialLoc);

      const subjOptions = data?.photoEditOptions?.subjects?.map(s => {
        const menuOption: MenuOption = {
          key: s.id,
          label: s.name,
          value: s.id.toString()
        };
        return menuOption;
      });
      setSubjectSelectionOptions(subjOptions);

      const tagOptions = data?.photoEditOptions?.tags?.map(t => {
        const menuOption: MenuOption = {
          key: t.id,
          label: t.name,
          value: t.id.toString()
        };
        return menuOption;
      });
      setTagSelectionOptions(tagOptions);

      const collOptions = data?.photoEditOptions?.collections?.map(c => {
        const menuOption: MenuOption = {
          key: c.id,
          label: c.name,
          value: c.id.toString()
        };
        return menuOption;
      });
      setCollectionSelectionOptions(collOptions);

      setInitialized(true);
    }
  });

  // * set initial values

  // const photographerSelectionOptions = data?.photoEditOptions?.photographers?.map(pg => {
  //   const menuOption: MenuOption = {
  //     key: pg.id,
  //     label: pg.name,
  //     value: pg.id.toString()
  //   };
  //   return menuOption;
  // });

  // const locationSelectionOptions = data?.photoEditOptions?.locations?.map(l => {
  //   const menuOption: MenuOption = {
  //     key: l.id,
  //     label: l.name,
  //     value: l.id.toString()
  //   };
  //   return menuOption;
  // });

  // const subjectSelectionOptions = data?.photoEditOptions?.subjects?.map(s => {
  //   const menuOption: MenuOption = {
  //     key: s.id,
  //     label: s.name,
  //     value: s.id.toString()
  //   };
  //   return menuOption;
  // });

  /**
   * Map all possible tags into menu options.
   */
  // const tagSelectionOptions = data?.photoEditOptions?.tags?.map(t => {
  //   const menuOption: MenuOption = {
  //     key: t.id,
  //     label: t.name,
  //     value: t.id.toString()
  //   };
  //   return menuOption;
  // });

  /**
   * Map all possible collections into menu options.
   */
  // const collectionSelectionOptions = data?.photoEditOptions?.collections?.map(c => {
  //   const menuOption: MenuOption = {
  //     key: c.id,
  //     label: c.name,
  //     value: c.id.toString()
  //   };
  //   return menuOption;
  // });

  /**
   * Map all possible finishes into menu options.
   */
  // const finishSelectionOptions = data?.photoEditOptions?.finishes?.map(f => {
  //   const menuOption: MenuOption = {
  //     key: f.id,
  //     label: f.name,
  //     value: f.id.toString()
  //   };
  //   return menuOption;
  // });

  const [updatePhoto] = useMutation(UpdatePhotoDocument, {
    refetchQueries: [
      {
        query: SearchPhotosDocument,
        variables: {
          input: {
            searchString: ""
          }
        }
      }
    ],
    onCompleted(data) {
      console.log(JSON.stringify(data, null, 2));
      if (data.updatePhoto.success) {
        toasts.success({
          title: `Successfully updated`,
          message: `${data.updatePhoto.message}`
        });
      } else {
        toasts.danger({
          title: `Updates failed`,
          message: `${data.updatePhoto.message}`
        });
      }
      router.push(`/photos`);
    }
  });

  // * Set Initial Values
  let initialPhotographer, initialLocation;
  let initialSubjects: MenuOption[] | undefined;
  let initialTags: MenuOption[] | undefined;
  let initialCollections: MenuOption[] | undefined;

  if (isEditing) {
    initialPhotographer = photographerSelectionOptions?.find(
      x => x.value === photo?.photographer?.id
    );

    initialLocation = locationSelectionOptions?.find(x => x.value === photo?.location?.id);

    /**
     * Select the photo's options in the select menu.
     */
    const photoSubjects = photo?.subjectsInPhoto?.map(s => s.subject.id);

    if (subjectSelectionOptions) {
      initialSubjects = subjectSelectionOptions.filter(x => photoSubjects?.includes(x.value));
    }

    /**
     * Select the photo's options in the select menu.
     */
    const photoTags = photo?.tagsForPhoto?.map(t => t.tag.id);
    if (tagSelectionOptions) {
      initialTags = tagSelectionOptions.filter(x => photoTags?.includes(x.value));
    }

    const photoCollections = photo?.collectionsForPhoto?.map(c => c.collection.id);
    if (collectionSelectionOptions) {
      initialCollections = collectionSelectionOptions.filter(x =>
        photoCollections?.includes(x.value)
      );
    }
  }

  const handleCancel = () => {
    router.push(`/photos`);
  };

  const updatePhotoWithInput = (input: UpdatePhotoMutationVariables) => {
    updatePhoto({
      variables: input
    });
  };

  const initialValues: {
    image: Image | undefined;
    photographer: MenuOption | undefined;
    location: MenuOption | undefined;
    title: string;
    description: string;
    isFeatured: boolean;
    isLimitedEdition: boolean;
    isHidden: boolean;
    rating: number;
    basePrice12: number;
    priceModifier12: number;
    basePrice16: number;
    priceModifier16: number;
    basePrice20: number;
    priceModifier20: number;
    basePrice24: number;
    priceModifier24: number;
    basePrice30: number;
    priceModifier30: number;
    subjects: MenuOption[];
    tags: MenuOption[];
    collections: MenuOption[];
  } = {
    image: photo?.images?.[0] || undefined,
    photographer: initialPhotographer,
    location: initialLocation,
    title: photo?.title || "Untitled",
    description: photo?.description || "No description provided.",
    isFeatured: photo?.isFeatured || false,
    isLimitedEdition: photo?.isLimitedEdition || false,
    isHidden: photo?.isHidden || false,
    rating: photo?.rating || 5,
    basePrice12: photo?.basePrice12 || 100,
    priceModifier12: photo?.priceModifier12 || 1,
    basePrice16: photo?.basePrice16 || 120,
    priceModifier16: photo?.priceModifier16 || 1,
    basePrice20: photo?.basePrice20 || 150,
    priceModifier20: photo?.priceModifier20 || 1,
    basePrice24: photo?.basePrice24 || 180,
    priceModifier24: photo?.priceModifier24 || 1,
    basePrice30: photo?.basePrice30 || 220,
    priceModifier30: photo?.priceModifier30 || 1,
    subjects: initialSubjects || [],
    tags: initialTags || [],
    collections: initialCollections || []
  };

  const validationObject = {
    title: Yup.string().max(50, "Must be 50 characters or fewer.").required("Required"),
    description: Yup.string().required("Required"),
    rating: Yup.number()
      .min(1, "Rating must be 1-10.")
      .max(10, "Rating must be 1-10.")
      .required("Required"),
    basePrice12: Yup.number().min(1, "Must be greater than 0.").required("Required"),
    priceModifier12: Yup.number().min(0.1, "Must be greater than 0.1.").required("Required"),

    basePrice16: Yup.number().min(1, "Must be greater than 0.").required("Required"),
    priceModifier16: Yup.number().min(0.1, "Must be greater than 0.1.").required("Required"),
    basePrice20: Yup.number().min(1, "Must be greater than 0.").required("Required"),
    priceModifier20: Yup.number().min(0.1, "Must be greater than 0.1.").required("Required"),
    basePrice24: Yup.number().min(1, "Must be greater than 0.").required("Required"),
    priceModifier24: Yup.number().min(0.1, "Must be greater than 0.1.").required("Required"),
    basePrice30: Yup.number().min(1, "Must be greater than 0.").required("Required"),
    priceModifier30: Yup.number().min(0.1, "Must be greater than 0.1.").required("Required"),
    photographer: Yup.object().required("Required."),
    location: Yup.object().required("Required."),
    subjects: Yup.array().required("Must select at least 1 Subject.")
  };

  if (typeof window === "undefined" || !initialized) {
    console.log(`not initializes. returning.`);
    return null;
  }

  return (
    <Flex className="page-wrapper" flexDirection="column">
      <Flex flex="row wrap">
        <Flex className="image-wrapper" marginLeft="auto" marginRight="major-2" marginY="major-4">
          <PhotoImage
            image={photo.images[0]}
            photoId={photo.id}
            photoSku={photo.sku}
            photoTitle={photoTitle}
            // @ts-ignore
            ref={imageEditorRef}
          />
        </Flex>
        <Flex
          className="info-card-wrapper"
          flexDirection="column"
          marginY="auto"
          marginLeft="major-2"
          marginRight="auto"
        >
          <Heading use="h5">{photo.sku}</Heading>
          {imageUrl && imageUrl.length > 0 ? (
            <img
              key={Date.now()}
              src={imageUrl}
              width="600px"
              height="315px"
              style={{ borderRadius: "4px" }}
            />
          ) : (
            <Box
              width="600px"
              height="315px"
              backgroundColor="default"
              border="1px solid"
              borderColor="grey800"
              borderRadius="4px"
              alignX="center"
              alignY="center"
            >
              No Sharing Image
            </Box>
          )}
          <SharingImageModal
            sharingImage={sharingImage}
            setSharingImage={setSharingImage}
            name={`photo-${photo.sku}-share`}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
          />
        </Flex>
      </Flex>
      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object(validationObject)}
        // innerRef={formRef}
        onSubmit={async values => {
          //* show saving... callout

          const imageSaveResult = await imageEditorRef.current?.saveImage();

          console.log(`PhotoForm Image save result: ${JSON.stringify(imageSaveResult, null, 2)}`);
          if (!imageSaveResult) {
            return;
          }

          // const imageId = imageSaveResult.image.id;

          setPhotoTitle(values.title);

          const input: UpdatePhotoInput = {
            title: values.title,
            description: values.description,
            isFeatured: values.isFeatured,
            isLimitedEdition: values.isLimitedEdition,
            isHidden: values.isHidden,
            rating: values.rating,
            basePrice12: values.basePrice12,
            priceModifier12: values.priceModifier12,
            basePrice16: values.basePrice16,
            priceModifier16: values.priceModifier16,
            basePrice20: values.basePrice20,
            priceModifier20: values.priceModifier20,
            basePrice24: values.basePrice24,
            priceModifier24: values.priceModifier24,
            basePrice30: values.basePrice30,
            priceModifier30: values.priceModifier30,
            // imageId: parseInt(imageId),
            photographerId: values.photographer ? parseInt(values.photographer.value) : null,
            locationId: values.location ? parseInt(values.location.value) : null,
            subjectIds: values.subjects ? values.subjects.map(subj => parseInt(subj.value)) : null,
            tagIds: values.tags ? values.tags.map(tag => parseInt(tag.value)) : null,
            collectionIds: values.collections
              ? values.collections.map(collection => parseInt(collection.value))
              : null
          };

          console.log(`INPUT on SUBMIT: ${JSON.stringify(input, null, 2)}`);

          const editVariables: UpdatePhotoMutationVariables = {
            id: photo?.id ? parseInt(photo.id) : 0,
            input
          };
          updatePhotoWithInput(editVariables);
        }}
      >
        {({ values }) => (
          <Form autoComplete="off">
            <Flex
              className="form-wrapper"
              padding="major-2"
              width="90vw"
              maxWidth="1400px"
              marginX="auto"
              flexFlow="row wrap"
            >
              <Flex className="col-1" flexDirection="column" margin="major-2" flex="1 1 25%">
                <FieldStack orientation="vertical" spacing="major-3">
                  {locationSelectionOptions && (
                    <Field
                      component={SelectMenuField.Formik}
                      label="Location"
                      name="location"
                      placeholder="Select location..."
                      options={locationSelectionOptions}
                      popoverProps={{ backgroundColor: "default", color: "text" }}
                    />
                  )}

                  {subjectSelectionOptions && (
                    <Field
                      component={SelectMenuField.Formik}
                      hasTags
                      isMultiSelect
                      label="Subjects"
                      placeholder="Select subjects..."
                      name="subjects"
                      options={subjectSelectionOptions}
                      popoverProps={{ backgroundColor: "default", color: "text" }}
                      buttonProps={{ backgroundColor: "red" }}
                    />
                  )}
                  {tagSelectionOptions && (
                    <Field
                      component={SelectMenuField.Formik}
                      hasTags
                      isMultiSelect
                      label="Tags"
                      placeholder="Select tags..."
                      name="tags"
                      options={tagSelectionOptions}
                      popoverProps={{ backgroundColor: "default", color: "text" }}
                    />
                  )}

                  {collectionSelectionOptions && (
                    <Field
                      component={SelectMenuField.Formik}
                      hasTags
                      isMultiSelect
                      label="Collections"
                      name="collections"
                      placeholder="Select collections..."
                      options={collectionSelectionOptions}
                      popoverProps={{ backgroundColor: "default", color: "text" }}
                    />
                  )}
                </FieldStack>
              </Flex>
              <Flex className="col-2" flexDirection="column" margin="major-2" flex="1 1 25%">
                <FieldStack orientation="vertical" spacing="major-3">
                  {photographerSelectionOptions && (
                    <Field
                      component={SelectMenuField.Formik}
                      label="Photographer"
                      name="photographer"
                      placeholder="Select photographer..."
                      options={photographerSelectionOptions}
                      popoverProps={{ backgroundColor: "default", color: "text" }}
                    />
                  )}
                  <Field
                    component={InputField.Formik}
                    name="title"
                    label="Title"
                    type="text"
                    autoComplete="off"
                    value="title"
                  />
                  <Field
                    component={TextareaField.Formik}
                    name="description"
                    label="Description"
                    value="description"
                    textareaProps={{ rows: 5, resize: "none" }}
                  />
                </FieldStack>
              </Flex>
              <Flex className="col-3" flexDirection="column" margin="major-2" flex="1 1 15%">
                <Stack orientation="vertical" spacing="major-2">
                  <Field
                    component={InputField.Formik}
                    name="rating"
                    label="Rating"
                    type="number"
                    value="rating"
                    step="1"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Field
                    component={Switch.Formik}
                    label="Featured"
                    name="isFeatured"
                    marginTop="major-4"
                  />
                  <Field
                    component={Switch.Formik}
                    label="Limited Edition"
                    name="isLimitedEdition"
                    marginTop="major-2"
                  />
                  <Field
                    component={Switch.Formik}
                    label="Hidden"
                    name="isHidden"
                    marginTop="major-2"
                  />
                </Stack>
                <Stack spacing="major-1" marginTop="major-4">
                  <Text.Block>sku: {photo.sku}</Text.Block>
                  <Text.Block>sortIndex: {photo.sortIndex}</Text.Block>
                  <Text.Block>Aspect Ratio: {photo.images[0].aspectRatio}</Text.Block>
                </Stack>
              </Flex>
              <Flex className="col-4" flexDirection="column" margin="major-2" flex="1 1 20%">
                <Level>
                  <Text.Block>Base Price</Text.Block>
                  <Text.Block>Modifier</Text.Block>
                  <Divider orientation="vertical" />
                </Level>
                <Flex alignY="center" alignX="center" marginY="major-1">
                  <Label marginRight="major-1" marginTop="4px">
                    12"
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="basePrice12"
                    size="small"
                    value="basePrice12"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    X
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="priceModifier12"
                    size="small"
                    value="priceModifier12"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    = {(values.basePrice12 * values.priceModifier12).toFixed(0)}
                  </Label>
                </Flex>
                <Flex alignY="center" alignX="center" marginY="major-1">
                  <Label marginRight="major-1" marginTop="4px">
                    16"
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="basePrice16"
                    size="small"
                    value="basePrice16"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    X
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="priceModifier16"
                    size="small"
                    value="priceModifier16"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    = {(values.basePrice16 * values.priceModifier16).toFixed(0)}
                  </Label>
                </Flex>
                <Flex alignY="center" alignX="center" marginY="major-1">
                  <Label marginRight="major-1" marginTop="4px">
                    20"
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="basePrice20"
                    size="small"
                    value="basePrice20"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    X
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="priceModifier20"
                    size="small"
                    value="priceModifier20"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    = {(values.basePrice20 * values.priceModifier20).toFixed(0)}
                  </Label>
                </Flex>
                <Flex alignY="center" alignX="center" marginY="major-1">
                  <Label marginRight="major-1" marginTop="4px">
                    24"
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="basePrice24"
                    size="small"
                    value="basePrice24"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    X
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="priceModifier24"
                    size="small"
                    value="priceModifier24"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    = {(values.basePrice24 * values.priceModifier24).toFixed(0)}
                  </Label>
                </Flex>
                <Flex alignY="center" alignX="center" marginY="major-1">
                  <Label marginRight="major-1" marginTop="4px">
                    30"
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="basePrice30"
                    size="small"
                    value="basePrice30"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right"
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    X
                  </Label>
                  <Field
                    component={Input.Formik}
                    name="priceModifier30"
                    size="small"
                    value="priceModifier30"
                    maxWidth="70px"
                    inputProps={{
                      textAlign: "right",
                      appearance: "none",
                      margin: 0
                    }}
                  />
                  <Label marginX="major-1" marginTop="major-1">
                    = {(values.basePrice30 * values.priceModifier30).toFixed(0)}
                  </Label>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              flexDirection="horizontal"
              width="1200px"
              maxWidth="90%"
              marginX="auto"
              marginY="major-4"
              alignX="right"
            >
              <Button onClick={() => handleCancel()}>Cancel</Button>
              <Button type="submit" palette="secondary" marginLeft="major-2">
                Submit
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Flex>
  );
};

export default PhotoForm;
