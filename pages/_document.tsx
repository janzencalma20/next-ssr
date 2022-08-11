import { ServerStyleSheets } from '@material-ui/core/styles';
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';

class MyDocument extends Document<DocumentInitialProps> {

  static async getInitialProps(ctx: DocumentContext) {
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => props => sheets.collect(<App {...props} />),
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: [
        ...React.Children.toArray(initialProps.styles),
        sheets.getStyleElement(),
      ],
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <link style={{ width: 16, height: 16 }} rel="shortcut icon" href="/static/favicon.ico" />
          <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;700;800&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&family=Ubuntu:ital,wght@0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet" />
          <script type="text/javascript" src="/assets/js/pendoScript.js"></script>
          <script
            id="pendo-agent"
            dangerouslySetInnerHTML={{
              __html: `(function (apiKey) {
\t\t\t(function (p, e, n, d, o) {
\t\t\t\tvar v, w, x, y, z; o = p[d] = p[d] || {}; o._q = [];
\t\t\t\tv = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track']; for (w = 0, x = v.length; w < x; ++w)(function (m) {
\t\t\t\t\to[m] = o[m] || function () { o._q[m === v[0] ? 'unshift' : 'push']([m].concat([].slice.call(arguments, 0))); };
\t\t\t\t})(v[w]);
\t\t\t\ty = e.createElement(n); y.async = !0; y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
\t\t\t\tz = e.getElementsByTagName(n)[0]; z.parentNode.insertBefore(y, z);
\t\t\t})(window, document, 'script', 'pendo');
\t\t})('0e78e810-2055-44cd-6e5b-417adaddc80d');`,
            }}
          />
          <script
            id="messaging-js-sdk"
            dangerouslySetInnerHTML={{
              __html: `
                if('%NEXT_PUBLIC_APP_ENV%' === 'prod'){
\t\t\t// We pre-filled your app ID in the widget URL: ‘https://widget.intercom.io/widget/avsprmqk’
\t\t\t(function () {
\t\t\t\tvar w = window; var ic = w.Intercom;
\t\t\t\tif (typeof ic === "function") {
\t\t\t\t\tic("reattach_activator");
\t\t\t\t\tic("update", w.intercomSettings);
\t\t\t\t} else {
\t\t\t\t\tvar d = document;
\t\t\t\t\tvar i = function () {
\t\t\t\t\t\ti.c(arguments);
\t\t\t\t\t};
\t\t\t\t\ti.q = [];
\t\t\t\t\ti.c = function (args) {
\t\t\t\t\t\ti.q.push(args);
\t\t\t\t\t};
\t\t\t\t\tw.Intercom = i;
\t\t\t\t\tvar l = function () {
\t\t\t\t\t\tvar s = d.createElement("script");
\t\t\t\t\t\ts.type = "text/javascript";
\t\t\t\t\t\ts.async = true;
\t\t\t\t\t\ts.src = "https://widget.intercom.io/widget/avsprmqk";
\t\t\t\t\t\tvar x = d.getElementsByTagName("script")[0];
\t\t\t\t\t\tx.parentNode.insertBefore(s, x);
\t\t\t\t\t};
\t\t\t\t\tif (w.attachEvent) {
\t\t\t\t\t\tw.attachEvent("onload", l);
\t\t\t\t\t} else {
\t\t\t\t\t\tw.addEventListener("load", l, false);
\t\t\t\t\t}
\t\t\t\t}
\t\t\t})();
\t\t} else {
\t\t\t// Start of immersionneuro wchat Widget script
      function initFreshChat() {
          window.fcWidget.init({
            token: "159de80f-c4ef-4b4b-adec-c4c06e01efbe",
            host: "https://wchat.freshchat.com"
          });
        }
        function initialize(i, t) {
          var e; i.getElementById(t) ? initFreshChat() : ((e = i.createElement("script")).id = t, e.async = !0, e.src = "https://wchat.freshchat.com/js/widget.js", e.onload = initFreshChat, i.head.appendChild(e))
        }
        function initiateCall() {
          initialize(document, "Freshdesk Messaging-js-sdk")
        }
        window.addEventListener ? window.addEventListener("load", initiateCall, !1) : window.attachEvent("load", initiateCall, !1);
      // End of immersionneuro wchat Widget script
\t\t}
              `,
            }}
          />
          <script
            id="cloudfront-tag"
            dangerouslySetInnerHTML={{
              __html: `window.__lo_site_id = 303228;

\t\t(function () {
\t\t\tvar wa = document.createElement('script'); wa.type = 'text/javascript'; wa.async = true;
\t\t\twa.src = 'https://d10lpsik1i8c69.cloudfront.net/w.js';
\t\t\tvar s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(wa, s);
\t\t})();`,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
