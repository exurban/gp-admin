import { useState } from "react";
import { Photo } from "../graphql-operations";
import { Flex } from "bumbag";
import PhotosTable from "../components/PhotosTable";

const Photos: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Photo | undefined>(undefined);

  return (
    <Flex flexDirection="column" margin="40px" height="90vh">
      <PhotosTable selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
    </Flex>
  );
};

export default Photos;
