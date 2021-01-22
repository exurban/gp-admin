import CountByPhotographer from "../components/metadata/CountByPhotographer";
import CountByLocation from "../components/metadata/CountByLocation";
import CountBySubject from "../components/metadata/CountBySubject";
import CountByTag from "../components/metadata/CountByTag";
import CountByCollection from "../components/metadata/CountByCollection";

import { Flex, Heading } from "bumbag";

const Dashboard: React.FC = () => {
  return (
    <Flex className="pageWrapper" flexDirection="row" width="90%" marginX="auto" marginY="60px">
      <Flex className="countsColumn" flexDirection="column" maxWidth="600px">
        <Heading use="h3" marginTop="major-3">
          Counts by:
        </Heading>

        <Heading use="h4" marginTop="major-4">
          Photographer
        </Heading>
        <CountByPhotographer />

        <Heading use="h4" marginTop="major-4">
          Subject
        </Heading>
        <CountBySubject />

        <Heading use="h4" marginTop="major-4">
          Location
        </Heading>
        <CountByLocation />

        <Heading use="h4" marginTop="major-4">
          Tag
        </Heading>
        <CountByTag />

        <Heading use="h4" marginTop="major-4">
          Collection
        </Heading>
        <CountByCollection />
      </Flex>
      <Flex className="salesColumn" maxWidth="900px"></Flex>
    </Flex>
  );
};

export default Dashboard;
