import { ApolloClient, InMemoryCache } from "@apollo/client"
import { setContext } from '@apollo/client/link/context';
import Config from '../../config/config';
import { createUploadLink } from "apollo-upload-client";

const clientLink = createUploadLink({
  uri: Config.API_URL,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    }
  }
});

var client = new ApolloClient({
  link: authLink.concat(clientLink),
  cache: new InMemoryCache()
});

const initialState = {
  client: client,
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer
