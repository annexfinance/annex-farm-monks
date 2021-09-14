"use strict";

var NETWORK = 1;
const NETWORK_BSC = 56;
const SI_SYMBOLS = ["", "k", "M", "G", "T", "P", "E"];
const ANNEX_FARM_URL =
  "https://api.thegraph.com/subgraphs/name/swipewallet/exchange";
const SWIPE_SWAP_BSC_URL =
  "https://api.bscgraph.org/subgraphs/id/QmdWgpk8reg9ZfjUQZqpmApANMQWPRLYUX2wweDRjghQGb";
const MASTERCHEF_URL =
  "https://api.thegraph.com/subgraphs/name/swipewallet/swipeswap";
const MASTERCHEF_BSC_URL =
  "https://api.bscgraph.org/subgraphs/id/QmddRFPdu65WizL71XRJg7TnoNjKXyb9tQsXGNVUbH24p2";
const BLOCK_URL =
  "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks";
const BSC_BLOCK_URL =
  "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks";
const CONTRACT_TOKEN_ADDRESS = "0x8CE9137d39326AD0cD6491fb5CC0CbA0e089b6A9";
const CONTRACT_TOKEN_BSC_ADDRESS = "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A";
const ETH_PROVIDER =
  "https://mainnet.infura.io/v3/2d70a791e0fd434f865b0a272da5be8f";
const BSC_PROVIDER = "https://bsc-dataseed.binance.org/";
var index = 0;

window.onload = function () {
  window.variables.info = {};
  window.events.init = init;
  window.triggers.onLoad = [...(window.triggers.onLoad || []), "init"];

  $(document).on("click", ".chain-selector .selector", function (e) {
    e.preventDefault();
    $("#pools-table").empty();
    $(".view-more").show();
    index = 0;
    if ($(this).hasClass("eth-chooser")) {
      NETWORK = 56;
      renderTable(window.variables.info.bscFilteredPools.slice(0, 3));
      $(".chain-selector .chain-name.eth").removeClass("selected");
      $(".chain-selector .chain-name.bsc").addClass("selected");
      $(this).removeClass("eth-chooser");
      $(this).addClass("bsc-chooser");
      $(this).find("img")[0].src = "images/bnb.svg";
    } else {
      NETWORK = 1;
      renderTable(window.variables.info.filteredPools.slice(0, 3));
      $(".chain-selector .chain-name.eth").addClass("selected");
      $(".chain-selector .chain-name.bsc").removeClass("selected");
      $(this).removeClass("bsc-chooser");
      $(this).addClass("eth-chooser");
      $(this).find("img")[0].src = "images/eth3.svg";
    }
    index = 1;
  });

  $(document).on("click", ".view-more", function (e) {
    e.preventDefault();
    let pools = [];
    if (NETWORK == 1) {
      const last =
        (index + 1) * 3 > window.variables.info.filteredPools.length
          ? window.variables.info.filteredPools.length
          : (index + 1) * 3;
      pools = window.variables.info.filteredPools.slice(index * 3, last);
      if (last == window.variables.info.filteredPools.length) {
        $(".view-more").hide();
      }
    } else {
      const last =
        (index + 1) * 3 > window.variables.info.bscFilteredPools.length
          ? window.variables.info.bscFilteredPools.length
          : (index + 1) * 3;
      pools = window.variables.info.bscFilteredPools.slice(index * 3, last);
      if (last == window.variables.info.bscFilteredPools.length) {
        $(".view-more").hide();
      }
    }
    renderTable(pools);
    index++;
  });
};

