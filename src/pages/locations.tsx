import { useEffect, useState } from "react";
import { Box, Flex, Divider } from "bumbag";
import { Location } from "../graphql-operations";
import LocationsTable from "../components/LocationsTable";
import LocationPreview from "../components/LocationPreview";
import LocationForm from "../components/LocationForm";

const Locations: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Location | undefined>(undefined);
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
    <Flex flexDirection="column" marginX="auto">
      <LocationsTable
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isAddingOrEditing={isAddingOrEditing}
        setIsAdding={setIsAdding}
      />
      <Box maxWidth="1400px" marginX="auto"></Box>
      <Divider marginY="major-4" />
      <Box width="90%" maxWidth="1400px" marginX="auto">
        {isAddingOrEditing && (
          <LocationForm
            item={selectedItem}
            isAdding={isAdding}
            isEditing={isEditing}
            setIsAdding={setIsAdding}
            setIsEditing={setIsEditing}
          />
        )}
        {!isAddingOrEditing && selectedItem && (
          <LocationPreview
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setIsEditing={setIsEditing}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Locations;
