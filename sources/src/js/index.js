"use strict";

function getBindEvent(target, eventKey) {
  return $(target).attr(eventKey);
}

function getTargetEvent(e, eventKey) {
  let target = e.target;
  while (target && !getBindEvent(target, eventKey)) {
    target = target.parentElement;
  }
  if (!target) return "";
  return $(target).attr(eventKey).split(":");
}

$(window).on("load", () => {
  getAssets()
    .then(([tokenList]) => {
      const networks = [];
      const commons = ["WETH", "WBNB", "DAI", "USDC", "USDT", "WBTC"];
      const commonTokens = {};
      window.variables.TOKEN_LIST = tokenList.tokens.reduce((a, { chainId, ...token }) => {
        if (!networks.includes(chainId)) networks.push(chainId);
        if (!a[chainId]) a[chainId] = [];
        a[chainId].push(token);
        if (!commonTokens[chainId]) commonTokens[chainId] = new Array(commons.length).fill(null);
        if (commons.findIndex((item) => item === token.symbol) >= 0) {
          commonTokens[chainId][commons.findIndex((item) => item === token.symbol)] = token;
        }
        return a;
      }, {});
      window.variables.TOKEN_LIST[97] = [{
        "name": "BUSD",
        "address": "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
        "symbol": "BUSD",
        "decimals": 18,
        "chainId": 97,
        "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png"
      },
      {
        "chainId": 97,
        "address": "0xB8d4DEBc77fE2D412f9bA5B22B33A8f6c4d9aE1e",
        "name": "Annex",
        "symbol": "ANN",
        "decimals": 18,
        "logoURI": "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png?1601374110"
      }];
      networks.forEach((network) => (commonTokens[network] = commonTokens[network].filter((item) => item)));
      window.variables.COMMON_TOKENS = commonTokens;
      setInterval(() => {
        triggerEvent("fetchRequest");
      }, 30 * 1000);

      triggerEvent("onLoad");
    })
    .catch(console.log);

  $(document).on("click", "[data-popup-dismiss]", function (e) {
    const bind = getBindEvent(e.target, "data-popup-dismiss");
    if (bind) {
      $(`#${bind}`).removeClass("is-active");
    }
  });

  $(document).on("click", "[data-event-click]", function (e) {
    e && e.preventDefault();
    const [key, params = ""] = getTargetEvent(e, "data-event-click");
    if (window.events[key]) triggerEvent(key, e, ...params.split(","));
  });

  $(document).on("change", "[data-event-change]", function (e) {
    const [key, params = ""] = getTargetEvent(e, "data-event-change");
    if (window.events[key]) triggerEvent(key, e, ...params.split(","));
  });

  $(document).on("keyup", "[data-event-input]", function (e) {
    const [key, params = ""] = getTargetEvent(e, "data-event-input");
    if (window.events[key]) triggerEvent(key, e, ...params.split(","));
  });

  $(document).on("submit", "[data-submit]", function (e) {
    e.preventDefault();
    const [key] = getTargetEvent(e, "data-submit");
    if (window.events[key]) triggerEvent(key);
  });
  $(document).tooltip();
});