function init() {
  initData()
    .then(({ token, pairs, bscToken, bscPairs }) => {
      let totalLiquidity = new BigNumber(0);
      let totalEthLiquidity = new BigNumber(0);
      let totalBscLiquidity = new BigNumber(0);
      pairs.forEach((p) => {
        totalEthLiquidity = new BigNumber(totalEthLiquidity).plus(p.reserveUSD);
      });
      bscPairs.forEach((p) => {
        totalBscLiquidity = new BigNumber(totalBscLiquidity).plus(p.reserveUSD);
      });
      totalLiquidity = totalEthLiquidity.plus(totalBscLiquidity);

      let pair = null;
      let sxpPrice = 0;
      let sxpVolume = 0;
      let sxpFee = 0;
      let sxpVolume24 = 0;
      if (token.quotePairs) {
        pair = token.quotePairs.find(
          (p) => p.token0.symbol == "USDT" && p.token1.symbol == "SXP"
        );

        if (pair) {
          sxpPrice = new BigNumber(pair.token1Price).dp(2, 1).toNumber();
          sxpVolume = new BigNumber(sxpVolume).plus(token.untrackedVolumeUSD);
          sxpFee = new BigNumber(token.untrackedVolumeUSD).times(0.003);
          sxpVolume24 = new BigNumber(sxpVolume24)
            .plus(pair.volumeUSD)
            .toNumber();
        }
      }

      if (!pair && token.basePairs) {
        pair = token.basePairs.find(
          (p) => p.token1.symbol == "USDT" && p.token0.symbol == "SXP"
        );

        if (pair) {
          sxpPrice = new BigNumber(pair.token1Price).toNumber();
          sxpVolume = new BigNumber(sxpVolume).plus(token.untrackedVolumeUSD);
          sxpFee = new BigNumber(token.untrackedVolumeUSD).times(0.003);
          sxpVolume24 = new BigNumber(sxpVolume24)
            .plus(pair.volumeUSD)
            .toNumber();
        }
      }

      let bscPair = null;
      if (bscToken.quotePairs) {
        bscPair = bscToken.quotePairs.find(
          (p) => p.token0.symbol == "USDT" && p.token1.symbol == "SXP"
        );

        if (bscPair) {
          sxpVolume = new BigNumber(sxpVolume).plus(
            bscToken.untrackedVolumeUSD
          );
          sxpFee = new BigNumber(sxpFee).plus(
            bscToken.untrackedVolumeUSD * 0.003
          );
          sxpVolume24 = new BigNumber(sxpVolume24)
            .plus(bscPair.volumeUSD)
            .toNumber();
        }
      }

      if (!bscPair && bscToken.basePairs) {
        bscPair = bscToken.basePairs.find(
          (p) => p.token1.symbol == "USDT" && p.token0.symbol == "SXP"
        );

        if (bscPair) {
          sxpVolume = new BigNumber(sxpVolume).plus(
            bscToken.untrackedVolumeUSD
          );
          sxpFee = new BigNumber(sxpFee).plus(
            bscToken.untrackedVolumeUSD * 0.003
          );
          sxpVolume24 = new BigNumber(sxpVolume24)
            .plus(bscPair.volumeUSD)
            .toNumber();
        }
      }
      updateInfo(
        sxpPrice,
        sxpVolume.toNumber(),
        sxpFee.toNumber(),
        totalLiquidity
      );
    })
    .catch(console.log);

  window.variables.info = {
    filteredPools: [],
    bscFilteredPools: []
  };
  loadPools()
    .then((filteredPools) => {
      window.variables.info.filteredPools = filteredPools;

      if (NETWORK == 1) {
        renderTable(filteredPools.slice(0, 3));
        index = 1;
      }
    })
    .catch(console.log);

  loadPoolsBSC()
    .then(bscFilteredPools => {
      window.variables.info.bscFilteredPools = bscFilteredPools;

      if (NETWORK == 56) {
        renderTable(bscFilteredPools.slice(0, 3));
        index = 1;
      }
    })
    .catch(console.log);
}

function initData() {
  const tokens = window.variables.TOKEN_LIST[NETWORK];
  const bscTokens = window.variables.TOKEN_LIST[NETWORK_BSC];

  const sxp = tokens.find((token) => token.symbol == "SXP");
  const bscSxp = bscTokens.find((token) => token.symbol == "SXP");

  return Promise.all([
    getToken(sxp.address, ANNEX_FARM_URL),
    getFullPairs(0, 1000, ANNEX_FARM_URL),
    getToken(bscSxp.address, SWIPE_SWAP_BSC_URL),
    getFullPairs(0, 1000, SWIPE_SWAP_BSC_URL),
  ])
    .then(function ([token, pairs, bscToken, bscPairs]) {
      return { token, pairs, bscToken, bscPairs };
    })
    .catch(console.log);
}

function updateInfo(sxpPrice, sxpVolume, sxpFee, sxpVolume24) {
  $("#sxp_price span").text(`$${abbreviateNumberSI(sxpPrice, 0, 2)}`);
  $("#sxp_volume span").text(`$${abbreviateNumberSI(sxpVolume, 0, 2)}`);
  $("#sxp_fee span").text(`$${abbreviateNumberSI(sxpFee, 0, 2)}`);
  $("#sxp_volume24 span").text(`$${abbreviateNumberSI(sxpVolume24, 0, 2)}`);
}

