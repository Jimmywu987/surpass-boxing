import "@/styles/globals.css";

import Layout from "@/features/common/layout";
import { store } from "@/redux/configureStore";
import { ChakraProvider } from "@chakra-ui/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { trpc } from "@/utils/trpc";
const queryClient = new QueryClient();

const App = ({
  Component,
  session,
  pageProps,
}: AppProps & { session: Session }) => {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ChakraProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ChakraProvider>
        </Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(App);
