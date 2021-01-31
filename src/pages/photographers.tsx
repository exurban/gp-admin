import { useState } from "react";
import { Box, Flex, Divider } from "bumbag";
import PhotographersTable from "../components/PhotographersTable";
import PhotographerPreview from "../components/PhotographerPreview";
import PhotographerForm from "../components/PhotographerForm";
import { Photographer } from "../graphql-operations";

const Photographers: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Photographer | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAddingOrEditing = isAdding || isEditing;

  // * if isAddingOrEditing then show Form
  // * if !isAddingOrEditing but selectedPhotographer then show preview
  // * if !isAddingOrEditing AND !selectedPhotographer then show nothing

  return (
    <Flex flexDirection="column" width="90%" marginX="auto">
      <PhotographersTable
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isAddingOrEditing={isAddingOrEditing}
        setIsAdding={setIsAdding}
      />
      <Box maxWidth="900px" marginX="auto"></Box>
      <Divider marginY="major-4" />
      <Box width="90%" maxWidth="1400px" marginX="auto">
        {isAddingOrEditing && (
          <PhotographerForm
            item={selectedItem}
            setSelectedItem={setSelectedItem}
            isAdding={isAdding}
            isEditing={isEditing}
            setIsAdding={setIsAdding}
            setIsEditing={setIsEditing}
          />
        )}
        {!isAddingOrEditing && selectedItem && (
          <PhotographerPreview
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setIsEditing={setIsEditing}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Photographers;