function loadPools() {
  return Promise.all([
    getPools(MASTERCHEF_URL),
    getAverageBlockTime(BLOCK_URL),
    getToken(CONTRACT_TOKEN_ADDRESS, ANNEX_FARM_URL),
    getEthPrice(ANNEX_FARM_URL),
  ]).then(function ([
    pools,
    averageBlockTime,
    token,
    bundles,
  ]) {
    const ethPrice = bundles.length !== 0 ? bundles[0].ethPrice : 0;
    const swipePrice = ethPrice * token.derivedETH;
    const pairAddresses = pools.map((pool) => pool.pair).sort();

    return Promise.all([
      getPairs(pairAddresses, ANNEX_FARM_URL),
      getFarmSLPBalanceForInfo(
        pools,
        window.values[1].CONTRACT_MASTERCHEF_ADDRESS,
        ETH_PROVIDER
      ),
    ])
      .then(function ([
        pairs,
        { balances, pairTokenContracts },
      ]) {
        const filteredPools = pools
          .filter(
            (pool) =>
              !window.variables.POOL_DENY.includes(pool.id) &&
              pool.allocPoint !== "0" &&
              pairs.find((pair) => pair?.id === pool.pair)
          )
          .map((pool) => {
            const pair = pairs.find((pair) => pair.id === pool.pair);

            const balance = balances[pool.pair].balance.toString(10); // Number(pool.balance / 1e18);
            const blocksPerHour = 3600 / averageBlockTime;

            const balanceUSD =
              (balance / Number(pair.totalSupply)) * Number(pair.reserveUSD);

            const rewardPerBlock =
              ((pool.allocPoint / pool.owner.totalAllocPoint) *
                pool.owner.annexPerBlock) /
              1e18;

            const roiPerBlock = balanceUSD
              ? (rewardPerBlock * 2 * swipePrice) / balanceUSD
              : 0;
            const roiPerHour = roiPerBlock * blocksPerHour;
            const roiPerDay = roiPerHour * 24;
            const roiPerMonth = roiPerDay * 30;
            const roiPerYear = roiPerMonth * 12;
            return {
              ...pool,
              liquidityPair: pair,
              roiPerBlock,
              roiPerHour,
              roiPerDay,
              roiPerMonth,
              roiPerYear,
              rewardPerThousand: 1 * roiPerDay * (1000 / swipePrice),
            };
          })
          .sort((a, b) => {
            return Number(b.roiPerYear) - Number(a.roiPerYear)
          });

        return filteredPools;
      })
      .catch(console.log);
  });
}

function loadPoolsBSC() {
  return Promise.all([
    getPoolsFromBSC(),
    getToken(CONTRACT_TOKEN_BSC_ADDRESS, SWIPE_SWAP_BSC_URL),
    getEthPrice(SWIPE_SWAP_BSC_URL),
  ]).then(function ([
    bscPools,
    bscToken,
    bscBundles,
  ]) {
    const bscEthPrice = bscBundles.length !== 0 ? bscBundles[0].ethPrice : 0;
    const bscSwipePrice = bscEthPrice * bscToken.derivedETH;
    const bscPairAddresses = bscPools.map((pool) => pool.pair).sort();

    return Promise.all([
      getPairs(bscPairAddresses, SWIPE_SWAP_BSC_URL),
      getFarmSLPBalanceForInfo(
        bscPools,
        window.values[56].CONTRACT_MASTERCHEF_ADDRESS,
        BSC_PROVIDER
      ),
    ])
      .then(function ([
        bscPairs,
        bscBalance,
      ]) {
        const bscBalances = bscBalance.balances;

        const bscFilteredPools = bscPools
          .filter(
            (pool) =>
              !window.variables.POOL_DENY.includes(pool.id) &&
              pool.allocPoint !== "0" &&
              bscPairs.find((pair) => pair?.id === pool.pair)
          )
          .map((pool) => {
            const pair = bscPairs.find((pair) => pair.id === pool.pair);

            const averageBlockTime = 4;
            const balance = bscBalances[pool.pair].balance.toString(10); // Number(pool.balance / 1e18);
            const blocksPerHour = 3600 / averageBlockTime;

            const balanceUSD =
              (balance / Number(pair.totalSupply)) * Number(pair.reserveUSD);

            const rewardPerBlock =
              ((pool.allocPoint / pool.owner.totalAllocPoint) *
                pool.owner.annexPerBlock) /
              1e18;

            const roiPerBlock = balanceUSD
              ? (rewardPerBlock * 2 * bscSwipePrice) / balanceUSD
              : 0;
            const roiPerHour = roiPerBlock * blocksPerHour;
            const roiPerDay = roiPerHour * 24;
            const roiPerMonth = roiPerDay * 30;
            const roiPerYear = roiPerMonth * 12;
            return {
              ...pool,
              liquidityPair: pair,
              roiPerBlock,
              roiPerHour,
              roiPerDay,
              roiPerMonth,
              roiPerYear,
              rewardPerThousand: 1 * roiPerDay * (1000 / bscSwipePrice),
            };
          })
          .sort((a, b) => {
            return Number(b.roiPerYear) - Number(a.roiPerYear)
          });

        return bscFilteredPools;
      })
      .catch(console.log);
  });
}

