import { ApolloClient, InMemoryCache } from "@apollo/client";
import { LocalStorageWrapper, persistCache, persistCacheSync } from "apollo3-cache-persist";
import { QuerySeasonsArgs, Season } from "generated/graphql";

const seasonIntToIndex = (n: number) => n - 0;

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
          read(existing, { args, readField }) {
            const first       = args?.first;
            const startSeason = args?.where?.seasonInt_lte;       // could be larger than the biggest season
            
            console.debug(`[ApolloClient/seasons/read] read first = ${first} startSeason = ${startSeason} for ${existing?.length || 0} existing items`)

            if (!existing) return;
            
            let dataset;
            if (!first) {
              dataset = existing;
            } else {
              const maxSeason = Math.min(startSeason || existing.length, existing.length);
              
              // 0 = latest season; always defined
              // maxSeason = 6073
              // existing.length = 6074
              // left = 1
              // right = 1+1000 = 1001
              //
              // Length 6074
              // 0    6074
              // 1    6073
              // ....
              // 6071 2
              // 6072 1
              // 6073 0 (this doesnt exist)
              const left  = Math.max(0, seasonIntToIndex(existing.length - maxSeason)); 

              // n = oldest season
              const right = Math.min(seasonIntToIndex(left + first), existing.length - 1);

              console.debug(`[ApolloClient/seasons/read] left = ${left} ${readField("seasonInt", existing[left])}, right = ${right} ${readField("seasonInt", existing[right])}`, existing);

              // If one of the endpoints is missing, force refresh
              if (!existing[left] || !existing[right]) return;

              // first = 1000
              // existing.length = 6074
              // startIndex = 5074
              // endIndex = 6074
              dataset = existing.slice(left, right);
            }

            return dataset //.filter((x: any) => x !== null);
          },
          merge(existing = [], incoming, { args, readField }) {
            console.debug(`[ApolloClient] merge: `, incoming, args);

            // Slicing is necessary because the existing data is
            // immutable, and frozen in development.
            const merged = existing ? existing.slice(0) : [];

            // Seasons are indexed by seasonInt (could also parseInt the "id" field)
            // This structures stores seasons in ascending order such that
            // merged[0] = undefined
            // merged[1] = Season 1
            // merged[2] = ...
            for (let i = 0; i < incoming.length; i+=1) {
              const seasonInt = readField("seasonInt", incoming[i]);
              if (!seasonInt) throw new Error('Seasons queried without seasonInt');
              // if seasons are queried out of order this should
              // leave empty regions in the array.
              // let x = []
              // x[12] = 'asdf'
              // x     = [empty × 12, 'test']
              // x.length = 13
              // x[0]  = undefined
              merged[seasonIntToIndex(seasonInt as number)] = incoming[i];
            }
            
            console.debug(`[ApolloClient] merge: `, merged.reverse());

            // We complete operations on the array in ascending order,
            // but reverse it before saving back to the cache.
            // Reverse is O(n) while sorting during the read operation
            // is O(n*log(n)) and likely called more often.
            // return merged.reverse();
            return merged //.sort((a: any, b: any) => (readField("seasonInt", a) as number) - (readField("seasonInt", b) as number));
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
