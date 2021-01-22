import { useEffect, useRef, Dispatch, SetStateAction, useState, EventListener } from "react";
import { Flex, Input, Button } from "bumbag";
import { QueryLazyOptions } from "@apollo/client";
import { Exact, SearchLocationsInput } from "../graphql-operations";

type Props = {
  searchString: string;
  setSearchString: Dispatch<SetStateAction<string>>;
  search: (options?: QueryLazyOptions<Exact<{ input: SearchLocationsInput }>> | undefined) => void;
};

const Search: React.FC<Props> = ({ searchString, setSearchString, search }) => {
  const searchInput = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  // If pressed key is our target key then set to true
  const downHandler = (event: EventListener) => {
    if (event.key === "/") {
      event.preventDefault();
      if (searchInput.current && searchInput.current != null) {
        searchInput.current.focus();
        searchInput.current.select();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, []);

  function handleSearchChange(e) {
    e.preventDefault();
    setSearchTerm(e.target.value);
  }

  const sendSearchTerm = e => {
    e.preventDefault();
    setSearchString(searchTerm);
  };

  return (
    <form onSubmit={sendSearchTerm}>
      <Flex flexDirection="row">
        <Input
          className="filter-input"
          ref={searchInput}
          value={searchTerm}
          onChange={handleSearchChange}
          before={<Input.Icon icon="solid-search" />}
          placeholder="Search..."
          width="300px"
          marginLeft="auto"
          marginRight="major-1"
          marginBottom="major-2"
        />
        <Button palette="primary" variant="outlined" type="submit" marginBottom="major-2">
          Search
        </Button>
      </Flex>
    </form>
  );
};

export default Search;
