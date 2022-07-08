import { ApolloClient, InMemoryCache } from "@apollo/client";


export const apolloClient = new ApolloClient({
  uri: `https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk-dev`,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          seasons: {
            keyArgs: false,
            // keyArgs: ["orderBy", "orderDirection"],
            read(existing, { args }) {
              // const { first, skip } = args as any;
              // // A read function should always return undefined if existing is
              // // undefined. Returning undefined signals that the field is
              // // missing from the cache, which instructs Apollo Client to
              // // fetch its value from your GraphQL server.
              // return existing && existing.slice(skip, skip + first);
              return existing;
            },
            merge(existing, incoming, { args }) {
              // const { skip = 0 } = (args as any);
              // // Slicing is necessary because the existing data is
              // // immutable, and frozen in development.
              // const merged = existing ? existing.slice(0) : [];
              // for (let i = 0; i < incoming.length; i+=1) {
              //   merged[skip + i] = incoming[i];
              // }
              // return merged;
              return [...(existing || []), ...incoming];
            },
          }
        }
      }
    }
  }),
});
