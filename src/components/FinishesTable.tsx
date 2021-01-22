import { useMemo, useState, Dispatch, SetStateAction } from "react";
import { useApolloClient, useQuery, useLazyQuery } from "@apollo/client";
import { SearchFinishesDocument, Finish } from "../graphql-operations";
import { Box, Flex, Icon, Button, Table, Text } from "bumbag";
import Search from "./Search";
import { orderBy } from "lodash";

type Props = {
  selectedItem: Finish | undefined;
  setSelectedItem: Dispatch<SetStateAction<Finish | undefined>>;
  isAddingOrEditing: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
};

const FinishesTable: React.FC<Props> = ({
  selectedItem,
  setSelectedItem,
  isAddingOrEditing,
  setIsAdding
}) => {
  const client = useApolloClient();
  const [searchString, setSearchString] = useState("");
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [sortAscending, setSortAscending] = useState(false);

  const [search, { data: searchData }] = useLazyQuery(SearchFinishesDocument, {
    variables: {
      input: {
        searchString: searchString
      }
    }
  });

  /**
   * Column name (title) and attr., which should match property key from database.
   */
  const columns = useMemo(
    () => [
      {
        title: "Name",
        attr: "name",
        sortable: true,
        width: "220px"
      },
      {
        title: "SKU",
        attr: "finishSku",
        sortable: true,
        width: "120px"
      },
      {
        title: "Width",
        attr: "width",
        sortable: true,
        width: "90px"
      },
      {
        title: "Height",
        attr: "height",
        sortable: true,
        width: "90px"
      },
      {
        title: "Depth",
        attr: "depth",
        sortable: true,
        width: "90px"
      },
      {
        title: "Weight",
        attr: "weight",
        sortable: true,
        width: "90px"
      },
      {
        title: "Ship. Wt.",
        attr: "shippingWeight",
        sortable: true,
        width: "90px"
      },
      {
        title: "Base",
        attr: "basePrice",
        sortable: true,
        width: "90px"
      },
      {
        title: "Mod.",
        attr: "priceModifier",
        sortable: true,
        width: "90px"
      },
      {
        title: "Count",
        attr: "countOfPhotos",
        sortable: true,
        width: "90px"
      }
    ],
    []
  );

  const { error, loading, data } = useQuery(SearchFinishesDocument, {
    variables: {
      input: {
        searchString: searchString
      }
    }
  });

  if (error) return <p>Error loading finishes</p>;
  if (loading) return <p>Loading...</p>;

  const locations = searchData ? searchData.searchFinishes : data?.searchFinishes;

  /**
   * In-cache sorting.
   * @param orderBy Column used for sorting
   * @param orderAscending Boolean value: true = ASC, false = DESC
   */
  const sort = (sortBy: string, sortAscending: boolean): void => {
    const dir = sortAscending ? "asc" : "desc";
    const data = client.cache.readQuery({
      query: SearchFinishesDocument,
      variables: {
        input: {
          searchString: searchString
        }
      }
    });

    if (data) {
      client.cache.writeQuery({
        query: SearchFinishesDocument,
        data: {
          searchFinishes: {
            __typename: "SearchFinishesResponse",
            datalist: orderBy([...data.searchFinishes.datalist], sortBy, dir)
          }
        },
        variables: {
          input: {
            searchString: searchString
          }
        }
      });
    }
  };

  const handleHeaderClick = (idx: number) => {
    if (columns[idx].sortable === false) {
      return;
    }

    if (idx === selectedColumn) {
      setSortAscending(!sortAscending);
    } else {
      setSelectedColumn(idx);
      setSortAscending(true);
    }
    sort(columns[selectedColumn].attr, sortAscending);
  };

  const handleRowClick = (fin: Finish) => {
    console.log(`clicked row: ${fin.name}`);
    setSelectedItem(fin);
  };

  return (
    <Flex marginTop="80px" marginX="auto" flexDirection="column" maxHeight="500px">
      <Search searchString={searchString} setSearchString={setSearchString} search={search} />

      <Box
        className="table-wrapper"
        maxHeight="400px"
        overflowY="scroll"
        border="1px solid white800"
        borderRadius="6px"
        _hover={{ cursor: "default" }}
      >
        <Table isHoverable hasDividers overflow="unset">
          <Table.Head>
            <Table.Row>
              {columns.map((col, idx) => (
                <Table.HeadCell
                  className="header-cell"
                  key={idx}
                  position="sticky"
                  top="0"
                  backgroundColor="default"
                  onClick={() => handleHeaderClick(idx)}
                >
                  <Flex alignItems="baseline" fontSize="150" width={col.width}>
                    <Text.Block fontSize="100" marginRight="major-1">
                      {col.title}
                    </Text.Block>

                    <Icon
                      icon={sortAscending ? "solid-caret-up" : "solid-caret-down"}
                      visibility={selectedColumn === idx ? "visible" : "hidden"}
                    />
                  </Flex>
                </Table.HeadCell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {locations?.datalist?.map(fin => (
              <Table.Row
                key={fin.id}
                // @ts-ignore
                onClick={() => handleRowClick(fin)}
                background={fin.id === selectedItem?.id ? "rgba(158, 70, 215, 0.7)" : undefined}
                color={fin.id === selectedItem?.id ? "white" : "text"}
              >
                <Table.Cell>{fin.name}</Table.Cell>
                <Table.Cell>{fin.finishSku}</Table.Cell>
                <Table.Cell>{fin.width}</Table.Cell>
                <Table.Cell>{fin.height}</Table.Cell>
                <Table.Cell>{fin.depth}</Table.Cell>
                <Table.Cell>{fin.weight}</Table.Cell>
                <Table.Cell>{fin.shippingWeight}</Table.Cell>
                <Table.Cell>{fin.basePrice}</Table.Cell>
                <Table.Cell>{fin.priceModifier}</Table.Cell>
                <Table.Cell style={{ textAlign: "center" }}>{fin.countOfPhotos}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Box>
      <Button
        onClick={() => setIsAdding(true)}
        width="80px"
        palette="primary"
        marginLeft="auto"
        marginRight="major-1"
        marginTop="major-2"
        disabled={isAddingOrEditing}
      >
        Add
      </Button>
    </Flex>
  );
};

export default FinishesTable;
