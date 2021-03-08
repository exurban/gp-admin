import { useState } from "react";
import { Box, Flex, Divider } from "bumbag";
import FramesTable from "../components/FramesTable";
import FramePreview from "../components/FramePreview";
import FrameForm from "../components/FrameForm";
import { Frame } from "../graphql-operations";

const Frames: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Frame | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAddingOrEditing = isAdding || isEditing;

  // * if isAddingOrEditing then show Form
  // * if selectedItem but !isAddingOrEditing, show preview
  // * if NOT addingOrEditing and nothing selected, then show nothing

  return (
    <Flex flexDirection="column" width="90%" marginX="auto">
      <FramesTable
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isAddingOrEditing={isAddingOrEditing}
        setIsAdding={setIsAdding}
      />
      <Box maxWidth="900px" marginX="auto"></Box>
      <Divider marginY="major-4" />
      <Box width="90%" maxWidth="1400px" marginX="auto">
        {isAddingOrEditing && (
          <FrameForm
            item={selectedItem}
            setSelectedItem={setSelectedItem}
            isAdding={isAdding}
            isEditing={isEditing}
            setIsAdding={setIsAdding}
            setIsEditing={setIsEditing}
          />
        )}
        {!isAddingOrEditing && selectedItem && (
          <FramePreview
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setIsEditing={setIsEditing}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Frames;
