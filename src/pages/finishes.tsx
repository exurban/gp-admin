import { useEffect, useState } from "react";
import { Box, Flex, Divider } from "bumbag";
import { Finish } from "../graphql-operations";
import FinishesTable from "../components/FinishesTable";
import FinishPreview from "../components/FinishPreview";
import FinishForm from "../components/FinishForm";

const Finishes: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Finish | undefined>(undefined);
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
      <FinishesTable
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isAddingOrEditing={isAddingOrEditing}
        setIsAdding={setIsAdding}
      />
      <Box maxWidth="900px" marginX="auto"></Box>
      <Divider marginY="major-4" />
      <Box width="90%" maxWidth="1400px" marginX="auto">
        {isAddingOrEditing && (
          <FinishForm
            item={selectedItem}
            isAdding={isAdding}
            isEditing={isEditing}
            setIsAdding={setIsAdding}
            setIsEditing={setIsEditing}
          />
        )}
        {!isAddingOrEditing && selectedItem && (
          <FinishPreview
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setIsEditing={setIsEditing}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Finishes;
