import { useRef, Dispatch, SetStateAction, useState, FormEvent } from "react";
import { Flex, Input, Button } from "bumbag";
import { QueryLazyOptions } from "@apollo/client";

type Props = {
  searchString: string;
  setSearchString: Dispatch<SetStateAction<string>>;
  search: (options?: QueryLazyOptions<{ input: { searchString: string } }> | undefined) => void;
};

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Search: React.FC<Props> = ({ searchString, setSearchString, search }) => {
  const searchInput = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  function onSearchChange(e: FormEvent<HTMLInputElement>) {
    e.preventDefault();

    // @ts-ignore
    setSearchTerm(e.target.value);
    console.log(searchTerm);
  }

  const sendSearchTerm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchString(searchTerm);
  };

  return (
    <form onSubmit={sendSearchTerm}>
      <Flex flexDirection="row">
        <Input
          className="search-input"
          ref={searchInput}
          value={searchTerm}
          onChange={onSearchChange}
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
