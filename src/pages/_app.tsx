import "@/styles/globals.css";

import Layout from "@/features/common/layout";
import { store } from "@/redux/configureStore";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Analytics } from "@vercel/analytics/react";
import { ChakraProvider } from "@chakra-ui/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { trpc } from "@/utils/trpc";

const App = ({
  Component,
  session,
  pageProps,
}: AppProps & { session: Session }) => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LcywMYlAAAAAA47FggnOSAc4BBOldk-r1tGDuZq">
      <SessionProvider session={session}>
        <Provider store={store}>
          <ChakraProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ChakraProvider>
        </Provider>
      </SessionProvider>
      <Analytics />
    </GoogleReCaptchaProvider>
  );
};

export default trpc.withTRPC(App);
