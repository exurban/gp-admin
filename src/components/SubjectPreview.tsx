import {
  Subject,
  SearchSubjectsDocument,
  DeleteSubjectDocument,
  PhotoEditOptionsDocument
} from "../graphql-operations";
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
  selectedItem: Subject;
  setSelectedItem: Dispatch<SetStateAction<Subject | undefined>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const SubjectView: React.FC<Props> = ({ selectedItem: sbj, setSelectedItem, setIsEditing }) => {
  const toasts = useToasts();
  const [deleteSubject] = useMutation(DeleteSubjectDocument, {
    onCompleted() {
      toasts.success({
        title: `Successfully deleted`,
        message: `Deleted ${sbj.name}.`
      });
    }
  });

  const onDelete = () => {
    if (sbj.countOfPhotos > 0) {
      toasts.danger({
        title: `Cannot delete.`,
        message: `${sbj.name} has ${sbj.countOfPhotos} related photos. You must delete these photos or remove ${sbj.name} as a subject for each before deleting.`
      });
    } else {
      deleteSubject({
        variables: { id: parseInt(sbj.id) },
        refetchQueries: [
          {
            query: SearchSubjectsDocument,
            variables: {
              input: {
                searchString: ""
              }
            }
          },
          {
            query: PhotoEditOptionsDocument
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
        {sbj.coverImage && sbj.coverImage.imageUrl.length > 0 ? (
          <img
            src={sbj.coverImage.imageUrl}
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
            {sbj?.name}
          </Heading>
        </Flex>
        <Paragraph marginTop="major-3">
          <Text>{sbj.description}</Text>
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
          {sbj?.id && <Text>id: {sbj.id}</Text>}
          {sbj?.__typename && <Text>type: {sbj.__typename}</Text>}
          {sbj?.countOfPhotos && <Text>Count of Photos: {sbj.countOfPhotos}</Text>}
          {sbj?.createdAt && <Text>Created: {new Date(sbj.createdAt).toDateString()}</Text>}
          {sbj?.updatedAt && <Text>Updated: {new Date(sbj.updatedAt).toDateString()}</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default SubjectView;
