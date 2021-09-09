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
      // Test USDTT
      window.variables.TOKEN_LIST[3].push({
        address: "0x7cb884B088511ED6a85dfFE702747e46d536B031",
        decimals: 6,
        logoURI:
          "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
        name: "USDT Test",
        symbol: "USDTT",
      });
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
