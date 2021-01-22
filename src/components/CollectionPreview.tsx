import {
  Collection,
  SearchCollectionsDocument,
  DeleteCollectionDocument
} from "../graphql-operations";
import { useMutation } from "@apollo/client";
import { Box, Flex, Heading, Paragraph, Text, Button, useToasts } from "bumbag";
import { Dispatch, SetStateAction } from "react";
import CoverImageEditor from "./CoverImageEditor";

// * name
// * tag
// * description
// * coverImage
// id
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  selectedItem: Collection;
  setSelectedItem: Dispatch<SetStateAction<Collection | undefined>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const CollectionView: React.FC<Props> = ({ selectedItem: col, setSelectedItem, setIsEditing }) => {
  const toasts = useToasts();
  const [deleteCollection] = useMutation(DeleteCollectionDocument, {
    onCompleted() {
      toasts.success({
        title: `Successfully deleted`,
        message: `Deleted ${col.name}.`
      });
    }
  });

  const onDelete = () => {
    if (col.countOfPhotos > 0) {
      toasts.danger({
        title: `Cannot delete.`,
        message: `${col.name} has ${col.countOfPhotos} related photos. You must delete these photos or remove all photos from ${col.name} before deleting.`
      });
    } else {
      deleteCollection({
        variables: { id: parseInt(col.id) },
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
        <CoverImageEditor coverImage={col.coverImage} isEditing={false} />
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Heading use="h3" marginTop="major-4">
          {col?.name}
        </Heading>
        <Heading use="h5" marginTop="major-3">
          {col?.tag}
        </Heading>

        <Paragraph marginTop="major-3">
          <Text>{col.description}</Text>
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
          {col?.id && <Text>id: {col.id}</Text>}
          {col?.__typename && <Text>type: {col.__typename}</Text>}
          {col?.countOfPhotos && <Text>Count of Photos: {col.countOfPhotos}</Text>}
          {col?.createdAt && <Text>Created: {new Date(col.createdAt).toDateString()}</Text>}
          {col?.updatedAt && <Text>Updated: {new Date(col.updatedAt).toDateString()}</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CollectionView;
