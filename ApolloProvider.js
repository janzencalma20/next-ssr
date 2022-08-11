import React from "react"
import fetch from "node-fetch"
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"
import { setContext } from "apollo-link-context"

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_APP_MODRATE_API_URL,
  fetch: fetch
});

const authLink = setContext(() => {
  return {
    headers: {
      Authorization: ""
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});