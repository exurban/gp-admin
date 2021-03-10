import { Print, SearchPrintsDocument, DeletePrintDocument } from "../graphql-operations";
import { useMutation } from "@apollo/client";
import { Box, Flex, Columns, Heading, Paragraph, Text, Button, useToasts, Divider } from "bumbag";
import { Dispatch, SetStateAction } from "react";

// * name
// * type
// * description
// * coverImage
// * printSku
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
  selectedItem: Print;
  setSelectedItem: Dispatch<SetStateAction<Print | undefined>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};

const PrintView: React.FC<Props> = ({ selectedItem: pr, setSelectedItem, setIsEditing }) => {
  const toasts = useToasts();
  const [deletePrint] = useMutation(DeletePrintDocument, {
    onCompleted() {
      toasts.success({
        title: `Successfully deleted`,
        message: `Deleted ${pr.name}.`
      });
    }
  });

  const onDelete = () => {
    deletePrint({
      variables: { id: parseInt(pr.id) },
      refetchQueries: [
        {
          query: SearchPrintsDocument,
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
      <Flex className="fields-wrapper" flexDirection="column" margin="major-3" flex="2 1 50%">
        <Flex flexDirection="row" alignX="right" justifyContent="space-between">
          <Heading use="h3" marginTop="major-4">
            {pr?.name}
          </Heading>
        </Flex>
        <Paragraph marginTop="major-3">
          <Text>{pr.description}</Text>
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
        </Columns>
        <Columns>
          <Columns.Column alignX="right" fontWeight="300">
            <Text.Block paddingY="major-1">Type:</Text.Block>
            <Text.Block paddingY="major-1">SKU:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">{pr.type}</Text.Block>
            <Text.Block paddingY="major-1">{pr.printSku}</Text.Block>
          </Columns.Column>

          <Columns.Column alignX="right" fontWeight="300">
            <Text.Block paddingY="major-1">Aspect:</Text.Block>
            <Text.Block paddingY="major-1">Dimension 1:</Text.Block>
            <Text.Block paddingY="major-1">Dimension 2:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">{pr.aspectRatio}</Text.Block>
            <Text.Block paddingY="major-1">{pr.dimension1}"</Text.Block>
            <Text.Block paddingY="major-1">{pr.dimension2}"</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="right" fontWeight="300">
            <Text.Block paddingY="major-1">Cost:</Text.Block>
            <Text.Block paddingY="major-1">Base Price:</Text.Block>
            <Text.Block paddingY="major-1">Modifier:</Text.Block>
            <Text.Block paddingY="major-1">Total Resale:</Text.Block>
            <Text.Block paddingY="major-1">Markup:</Text.Block>
          </Columns.Column>
          <Columns.Column alignX="left" fontWeight="500">
            <Text.Block paddingY="major-1">${pr.cost}</Text.Block>
            <Text.Block paddingY="major-1">${pr.basePrice}</Text.Block>
            <Text.Block paddingY="major-1">{pr.priceModifier * 100}%</Text.Block>
            <Text.Block paddingY="major-1">${pr.priceModifier * pr.basePrice}</Text.Block>
            <Text.Block paddingY="major-1">${pr.priceModifier * pr.basePrice - pr.cost}</Text.Block>
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
          {pr?.id && <Text>id: {pr.id}</Text>}
          {pr?.__typename && <Text>type: {pr.__typename}</Text>}
          {pr?.createdAt && <Text>Created: {new Date(pr.createdAt).toDateString()}</Text>}
          {pr?.updatedAt && <Text>Updated: {new Date(pr.updatedAt).toDateString()}</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PrintView;
