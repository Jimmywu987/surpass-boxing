import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { AppContextType } from "next/dist/shared/lib/utils";
import { SessionProvider } from "next-auth/react";
import { store } from "@/redux/configureStore";
import Layout from "@/features/common/layout";
import { ChakraProvider } from "@chakra-ui/react";

const App = ({ Component, session, pageProps, data }: AppProps & any) => {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <ChakraProvider>
          <Layout initData={data}>
            <Component {...pageProps} initData={data} />
          </Layout>
        </ChakraProvider>
      </Provider>
    </SessionProvider>
  );
};

App.getInitialProps = async ({ Component, ctx }: AppContextType) => {
  const data: [] = [];
  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  return { pageProps, data };
};

export default App;
