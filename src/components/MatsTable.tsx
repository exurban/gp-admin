import { useMemo, useState, Dispatch, SetStateAction } from "react";
import { useApolloClient, useQuery, useLazyQuery } from "@apollo/client";
import { SearchMatsDocument, Mat } from "../graphql-operations";
import { Box, Flex, Icon, Button, Table, Text } from "bumbag";
import Search from "./Search";
import { orderBy } from "lodash";

type Props = {
  selectedItem: Mat | undefined;
  setSelectedItem: Dispatch<SetStateAction<Mat | undefined>>;
  isAddingOrEditing: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
};

const MatsTable: React.FC<Props> = ({
  selectedItem,
  setSelectedItem,
  isAddingOrEditing,
  setIsAdding
}) => {
  const client = useApolloClient();
  const [searchString, setSearchString] = useState("");
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [sortAscending, setSortAscending] = useState(false);

  const [search, { data: searchData }] = useLazyQuery(SearchMatsDocument, {
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
        title: "Color",
        attr: "color",
        sortable: true,
        width: "220px"
      },
      {
        title: "Print Type",
        attr: "printType",
        sortable: true,
        width: "220px"
      },
      {
        title: "SKU",
        attr: "matSku",
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

  const { error, loading, data } = useQuery(SearchMatsDocument, {
    variables: {
      input: {
        searchString: searchString
      }
    }
  });

  if (error) return <p>Error loading prints</p>;
  if (loading) return <p>Loading...</p>;

  const mats = searchData ? searchData.searchMats : data?.searchMats;

  /**
   * In-cache sorting.
   * @param orderBy Column used for sorting
   * @param orderAscending Boolean value: true = ASC, false = DESC
   */
  const sort = (sortBy: string, sortAscending: boolean): void => {
    const dir = sortAscending ? "asc" : "desc";
    const data = client.cache.readQuery({
      query: SearchMatsDocument,
      variables: {
        input: {
          searchString: searchString
        }
      }
    });

    if (data) {
      client.cache.writeQuery({
        query: SearchMatsDocument,
        data: {
          searchMats: {
            __typename: "SearchMatsResponse",
            datalist: orderBy([...data.searchMats.datalist], sortBy, dir)
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

  const handleRowClick = (mat: Mat) => {
    if (isAddingOrEditing) {
      return;
    }

    setSelectedItem(mat);
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
            {mats?.datalist?.map(mat => (
              <Table.Row
                key={mat.id}
                // @ts-ignore
                onClick={() => handleRowClick(mat)}
                background={mat.id === selectedItem?.id ? "rgba(158, 70, 215, 0.7)" : undefined}
                color={mat.id === selectedItem?.id ? "white" : "text"}
              >
                <Table.Cell>{mat.name}</Table.Cell>
                <Table.Cell>{mat.color}</Table.Cell>
                <Table.Cell>{mat.printType}</Table.Cell>
                <Table.Cell>{mat.matSku}</Table.Cell>
                <Table.Cell>{mat.aspectRatio}</Table.Cell>
                <Table.Cell>{mat.dimension1}</Table.Cell>
                <Table.Cell>{mat.dimension2}</Table.Cell>
                <Table.Cell>${mat.cost.toFixed(2)}</Table.Cell>
                <Table.Cell>${mat.shippingCost.toFixed(2)}</Table.Cell>
                <Table.Cell>${mat.basePrice.toFixed(2)}</Table.Cell>
                <Table.Cell>{(mat.priceModifier * 100).toFixed(2)}%</Table.Cell>
                <Table.Cell>${(mat.basePrice * mat.priceModifier).toFixed(2)}</Table.Cell>
                <Table.Cell>
                  ${(mat.basePrice * mat.priceModifier - mat.cost).toFixed(2)}
                </Table.Cell>
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

export default MatsTable;
