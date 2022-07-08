import { ApolloClient, InMemoryCache } from "@apollo/client";
import { LocalStorageWrapper, persistCache, persistCacheSync } from "apollo3-cache-persist";
import { QuerySeasonsArgs, Season } from "generated/graphql";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        seasons: {
          // Don't cache separate results based on
          // any of this field's arguments.
          keyArgs: false,
          
          /**
           * ordered by season index, increasing
           * [
           *    "Season:0",
           *    "Season:1"
           *    ...
           *    "Season:6074"
           * ]
           */

          //
          read(existing, { args }) {
            const first       = args?.first;
            const startSeason = args?.where?.seasonInt_lte; // could be larger than the biggest season
            
            console.debug(`[ApolloClient/seasons/read] read first = ${first} startSeason = ${startSeason} for ${existing?.length || 0} existing items`)

            if (!existing) return;

            const count      = first || existing.length;          // number of items to return
            const startIndex = startSeason                        // index in the array to count DOWN from
              ? Math.min(startSeason, existing.length)   
              : existing.length;
            const endIndex    = Math.max(startIndex - count, 0);  //

            console.debug(`[ApolloClient/seasons/read] returning ${count} items from index ${endIndex}-${startIndex} in existing (length = ${existing.length})`);

            return existing.slice(
              Math.max(
                first ? (existing.length - first) : 0,
                0
              ),
              existing.length,
            ) //.slice(endIndex, startIndex);
          },
          merge(existing = [], incoming, { args, readField }) {
            console.debug(`[ApolloClient] merge: `, existing, incoming[0], args)
            // const { where: { seasonInt_lte } } = (args as QuerySeasonsArgs);
            // const { where, first } = (args as QuerySeasonsArgs);
            // const x = where?.seasonInt_lte;

            // Slicing is necessary because the existing data is
            // immutable, and frozen in development.
            const merged = existing ? existing.slice(0) : [];

            // Seasons are indexed by seasonInt
            for (let i = 0; i < incoming.length; i+=1) {
              const seasonInt = readField("seasonInt", incoming[i]);
              if (!seasonInt) throw new Error('Seaons queried without seasonIn');
              // if seasons are queried out of order this should
              // leave empty regions in the array.
              // let x = []
              // x[12] = 'asdf'
              // x     = [empty × 12, 'test']
              // x[0]  = undefined
              merged[seasonInt as number] = incoming[i];
            }
            return merged;
          },
        }
      }
    }
  }
});

persistCacheSync({
  cache,
  storage: new LocalStorageWrapper(window.localStorage),
});

export const apolloClient = new ApolloClient({
  uri: `https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk-dev`,
  cache,
});

// // A read function should always return undefined if existing is
// // undefined. Returning undefined signals that the field is
// // missing from the cache, which instructs Apollo Client to
// // fetch its value from your GraphQL server.
// return existing && existing.slice(skip, skip + first);

// return existing && existing.filter()
