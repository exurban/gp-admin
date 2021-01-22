import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";
import { extractCritical } from "bumbag-server";
import { InitializeColorMode } from "bumbag";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const styles = extractCritical(initialProps.html);
    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          <style
            data-emotion-css={styles.ids.join(" ")}
            dangerouslySetInnerHTML={{ __html: styles.css }}
          />
        </>
      )
    };
  }
  render() {
    return (
      <Html>
        <Head />
        <body>
          <InitializeColorMode />
          <Main />
          <div id="modal" />
          <NextScript />
        </body>
      </Html>
    );
  }
}
