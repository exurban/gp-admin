import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import NextAuth, { InitOptions, User } from "next-auth";
import Providers from "next-auth/providers";

import { GraphQLClient } from "graphql-request";
import { GetApiTokenDocument, GetApiTokenInput } from "../../../graphql-operations";

const getApiToken = async (args: GetApiTokenInput) => {
  console.log(`Requesting API token with ${JSON.stringify(args, null, 2)}`);
  const api = process.env.API_URI as string;
  const graphQLClient = new GraphQLClient(api);

  const input = {
    input: {
      ...args
    }
  };
  // console.log(`Sending request with input: ${JSON.stringify(input, null, 2)}`);

  const token = await graphQLClient.request(GetApiTokenDocument, input);

  return token.getApiToken;
};

interface GPUser extends User {
  id: number;
  accessToken?: string;
}

const options: InitOptions = {
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string
    })
  ],
  // * remote DB config
  // database: {
  //   type: "postgres",
  //   host: "ec2-54-164-134-207.compute-1.amazonaws.com",
  //   port: 5432,
  //   username: "fmeyzsfzceclie",
  //   password: "f5ec6615aae00fea125d47cda8f0e1d198bbf7da33513fffcaa8952aa8afb8ee",
  //   database: "dc9mj4aesbuoo3",
  //   ssl: true,
  //   extra: {
  //     ssl: {
  //       rejectUnauthorized: false
  //     }
  //   }
  // },

  // * Local DB Config
  database: {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "photos"
  },
  session: {
    jwt: true
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET
  },
  pages: {
    signIn: "/auth/signIn",
    signOut: "/auth/signOut",
    error: "/auth/error"
  },
  callbacks: {
    signIn: async profile => {
      const authorizedEmailAddresses = [
        "brad@gibbs-photography.com",
        "boyd@gibbs-photography.com",
        "scott@gibbs-photography.com",
        "ivalbrecht@gmail.com"
      ];

      if (profile.email && authorizedEmailAddresses.includes(profile.email)) {
        console.log(`authorizing user with email: ${profile.email}`);
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    },
    // redirect: async (url, baseUrl) => { return Promise.resolve(baseUrl) },
    jwt: async (token, user: GPUser) => {
      // console.log(`***JWT CALLBACK***`);
      // token && console.log(`token: ${JSON.stringify(token, null, 2)}`);
      // user && console.log(`user: ${JSON.stringify(user, null, 2)}`);
      // account && console.log(`account: ${JSON.stringify(account, null, 2)}`);
      // profile && console.log(`profile: ${JSON.stringify(profile, null, 2)}`);
      // isNewUser && console.log(`isNewUser: ${JSON.stringify(isNewUser, null, 2)}`);
      if (user && user !== undefined) {
        const signinArgs = {
          userId: user.id,
          email: user.email as string
        };

        const apiToken = await getApiToken(signinArgs);
        console.log(`received API token: ${JSON.stringify(apiToken, null, 2)}`);
        token = { ...token, accessToken: apiToken };
        console.log(`set token to ${JSON.stringify(token, null, 2)}`);
      }
      return Promise.resolve(token);
    },
    session: async (session, user: GPUser) => {
      // console.log(`***SESSION***`);
      console.log(`USER: ${JSON.stringify(user, null, 2)}`);
      session.accessToken = user.accessToken;
      // console.log(
      //   `USER: ${JSON.stringify(user, null, 2)}\nSESSION: ${JSON.stringify(session, null, 2)}`
      // );
      return Promise.resolve(session);
    }
  },
  debug: true
};

const authHandler: NextApiHandler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, options);
export default authHandler;
