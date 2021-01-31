import { useRef, useState, Dispatch, SetStateAction } from "react";
import { Modal, Flex, Card, Button, Text, Spinner, applyTheme } from "bumbag";
import { Image } from "../graphql-operations";
import CoverImageEditor from "./CoverImageEditor";

const TextButton = applyTheme(Button, {
  styles: {
    base: {
      fontSize: "14px"
    }
  },
  defaultProps: {
    palette: "primary",
    variant: "ghost",
    size: "small",
    _focus: {
      boxShadow: "none"
    }
  }
});

interface CoverImageEditorRef {
  saveImage: () => void;
}

type Props = {
  coverImage: Image | null | undefined;
  setCoverImage: Dispatch<SetStateAction<Image | null | undefined>>;
  name: string;
  imageUrl: string | undefined;
  setImageUrl: Dispatch<SetStateAction<string | undefined>>;
};

const CoverImageModal: React.FC<Props> = ({
  coverImage,
  setCoverImage,
  name,
  imageUrl,
  setImageUrl
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const modal = Modal.useState();
  const imageEditorRef = useRef<CoverImageEditorRef>();

  const close = () => {
    setIsSaving(false);
    modal.setVisible(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await imageEditorRef.current?.saveImage();
    console.log(`Result of upload and save: ${JSON.stringify(result, null, 2)}`);
  };

  return (
    <>
      <Modal.Disclosure use={TextButton} {...modal}>
        Edit
      </Modal.Disclosure>
      <Modal {...modal}>
        <Card>
          {!isSaving ? (
            <>
              <CoverImageEditor
                coverImage={coverImage}
                setCoverImage={setCoverImage}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                name={name}
                closeModal={close}
                // @ts-ignore
                ref={imageEditorRef}
              />
              <Flex marginTop="major-2">
                <Modal.Disclosure use={Button} {...modal} marginLeft="auto" marginRight="major-1">
                  Close
                </Modal.Disclosure>
                <Button onClick={() => handleSave()}>Save</Button>
              </Flex>
            </>
          ) : (
            <Flex alignX="center" alignY="center">
              <Spinner fontSize="50px" />
              <Text.Block marginLeft="major-2">Saving cover image.</Text.Block>
            </Flex>
          )}
        </Card>
      </Modal>
    </>
  );
};

export default CoverImageModal;
