import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { PhotoWithSkuDocument } from "../../graphql-operations";
import PhotoForm from "../../components/PhotoForm";
import { Box } from "bumbag";

const EditPhoto: React.FC = () => {
  const router = useRouter();
  const { sku } = router.query;
  const { data: photoData } = useQuery(PhotoWithSkuDocument, {
    variables: { sku: parseInt(sku as string) }
  });

  if (!photoData || !photoData.photoWithSku) {
    console.error(`Failed to fetch photo with sku: ${sku}`);
  }

  const photo = photoData?.photoWithSku;

  // console.log(`photoData: ${JSON.stringify(photo, null, 2)}`);
  if (photoData) {
    console.log(`loaded photo data.`);
  }

  if (!photo) return null;

  return (
    <Box height="90vh">
      <PhotoForm />
    </Box>
  );
};

export default EditPhoto;
