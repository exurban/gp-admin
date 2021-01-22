import { Finish, SearchFinishesDocument, DeleteFinishDocument } from "../graphql-operations";
import { useMutation } from "@apollo/client";
import { Box, Flex, Columns, Heading, Paragraph, Text, Button, useToasts, Divider } from "bumbag";
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
  selectedItem: Finish;
  setSelectedItem: Dispatch<SetStateAction<Finish | undefined>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const FinishView: React.FC<Props> = ({ selectedItem: fn, setSelectedItem, setIsEditing }) => {
  const toasts = useToasts();
  const [deleteFinish] = useMutation(DeleteFinishDocument, {
    onCompleted() {
      toasts.success({
        title: `Successfully deleted`,
        message: `Deleted ${fn.name}.`
      });
    }
  });

  const onDelete = () => {
    if (fn.countOfPhotos > 0) {
      toasts.danger({
        title: `Cannot delete.`,
        message: `${fn.name} has ${fn.countOfPhotos} related photos. You must delete these photos or remove ${fn.name} as a finish for each before deleting.`
      });
    } else {
      deleteFinish({
        variables: { id: parseInt(fn.id) },
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
        <CoverImageEditor coverImage={fn.coverImage} isEditing={false} />
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Flex flexDirection="row" alignX="right" justifyContent="space-between">
          <Heading use="h3" marginTop="major-4">
            {fn?.name}
          </Heading>
        </Flex>
        <Paragraph marginTop="major-3">
          <Text>{fn.description}</Text>
        </Paragraph>
        <Columns marginTop="major-4">
          <Columns.Column alignX="center">
            <Text.Block fontWeight="600">SKU</Text.Block>
            <Divider
              orientation="horizontal"
              backgroundColor="info300"
              width="160px"
              height="1px"
              border="0 none"
              marginY="major-1"
            />
          </Columns.Column>
          <Columns.Column alignX="center">
            <Text.Block fontWeight="600">Pricing</Text.Block>
            <Divider
              orientation="horizontal"
              backgroundColor="info300"
              width="160px"
              height="1px"
              border="0 none"
              marginY="major-1"
            />
          </Columns.Column>
          <Columns.Column alignX="center">
            <Text.Block fontWeight="600">Dimensions</Text.Block>
            <Divider
              orientation="horizontal"
              backgroundColor="info300"
              width="160px"
              height="1px"
              border="0 none"
              marginY="major-1"
            />
          </Columns.Column>
        </Columns>
        <Columns>
          <Columns.Column alignX="right" fontWeight="300">
            <Text.Block paddingY="major-1">Type:</Text.Block>
            <Text.Block paddingY="major-1">SKU:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">{fn.finSku}</Text.Block>
            <Text.Block paddingY="major-1">{fn.finishSku}</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="right" fontWeight="300">
            <Text.Block paddingY="major-1">Base:</Text.Block>
            <Text.Block paddingY="major-1">Modifier:</Text.Block>
            <Text.Block paddingY="major-1">Total:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">${fn.basePrice}</Text.Block>
            <Text.Block paddingY="major-1">{fn.priceModifier}</Text.Block>
            <Text.Block paddingY="major-1">${fn.priceModifier * fn.basePrice}</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="right" fontWeight="300">
            <Text.Block paddingY="major-1">Width:</Text.Block>
            <Text.Block paddingY="major-1">Height:</Text.Block>
            <Text.Block paddingY="major-1">Depth:</Text.Block>
            <Text.Block paddingY="major-1">Weight:</Text.Block>
            <Text.Block paddingY="major-1">Ship Weight:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">{fn.width}"</Text.Block>
            <Text.Block paddingY="major-1">{fn.height}"</Text.Block>
            <Text.Block paddingY="major-1">{fn.depth}"</Text.Block>
            <Text.Block paddingY="major-1">{fn.weight}</Text.Block>
            <Text.Block paddingY="major-1">{fn.shippingWeight}</Text.Block>
          </Columns.Column>
        </Columns>
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
          {fn?.id && <Text>id: {fn.id}</Text>}
          {fn?.__typename && <Text>type: {fn.__typename}</Text>}
          {fn?.countOfPhotos && <Text>Count of Photos: {fn.countOfPhotos}</Text>}
          {fn?.createdAt && <Text>Created: {new Date(fn.createdAt).toDateString()}</Text>}
          {fn?.updatedAt && <Text>Updated: {new Date(fn.updatedAt).toDateString()}</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default FinishView;
