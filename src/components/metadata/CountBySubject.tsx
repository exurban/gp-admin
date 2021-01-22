import { useQuery } from "@apollo/client";
import { PhotoCountBySubjectDocument } from "../../graphql-operations";
import { Table } from "bumbag";

const CountBySubject: React.FC = () => {
  const { error, loading, data } = useQuery(PhotoCountBySubjectDocument);

  let itemCounts = [
    {
      name: "",
      count: 0
    }
  ];

  if (data && data.photoCountBySubject) {
    const items = data.photoCountBySubject.itemCountList;
    if (items) {
      itemCounts = items.map(item => ({ name: item.name as string, count: item.count }));
    }
  }

  if (error) return <p>Error loading subject counts.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Table isHoverable _hover={{ cursor: "default" }}>
        <Table.Head>
          <Table.Row>
            <Table.HeadCell>Subject</Table.HeadCell>
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

export default CountBySubject;
