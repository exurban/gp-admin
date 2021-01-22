import { useEffect, useState } from "react";
import { Box, Flex, Divider } from "bumbag";
import { Collection } from "../graphql-operations";
import CollectionsTable from "../components/CollectionsTable";
import CollectionPreview from "../components/CollectionPreview";
import CollectionForm from "../components/CollectionForm";

const Collections: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Collection | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAddingOrEditing = isAdding || isEditing;

  useEffect(() => {
    if (isAdding) {
      setSelectedItem(undefined);
    }
  }, [selectedItem, isAdding]);

  // * if isAddingOrEditing then show Form
  // * if selectedItem but !isAddingOrEditing, show preview
  // * if NOT addingOrEditing and nothing selected, then show nothing

  return (
    <Flex flexDirection="column" width="90%" marginX="auto">
      <CollectionsTable
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isAddingOrEditing={isAddingOrEditing}
        setIsAdding={setIsAdding}
      />
      <Box maxWidth="900px" marginX="auto"></Box>
      <Divider marginY="major-4" />
      <Box width="90%" maxWidth="1400px" marginX="auto">
        {isAddingOrEditing && (
          <CollectionForm
            item={selectedItem}
            isAdding={isAdding}
            isEditing={isEditing}
            setIsAdding={setIsAdding}
            setIsEditing={setIsEditing}
          />
        )}
        {!isAddingOrEditing && selectedItem && (
          <CollectionPreview
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setIsEditing={setIsEditing}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Collections;
