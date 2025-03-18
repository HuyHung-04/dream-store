
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {},
  assets: {
    'index.csr.html': {size: 24095, hash: 'b11d847d52f73cda943de1823ec41b9b36b8266dba8dcc4ea4fab83a01e31ecc', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17669, hash: '93277ba0275b4cece169773e2a7077c0f98ac8a6231ab83615bcb85316ebaec2', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-CXQUZ3PB.css': {size: 6979, hash: 'mYIPdabeAag', text: () => import('./assets-chunks/styles-CXQUZ3PB_css.mjs').then(m => m.default)}
  },
};
