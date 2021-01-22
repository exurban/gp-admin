import { useQuery } from "@apollo/client";
import { PhotoCountByPhotographerDocument } from "../../graphql-operations";
import { Table } from "bumbag";

const CountByPhotographer: React.FC = () => {
  const { error, loading, data } = useQuery(PhotoCountByPhotographerDocument);

  let itemCounts = [
    {
      name: "",
      count: 0
    }
  ];

  if (data && data.photoCountByPhotographer) {
    const items = data.photoCountByPhotographer.itemCountList;
    if (items) {
      itemCounts = items.map(item => ({ name: item.name as string, count: item.count }));
    }
  }

  if (error) return <p>Error loading photographer counts.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Table isHoverable _hover={{ cursor: "default" }}>
        <Table.Head>
          <Table.Row>
            <Table.HeadCell>Photographer</Table.HeadCell>
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

export default CountByPhotographer;
