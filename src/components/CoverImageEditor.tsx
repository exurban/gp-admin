import { useState } from "react";
import { Image as CoverImage } from "../graphql-operations";
import ModalCoverImageEditor from "./ModalCoverImageEditor";
import { Box, Flex, Button, Paragraph, Text } from "bumbag";

type Props = {
  coverImage: CoverImage | null | undefined;
  isEditing: boolean;
};

const CoverImageEditor: React.FC<Props> = ({ coverImage, isEditing }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(coverImage?.imageUrl);
  console.log(`cover image: ${coverImage}`);

  return (
    <>
      <Flex flexDirection="column">
        {/* {imageUrl ? (
          <Box width="200px" height="300px" position="relative" altitude="300">
            <StyledImage className="styled-image" src={imageUrl} layout="fill" objectFit="cover" />
          </Box> */}
        {imageUrl ? (
          <Box width="200px" height="300px" position="relative" altitude="300">
            <img src={imageUrl} width={200} height={300} />
          </Box>
        ) : (
          <Box
            border="2px solid"
            borderColor="gray100"
            borderRadius="6px"
            height="300px"
            width="200px"
            color="gray300"
          >
            <Paragraph color="gray400" height="100%" alignX="center" alignY="center">
              <Text textAlign="center" padding="major-2">
                No cover image.
              </Text>
            </Paragraph>
          </Box>
        )}

        <Button
          size="small"
          color="info500"
          marginTop="major-1"
          marginLeft="auto"
          variant="ghost"
          visibility={isEditing ? "visible" : "hidden"}
          onClick={() => {
            setModalIsOpen(true);
          }}
        >
          Edit
        </Button>
        <ModalCoverImageEditor
          coverImage={coverImage}
          modalIsOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
          setImageUrl={setImageUrl}
        />
      </Flex>
    </>
  );
};

export default CoverImageEditor;
