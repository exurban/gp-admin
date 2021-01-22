import { useQuery } from "@apollo/client";
import { PhotoCountByTagDocument } from "../../graphql-operations";
import { Table } from "bumbag";

const CountByTag: React.FC = () => {
  const { error, loading, data } = useQuery(PhotoCountByTagDocument);

  let itemCounts = [
    {
      name: "",
      count: 0
    }
  ];

  if (data && data.photoCountByTag) {
    const items = data.photoCountByTag.itemCountList;
    itemCounts = items?.map(item => ({
      name: item.name ? item.name : "Untagged",
      count: item.count
    }));
  }

  if (error) return <p>Error loading tag counts.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Table isHoverable _hover={{ cursor: "default" }}>
        <Table.Head>
          <Table.Row>
            <Table.HeadCell>Tag</Table.HeadCell>
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

export default CountByTag;