function renderTable(pools) {
  const assets = window.variables.TOKEN_LIST[NETWORK];

  if (pools.length > 0) {
    pools.forEach((pool) => {
      const pairName = `${pool.liquidityPair.token0.name} - ${pool.liquidityPair.token1.name}`;
      const pairSymbol = `${pool.liquidityPair.token0.symbol} / ${pool.liquidityPair.token1.symbol}`;
      const token0 = assets.find(
        (asset) => asset.address.toLowerCase() == pool.liquidityPair.token0.id
      );
      const token1 = assets.find(
        (asset) => asset.address.toLowerCase() == pool.liquidityPair.token1.id
      );

      const firstIconUrl =
        assets.find(
          (asset) =>
            toChecksumAddress(asset.address) ===
            toChecksumAddress(pool.liquidityPair.token0.id)
        )?.logoURI || `images/defaultAsset.svg`;
      const secondIconUrl =
        assets.find(
          (asset) =>
            toChecksumAddress(asset.address) ===
            toChecksumAddress(pool.liquidityPair.token1.id)
        )?.logoURI || `images/defaultAsset.svg`;

      $("#pools-table").append(`
        <div class="pool"> 
          <div class="pool-icon"> 
            <div class="first-icon"><img src="${firstIconUrl}" alt="${
        pool.liquidityPair.token0.symbol
      }"></div>
            <div class="second-icon"><img src="${secondIconUrl}" alt="${
        pool.liquidityPair.token1.symbol
      }"></div>
          </div>
          <div class="pool-name">
            <div class="pool-name--symbol">${pairSymbol}</div>
            <div class="pool-name--fullname">${pairName}</div>
          </div>
          <div class="pool-liquidity"> 
            <div class="pool-liquidity--usd">${formatNumber(
              pool.liquidityPair.reserveUSD,
              2,
              "en",
              "currency",
              "USD"
            )}</div>
            <div class="pool-liquidity--descr">Available liquidity</div>
          </div>
          <div class="pool-apy"> 
            <div class="pool-apy--value">${formatNumber(
              pool.roiPerYear * 100,
              2
            )}%</div>
            <div class="pool-apy--descr">APY</div>
          </div>
        </div>
      `);
    });
  }
}

const abbreviateNumberFactory = (symbols) => (number, minDigits, maxDigits) => {
  if (number === 0) return number;

  // determines SI symbol
  const tier = Math.floor(Math.log10(Math.abs(number)) / 3);

  // get suffix and determine scale
  const suffix = symbols[tier] === undefined ? "~" : symbols[tier];
  const scale = 10 ** (tier * 3);

  // scale the number
  const scaled = number / scale;

  // format number and add suffix
  return (
    scaled.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }) + suffix
  );
};

var abbreviateNumberSI = abbreviateNumberFactory(SI_SYMBOLS);

function getFarmSLPBalanceForInfo(pools, masterChefAddress, web3Provider) {
  web3.setProvider(web3Provider);

  const pairTokenContracts = Object.fromEntries(
    pools.map((pool) => [pool.pair, getPairTokenContract(pool.pair)])
  );

  return Promise.all(
    Object.keys(pairTokenContracts).map((pairAddress) => {
      return Promise.all([
        Promise.resolve(pairAddress),
        web3
          ? call(pairTokenContracts[pairAddress].methods.balanceOf)(
              masterChefAddress
            )
          : Promise.resolve("0"),
      ]);
    })
  )
    .then((results) => {
      const balances = results.reduce(
        (a, [pair, balance]) => ({
          ...a,
          [pair]: {
            balance: fromWei(new BigNumber(balance), 18),
          },
        }),
        {}
      );

      return { balances, pairTokenContracts };
    })
    .catch(console.log);
}
