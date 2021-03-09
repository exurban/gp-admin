import { Frame, SearchFramesDocument, DeleteFrameDocument } from "../graphql-operations";
import { useMutation } from "@apollo/client";
import { Box, Flex, Columns, Heading, Paragraph, Text, Button, useToasts, Divider } from "bumbag";
import { Dispatch, SetStateAction } from "react";

// * name
// * description
// * material
// * color
// * coverImage
// * frameSku
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
  selectedItem: Frame;
  setSelectedItem: Dispatch<SetStateAction<Frame | undefined>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const PrintView: React.FC<Props> = ({ selectedItem: fr, setSelectedItem, setIsEditing }) => {
  const toasts = useToasts();
  const [deleteMat] = useMutation(DeleteFrameDocument, {
    onCompleted() {
      toasts.success({
        title: `Successfully deleted`,
        message: `Deleted ${fr.name}.`
      });
    }
  });

  const onDelete = () => {
    deleteMat({
      variables: { id: parseInt(fr.id) },
      refetchQueries: [
        {
          query: SearchFramesDocument,
          variables: {
            input: {
              searchString: ""
            }
          }
        }
      ]
    });
    setSelectedItem(undefined);
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
        {fr.coverImage && fr.coverImage.imageUrl.length > 0 && (
          <img
            key={Date.now()}
            src={fr.coverImage.imageUrl}
            width="225px"
            height="225px"
            style={{
              borderRadius: "6px"
            }}
          />
        )}
      </Flex>
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Flex flexDirection="row" alignX="right" justifyContent="space-between">
          <Heading use="h3" marginTop="major-4">
            {fr?.name}
          </Heading>
        </Flex>
        <Paragraph marginTop="major-3">
          <Text>{fr.description}</Text>
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
            <Text.Block paddingY="major-1">Material:</Text.Block>
            <Text.Block paddingY="major-1">Color:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">{fr.printType}</Text.Block>
            <Text.Block paddingY="major-1">{fr.frameSku}</Text.Block>
            <Text.Block paddingY="major-1">{fr.material}</Text.Block>
            <Text.Block paddingY="major-1">{fr.color}</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="right" fontWeight="300">
            <Text.Block paddingY="major-1">Base:</Text.Block>
            <Text.Block paddingY="major-1">Modifier:</Text.Block>
            <Text.Block paddingY="major-1">Total:</Text.Block>
            <Text.Block paddingY="major-1">Ship Cost:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">${fr.basePrice}</Text.Block>
            <Text.Block paddingY="major-1">{fr.priceModifier}</Text.Block>
            <Text.Block paddingY="major-1">${fr.priceModifier * fr.basePrice}</Text.Block>
            <Text.Block paddingY="major-1">${fr.shippingCost}</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="right" fontWeight="300">
            <Text.Block paddingY="major-1">Dimension 1:</Text.Block>
            <Text.Block paddingY="major-1">Dimension 2:</Text.Block>
            <Text.Block paddingY="major-1">Aspect:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">{fr.dimension1}"</Text.Block>
            <Text.Block paddingY="major-1">{fr.dimension2}"</Text.Block>
            <Text.Block paddingY="major-1">{fr.aspectRatio}"</Text.Block>
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
          {fr?.id && <Text>id: {fr.id}</Text>}
          {fr?.__typename && <Text>type: {fr.__typename}</Text>}
          {fr?.createdAt && <Text>Created: {new Date(fr.createdAt).toDateString()}</Text>}
          {fr?.updatedAt && <Text>Updated: {new Date(fr.updatedAt).toDateString()}</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PrintView;
