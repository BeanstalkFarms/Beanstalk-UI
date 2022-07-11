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
           */
          read(existing, { args, readField }) {
            const first       = args?.first;
            const startSeason = args?.where?.seasonInt_lte;       // could be larger than the biggest season
            
            console.debug(`[ApolloClient/seasons/read] read first = ${first} startSeason = ${startSeason} for ${existing?.length || 0} existing items`, existing)

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
              // -----------
              // 0    6074
              // 1    6073
              // ....
              // 6071 2
              // 6072 1
              // 6073 0 (this doesnt exist)
              const left  = Math.max(
                0,                           // clamp to first index
                existing.length - maxSeason, // 
              ); 

              // n = oldest season
              const right = Math.min(
                left + first - 1,            //
                existing.length - 1,         // clamp to last index
              );

              console.debug(`[ApolloClient/seasons/read] READ:`)
              console.debug(`| left:  index = ${left}, season = ${readField("seasonInt", existing[left])}`);
              console.debug(`| right: index = ${right}, season = ${readField("seasonInt", existing[right])}`);
              console.debug(`| existing.length = ${existing.length}`);
              console.debug(`| existing[0] = ${readField("seasonInt", existing[0])}`, existing);
              console.debug(`| existing[${existing.length-1}] = ${readField("seasonInt", existing[existing.length - 1])}`);

              // If one of the endpoints is missing, force refresh
              if (!existing[left] || !existing[right]) return;

              // first = 1000
              // existing.length = 6074
              // startIndex = 5074
              // endIndex = 6074
              dataset = existing.slice(left, right+1); // slice = [left, right)
            }

            return dataset;
          },
          merge(existing = [], incoming, { args, readField }) {
            console.debug(`[ApolloClient] init merge: `, existing, incoming, args);

            // Slicing is necessary because the existing data is
            // immutable, and frozen in development.
            let merged = existing ? existing.slice(0).reverse() : [];

            // Seasons are indexed by seasonInt (could also parseInt the "id" field)
            // This structures stores seasons in ascending order such that
            // merged[0] = undefined
            // merged[1] = Season 1
            // merged[2] = ...
            for (let i = 0; i < incoming.length; i+=1) {
              const seasonInt = readField("seasonInt", incoming[i]);
              if (!seasonInt) throw new Error('Seasons queried without seasonInt');
              // Season 1 = Index 0
              merged[(seasonInt as number) - 1] = incoming[i];
            }
            
            merged = merged.reverse();

            console.debug(`[ApolloClient] merge: finalize`, merged);

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