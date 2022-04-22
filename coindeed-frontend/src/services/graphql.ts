import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const BASE_GRAPH_API = process.env.REACT_APP_BASE_GRAPH_API_URL;

const client = new ApolloClient({
  uri: BASE_GRAPH_API,
  cache: new InMemoryCache(),
});

export const queryGraph = async (query: any, variables?: any) => {
  try {
    const response = await client.query({
      query: gql(query),
      variables: variables,
    });
    return [response, null];
  } catch (error) {
    console.log(error);
    return [null, error];
  }
};