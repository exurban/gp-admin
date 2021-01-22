import { useQuery } from "@apollo/client";
import { PhotoCountByCollectionDocument } from "../../graphql-operations";
import { Table } from "bumbag";

const CountByCollection: React.FC = () => {
  const { error, loading, data } = useQuery(PhotoCountByCollectionDocument);

  let itemCounts = [
    {
      name: "",
      count: 0
    }
  ];

  if (data && data.photoCountByCollection) {
    const items = data.photoCountByCollection.itemCountList;
    itemCounts = items?.map(item => ({ name: item.name, count: item.count }));
  }

  if (error) return <p>Error loading collection counts.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Table isHoverable _hover={{ cursor: "default" }}>
        <Table.Head>
          <Table.Row>
            <Table.HeadCell>Collection</Table.HeadCell>
            <Table.HeadCell textAlign="right"># Photos</Table.HeadCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {itemCounts.map(i => (
            <Table.Row key={i.name}>
              <Table.Cell>{i.name}</Table.Cell>
              <Table.Cell textAlign="right">{i.count}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
};

export default CountByCollection;
