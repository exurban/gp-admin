import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { PhotoWithSkuDocument } from "../../graphql-operations";
import PhotoForm from "../../components/PhotoForm";
import { Box } from "bumbag";

const EditPhoto: React.FC = () => {
  const router = useRouter();
  const { sku } = router.query;
  const { data: photoData } = useQuery(PhotoWithSkuDocument, {
    variables: { sku: parseInt(sku as string) },
    ssr: false
  });

  const photo = photoData?.photoWithSku;

  if (!photo) {
    return null;
  }

  console.log(`fetched photo with image: ${JSON.stringify(photo.images[0])}`);

  return (
    <Box height="90vh">
      <PhotoForm photo={photo} isEditing={true} />
    </Box>
  );
};

export default EditPhoto;
