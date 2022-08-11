import '../styles/globals.scss'
import '../styles/imm-part-land.webflow.scss'
import '../styles/normalize.scss'
import '../styles/webflow.scss'
import {AppProps} from "next/app";
import {MuiThemeProvider} from "@material-ui/core";
import {theme} from "../styles/theme";
import store from 'store/store';
import {Provider} from "react-redux";
import {ApolloProvider} from "@apollo/client";
import {client} from "../ApolloProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store} >
      <ApolloProvider client={client}>
        <MuiThemeProvider theme={theme}>
          <Component {...pageProps} />
        </MuiThemeProvider>
      </ApolloProvider>
    </Provider>
  )
}

export default MyApp
