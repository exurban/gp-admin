import { Photographer, SearchPhotographersDocument } from "../graphql-operations";
import { useMutation } from "@apollo/client";
import { DeletePhotographerDocument } from "../graphql-operations";
import { Box, Flex, Heading, Paragraph, Text, Button, useToasts } from "bumbag";
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
  selectedItem: Photographer;
  setSelectedItem: Dispatch<SetStateAction<Photographer | undefined>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const PhotographerView: React.FC<Props> = ({ selectedItem: pg, setSelectedItem, setIsEditing }) => {
  const toasts = useToasts();
  const [deletePhotographer] = useMutation(DeletePhotographerDocument, {
    onCompleted() {
      toasts.success({
        title: `Successfully deleted`,
        message: `Deleted ${pg.name}.`
      });
    }
  });

  const onDelete = () => {
    if (pg.countOfPhotos > 0) {
      toasts.danger({
        title: `Cannot delete.`,
        message: `${pg.name} has ${pg.countOfPhotos} photos on the site. You must delete or re-assign these photos before deleting ${pg.name}`
      });
    } else {
      deletePhotographer({
        variables: { id: parseInt(pg.id) },
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
        <CoverImageEditor coverImage={pg.coverImage} isEditing={false} />
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Flex flexDirection="row" alignX="right" justifyContent="space-between">
          <Heading use="h3" marginTop="major-4">
            {pg?.name}
          </Heading>
        </Flex>
        <Heading use="h6" marginTop="major-3" marginBottom="major-2">
          {pg.email}
        </Heading>
        <Paragraph>
          <Text>{pg.bio}</Text>
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
          {pg?.id && <Text>id: {pg.id}</Text>}
          {pg?.__typename && <Text>type: {pg.__typename}</Text>}
          {pg?.countOfPhotos && <Text>Count of Photos: {pg.countOfPhotos}</Text>}
          {pg?.createdAt && <Text>Created: {new Date(pg.createdAt).toDateString()}</Text>}
          {pg?.updatedAt && <Text>Updated: {new Date(pg.updatedAt).toDateString()}</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PhotographerView;
