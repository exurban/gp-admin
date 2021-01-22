import { useState, useMemo, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";
import { useQuery, useLazyQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  SearchPhotosDocument,
  Photo,
  AddPhotoDocument,
  AddPhotoMutationVariables
} from "../graphql-operations";

import { Box, Flex, Icon, Button, Table, Text } from "bumbag";
import Search from "./Search";
import { orderBy } from "lodash";

type Props = {
  selectedItem: Photo | undefined;
  setSelectedItem: Dispatch<SetStateAction<Photo | undefined>>;
};

const PhotosTable: React.FC<Props> = () => {
  const client = useApolloClient();
  const [searchString, setSearchString] = useState("");
  const [selectedItem, setSelectedItem] = useState<Photo | undefined>(undefined);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [sortAscending, setSortAscending] = useState(false);
  const router = useRouter();

  const [addPhoto] = useMutation(AddPhotoDocument, {
    onCompleted(data) {
      // once the photo has been added, use the new sku to route to the edit-photo page
      const sku = data.addPhoto.sku;
      router.push(`edit-photo/${encodeURIComponent(sku)}`);
    }
  });

  const [search, { data: searchData }] = useLazyQuery(SearchPhotosDocument, {
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
        title: "SKU",
        attr: "sku",
        sortable: true,
        width: 80
      },
      {
        title: "Rating",
        attr: "rating",
        sortable: true
      },
      {
        title: "Sort Index",
        attr: "sortIndex",
        sortable: true
      },
      {
        title: "Title",
        attr: "title",
        sortable: true
      },
      {
        title: "Photographer",
        attr: "photographer.name",
        sortable: true
      },
      {
        title: "Location",
        attr: "location.name",
        sortable: true
      },
      {
        title: "Featured",
        attr: "isFeatured",
        sortable: true
      },
      {
        title: "LTD.",
        attr: "isLimitedEdition",
        sortable: true
      },
      {
        title: "Base Price",
        attr: "basePrice",
        sortable: true
      },
      {
        title: "Modifier",
        attr: "priceModifier",
        sortable: true
      },
      {
        title: "Subjects",
        attr: "subjects",
        sortable: false
      },
      {
        title: "Tags",
        attr: "tags",
        sortable: false
      },
      {
        title: "Collections",
        attr: "collections",
        sortable: false
      }
    ],
    []
  );

  const { error, loading, data } = useQuery(SearchPhotosDocument, {
    variables: {
      input: {
        searchString: searchString
      }
    }
  });

  const photos = searchData ? searchData.searchPhotos : data?.searchPhotos;

  /**
   * In-cache sorting.
   * @param orderBy Column used for sorting
   * @param orderAscending Boolean value: true = ASC, false = DESC
   */
  const sort = (sortBy: string, sortAscending: boolean): void => {
    const dir = sortAscending ? "asc" : "desc";
    const data = client.cache.readQuery({
      query: SearchPhotosDocument,
      variables: {
        input: {
          searchString: searchString
        }
      }
    });

    if (data) {
      client.cache.writeQuery({
        query: SearchPhotosDocument,
        data: {
          searchPhotos: {
            __typename: "SearchPhotosResponse",
            datalist: orderBy([...data.searchPhotos.datalist], sortBy, dir)
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

  const handleRowClick = (p: Photo) => {
    console.log(`clicked row: ${p.sku}`);
    setSelectedItem(p);
  };

  const handleRowDoubleClick = (sku: number) => {
    // <Link href={`/gallery/collection/${encodeURIComponent(sku)}`}></Link>
    router.push(`edit-photo/${encodeURIComponent(sku)}`);
  };

  const handleAddPhoto = () => {
    const addVariables: AddPhotoMutationVariables = {
      input: {}
    };
    addPhoto({
      variables: addVariables
    });
  };

  if (error) return <p>Error loading photos</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <Flex marginX="auto" flexDirection="column" maxHeight="90%">
      <Search searchString={searchString} setSearchString={setSearchString} search={search} />

      <Box
        className="table-wrapper"
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
            {photos?.datalist?.map(p => (
              <Table.Row
                key={p.sku}
                // @ts-ignore
                onClick={() => handleRowClick(p)}
                onDoubleClick={() => handleRowDoubleClick(p.sku)}
                background={p.id === selectedItem?.id ? "rgba(158, 70, 215, 0.7)" : undefined}
                color={p.id === selectedItem?.id ? "white" : "text"}
              >
                <Table.Cell>{p.sku}</Table.Cell>
                <Table.Cell>{p.rating}</Table.Cell>
                <Table.Cell>{p.sortIndex}</Table.Cell>
                <Table.Cell>{p.title}</Table.Cell>
                <Table.Cell>{p.photographer?.name}</Table.Cell>
                <Table.Cell>{p.location?.name}</Table.Cell>
                <Table.Cell style={{ textAlign: "center" }}>
                  <input type="radio" readOnly checked={p.isFeatured} />
                </Table.Cell>
                <Table.Cell style={{ textAlign: "center" }}>
                  <input type="radio" readOnly checked={p.isLimitedEdition} />
                </Table.Cell>
                <Table.Cell style={{ textAlign: "right" }}>${p.basePrice}</Table.Cell>
                <Table.Cell style={{ textAlign: "center" }}>{p.priceModifier}</Table.Cell>
                <Table.Cell>{p.subjectsInPhoto?.map(s => s.subject.name).join(", ")}</Table.Cell>
                <Table.Cell>{p.tagsForPhoto?.map(t => t.tag.name).join(", ")}</Table.Cell>
                <Table.Cell>
                  {p.collectionsForPhoto?.map(c => c.collection.name).join(", ")}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Box>

      <Button
        iconBefore="solid-plus"
        palette="primary"
        width="120px"
        marginTop="major-2"
        marginLeft="auto"
        marginRight="major-1"
        onClick={() => handleAddPhoto()}
      >
        Add
      </Button>
    </Flex>
  );
};

export default PhotosTable;
