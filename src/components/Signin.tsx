import { signIn } from "next-auth/client";
import Head from "next/head";

import { Icon, Stack, Flex, Heading, Button, Text } from "bumbag";

const SignIn: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign in</title>
        <meta
          name="sign in"
          content="Member sign in to add to favorites and shopping bag and to purchase art."
        />
      </Head>
      <Flex>
        <Stack
          className="stack-bjg"
          maxWidth="650px"
          height="100vh"
          marginX="auto"
          marginY="auto"
          alignY="center"
          alignX="center"
          spacing="major-2"
        >
          <>
            <Flex alignY="center">
              <Icon icon="gpLogo" fontSize="900" marginRight="major-3" />
              <Heading marginTop="major-1">Sign in.</Heading>
            </Flex>

            <Stack spacing="major-3" alignX="center" width="320px">
              <Button
                width="100%"
                palette="secondary"
                iconBefore="brands-google"
                borderRadius="4px"
                onClick={() => signIn("google")}
              >
                <Text fontSize="150">Continue with Google</Text>
              </Button>
            </Stack>
          </>
        </Stack>
      </Flex>
    </>
  );
};

export default SignIn;
