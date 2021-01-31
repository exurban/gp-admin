import { Tag, SearchTagsDocument, DeleteTagDocument } from "../graphql-operations";
import { useMutation } from "@apollo/client";
import { Box, Flex, Heading, Paragraph, Text, Button, useToasts } from "bumbag";
import { Dispatch, SetStateAction } from "react";

// * name
// * description
// * coverImage
// id
// __typename
// countOfPhotos
// createdAt
// updatedAt

type Props = {
  selectedItem: Tag;
  setSelectedItem: Dispatch<SetStateAction<Tag | undefined>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const TagView: React.FC<Props> = ({ selectedItem: tag, setSelectedItem, setIsEditing }) => {
  const toasts = useToasts();
  const [deleteTag] = useMutation(DeleteTagDocument, {
    onCompleted() {
      toasts.success({
        title: `Successfully deleted`,
        message: `Deleted ${tag.name}.`
      });
    }
  });

  const onDelete = () => {
    if (tag.countOfPhotos > 0) {
      toasts.danger({
        title: `Cannot delete.`,
        message: `${tag.name} has ${tag.countOfPhotos} related photos. You must delete these photos or remove ${tag.name} as a tag for each before deleting.`
      });
    } else {
      deleteTag({
        variables: { id: parseInt(tag.id) },
        refetchQueries: [
          {
            query: SearchTagsDocument,
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
        {tag.coverImage && tag.coverImage.imageUrl.length > 0 ? (
          <img
            key={Date.now()}
            src={tag.coverImage.imageUrl}
            width="200px"
            height="300px"
            style={{
              borderRadius: "6px"
            }}
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
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Flex flexDirection="row" alignX="right" justifyContent="space-between">
          <Heading use="h3" marginTop="major-4">
            {tag?.name}
          </Heading>
        </Flex>
        <Paragraph marginTop="major-3" marginBottom="major-2">
          <Text>{tag.description}</Text>
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
          {tag?.id && <Text>id: {tag.id}</Text>}
          {tag?.__typename && <Text>type: {tag.__typename}</Text>}
          {tag?.countOfPhotos && <Text>Count of Photos: {tag.countOfPhotos}</Text>}
          {tag?.createdAt && <Text>Created: {new Date(tag.createdAt).toDateString()}</Text>}
          {tag?.updatedAt && <Text>Updated: {new Date(tag.updatedAt).toDateString()}</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default TagView;
