const TOKEN_LIST = "https://tokens.annex.finance/";

function getAssets() {
  return Promise.all([
    $.get(TOKEN_LIST),
    // 
  ]);
}

function urlCheck(url) {
  return new Promise(resolve => $.get(url).then(() => resolve(true)).catch(() => resolve(0)));
}