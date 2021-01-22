import { Location, SearchLocationsDocument, DeleteLocationDocument } from "../graphql-operations";
import { useMutation } from "@apollo/client";
import { Box, Flex, Heading, Paragraph, Text, Button, useToasts } from "bumbag";
import { Dispatch, SetStateAction } from "react";
import CoverImageEditor from "./CoverImageEditor";

// * name
// * description
// * coverImage
// id
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  selectedItem: Location;
  setSelectedItem: Dispatch<SetStateAction<Location | undefined>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const LocationView: React.FC<Props> = ({ selectedItem: loc, setSelectedItem, setIsEditing }) => {
  const toasts = useToasts();
  const [deleteLocation] = useMutation(DeleteLocationDocument, {
    onCompleted() {
      toasts.success({
        title: `Successfully deleted`,
        message: `Deleted ${loc.name}.`
      });
    }
  });

  const onDelete = () => {
    if (loc.countOfPhotos > 0) {
      toasts.danger({
        title: `Cannot delete.`,
        message: `${loc.name} has ${loc.countOfPhotos} related photos. You must delete these photos or remove ${loc.name} as a subject for each before deleting.`
      });
    } else {
      deleteLocation({
        variables: { id: parseInt(loc.id) },
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
      setSelectedItem(undefined);
    }
  };

  return (
    <Flex>
      <Flex
        className="image-wrapper"
        flexDirection="column"
        margin="major-2"
        marginTop="30px"
        flex="1 1 25%"
        alignItems="flex-end"
        padding="major-2"
      >
        <CoverImageEditor coverImage={loc.coverImage} isEditing={false} />
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Flex flexDirection="row" alignX="right" justifyContent="space-between">
          <Heading use="h3" marginTop="major-4">
            {loc?.name}
          </Heading>
        </Flex>
        <Paragraph marginTop="major-3">
          <Text>{loc.description}</Text>
        </Paragraph>
      </Flex>
      <Flex
        className="data-wrapper"
        flexDirection="column"
        margin="major-2"
        marginTop="30px"
        flex="1 1 25%"
      >
        <Box alignContent="flex-start" marginTop="major-2">
          <Button
            size="small"
            iconBefore="solid-edit"
            palette="warning"
            variant="outlined"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button
            size="small"
            iconBefore="solid-trash-alt"
            marginLeft="major-1"
            palette="danger"
            variant="outlined"
            onClick={() => onDelete()}
          >
            Delete
          </Button>
        </Box>
        <Flex flexDirection="column" marginTop="major-2" fontSize="100">
          {loc?.id && <Text>id: {loc.id}</Text>}
          {loc?.__typename && <Text>type: {loc.__typename}</Text>}
          {loc?.countOfPhotos && <Text>Count of Photos: {loc.countOfPhotos}</Text>}
          {loc?.createdAt && <Text>Created: {new Date(loc.createdAt).toDateString()}</Text>}
          {loc?.updatedAt && <Text>Updated: {new Date(loc.updatedAt).toDateString()}</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LocationView;
