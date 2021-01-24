import { Flex } from "bumbag";
import PhotosTable from "../components/PhotosTable";

const Photos: React.FC = () => {
  return (
    <Flex flexDirection="column" margin="40px" height="90vh">
      <PhotosTable />
    </Flex>
  );
};

export default Photos;
