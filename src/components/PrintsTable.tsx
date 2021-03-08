import { useMemo, useState, Dispatch, SetStateAction } from "react";
import { useApolloClient, useQuery, useLazyQuery } from "@apollo/client";
import { SearchPrintsDocument, Print } from "../graphql-operations";
import { Box, Flex, Icon, Button, Table, Text } from "bumbag";
import Search from "./Search";
import { orderBy } from "lodash";

type Props = {
  selectedItem: Print | undefined;
  setSelectedItem: Dispatch<SetStateAction<Print | undefined>>;
  isAddingOrEditing: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
};

const PrintsTable: React.FC<Props> = ({
  selectedItem,
  setSelectedItem,
  isAddingOrEditing,
  setIsAdding
}) => {
  const client = useApolloClient();
  const [searchString, setSearchString] = useState("");
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [sortAscending, setSortAscending] = useState(false);

  const [search, { data: searchData }] = useLazyQuery(SearchPrintsDocument, {
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
        title: "Type",
        attr: "type",
        sortable: true,
        width: "220px"
      },
      {
        title: "SKU",
        attr: "printSku",
        sortable: true,
        width: "120px"
      },
      {
        title: "Aspect",
        attr: "aspectRatio",
        sortable: true,
        width: "120px"
      },
      {
        title: "Dim. 1",
        attr: "dimension1",
        sortable: true,
        width: "90px"
      },
      {
        title: "Dim. 2",
        attr: "dimension2",
        sortable: true,
        width: "90px"
      },
      {
        title: "Cost",
        attr: "cost",
        sortable: true,
        width: "90px"
      },
      {
        title: "Ship Cost",
        attr: "shippingCost",
        sortable: true,
        width: "90px"
      },
      {
        title: "Price",
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
        title: "Resale",
        attr: "resale",
        sortable: true,
        width: "90px"
      },
      {
        title: "Markup",
        attr: "markup",
        sortable: true,
        width: "90px"
      }
    ],
    []
  );

  const { error, loading, data } = useQuery(SearchPrintsDocument, {
    variables: {
      input: {
        searchString: searchString
      }
    }
  });

  if (error) return <p>Error loading prints</p>;
  if (loading) return <p>Loading...</p>;

  const prints = searchData ? searchData.searchPrints : data?.searchPrints;

  /**
   * In-cache sorting.
   * @param orderBy Column used for sorting
   * @param orderAscending Boolean value: true = ASC, false = DESC
   */
  const sort = (sortBy: string, sortAscending: boolean): void => {
    const dir = sortAscending ? "asc" : "desc";
    const data = client.cache.readQuery({
      query: SearchPrintsDocument,
      variables: {
        input: {
          searchString: searchString
        }
      }
    });

    if (data) {
      client.cache.writeQuery({
        query: SearchPrintsDocument,
        data: {
          searchPrints: {
            __typename: "SearchPrintsResponse",
            datalist: orderBy([...data.searchPrints.datalist], sortBy, dir)
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

  const handleAddClick = () => {
    setSelectedItem(undefined);
    setIsAdding(true);
  };

  const handleRowClick = (pr: Print) => {
    if (isAddingOrEditing) {
      return;
    }

    setSelectedItem(pr);
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
            {prints?.datalist?.map(pr => (
              <Table.Row
                key={pr.id}
                // @ts-ignore
                onClick={() => handleRowClick(pr)}
                background={pr.id === selectedItem?.id ? "rgba(158, 70, 215, 0.7)" : undefined}
                color={pr.id === selectedItem?.id ? "white" : "text"}
              >
                <Table.Cell>{pr.name}</Table.Cell>
                <Table.Cell>{pr.type}</Table.Cell>
                <Table.Cell>{pr.printSku}</Table.Cell>
                <Table.Cell>{pr.aspectRatio}</Table.Cell>
                <Table.Cell>{pr.dimension1}"</Table.Cell>
                <Table.Cell>{pr.dimension2}"</Table.Cell>
                <Table.Cell>${pr.cost.toFixed(2)}</Table.Cell>
                <Table.Cell>${pr.shippingCost.toFixed(2)}</Table.Cell>
                <Table.Cell>${pr.basePrice.toFixed(2)}</Table.Cell>
                <Table.Cell>{pr.priceModifier * 100}%</Table.Cell>
                <Table.Cell>${(pr.basePrice * pr.priceModifier).toFixed(2)}</Table.Cell>
                <Table.Cell>${(pr.basePrice * pr.priceModifier - pr.cost).toFixed(2)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Box>
      <Button
        onClick={() => handleAddClick()}
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

export default PrintsTable;
