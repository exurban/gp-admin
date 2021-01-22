import { useQuery, gql } from "@apollo/client";
import { PhotoEditOptionsDocument } from "../graphql-operations";

const EDIT_OPTIONS = gql`
  query photoEditOptions {
    photoEditOptions {
      photographerOptions {
        id
        name
      }
      locationOptions {
        id
        name
      }
      subjectOptions {
        id
        name
      }
      tagOptions {
        id
        name
      }
      collectionOptions {
        id
        name
      }
    }
  }
`;
const Test: React.FC = () => {
  const { error, loading, data } = useQuery(EDIT_OPTIONS);
  return (
    <>
      <pre>{JSON.stringify(data?.photoEditOptions, null, 2)}</pre>
    </>
  );
};

export default Test;
