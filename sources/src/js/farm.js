"use strict";

const BSC = 56;
const NETWORK = 1;
let pairList = [];
let sortField = "";
let sortDirection = "";

window.onload = function () {
  console.log("onLoad!");
  window.events.initHook = initHook;
  window.triggers.onLoad = [...(window.triggers.onLoad || []), "initHook"];

  window.variables.farm = {};
  window.triggers.networkChanged = [
    ...(window.triggers.networkChanged || []),
    "onNetworkChanged",
  ];
  window.events.initFarm = initFarm;
  window.triggers.selectAccount = [
    ...(window.triggers.selectAccount || []),
    "initFarm",
  ];
  // window.events.updateFarm = updateFarm;
  window.events.onNetworkChanged = onNetworkChanged;
  window.events.onStakeMaxAmount = onStakeMaxAmount;
  window.events.onStakeInput = onStakeInput;
  window.events.onStake = onStake;

  $(document).on("click", ".btn-harvest-now", function (e) {
    e.preventDefault();
    const pid = $(this).attr("data-id");
    const earning = $(this).closest(".cell-earned__text").find("p").text();
    harvestNow(pid, earning);
  });

  $(document).on("click", ".btn-approve-staking", function (e) {
    e.preventDefault();

    const address = $(this).attr("data-address");
    const name = $(this).attr("data-name");
    approveStaking(address, name);
  });

  $(document).on("click", ".farm-table-header-apy", function (e) {
    e.preventDefault();
    onSort("apy");
  });

  $(document).on("click", ".farm-table-header-liquidity", function (e) {
    e.preventDefault();
    onSort("liquidity");
  });

  $(document).on("click", ".farm-table-header-staked", function (e) {
    e.preventDefault();
    onSort("staked");
  });

  if (!window.variables.NETWORK) {
    initFarm();
  }
};

function initHook() {
  window.hooks.forEach(createHook);
}

function initFarm() {
  console.log("initFarm");
  initData(function (pools, contracts) {
    window.variables.PAIR_TOKEN_CONTRACTS = contracts;
    window.variables.farm.POOLS = pools;
    window.variables.farm.USERS = [];
    window.variables.farm.ALLOWANCES = [];

    if (!window.variables.ACCOUNT) {
      pairList = pools;
      sortData();
    } else {
      updateFarm();
    }

    refreshFarm();
  });
}

function updateFarm() {
  if (window.variables.farm.POOLS) {
    pairList = window.variables.farm.POOLS;
    initUserData(function () {
      sortData();
    });
  }
}

function refreshFarm() {
  setTimeout(function () {
    updateFarm();
    refreshFarm();
  }, 30000);
}

function onNetworkChanged() {
  $("#farm-table-body .farm-item").remove();
  $("#loading").show();
  $("#no-pools").hide();
}

function initData(callback) {
  const {
    CONTRACT_TOKEN_ADDRESS = values[1].CONTRACT_TOKEN_ADDRESS,
  } = window.variables;
  Promise.all([
    getLiquidityPositions(),
    getPools(),
    getAverageBlockTime(),
    getToken(CONTRACT_TOKEN_ADDRESS),
    getEthPrice(),
  ])
    .then(function ([
      liquidityPositions,
      pools,
      averageBlockTime,
      token,
      bundles,
    ]) {
      const ethPrice = bundles.length !== 0 ? bundles[0].ethPrice : 0;
      const swipePrice = ethPrice * token.derivedETH;
      const pairAddresses = pools.map((pool) => pool.pair).sort();
      const { NETWORK } = window.variables || NETWORK;

      Promise.all([getPairs(pairAddresses), getFarmSLPBalance(pools)])
        .then(function ([pairs, { balances, pairTokenContracts }]) {
          const filteredPools = pools
            .filter(
              (pool) =>
                !window.variables.POOL_DENY.includes(pool.id) &&
                pool.allocPoint !== "0" &&
                // pool.accSwipePerShare !== "0" &&
                pairs.find((pair) => pair?.id === pool.pair)
            )
            .map((pool) => {
              const pair = pairs.find((pair) => pair.id === pool.pair);
              const liquidityPosition = liquidityPositions.find(
                (liquidityPosition) => liquidityPosition.pair.id === pair.id
              );

              averageBlockTime = NETWORK == BSC ? 4 : averageBlockTime;
              const balance = balances[pool.pair].balance.toString(10); // Number(pool.balance / 1e18);
              const blocksPerHour = 3600 / averageBlockTime;

              // const rewardPerBlock =
              //   100 - 100 * (pool45.allocPoint / pool45.owner.totalAllocPoint);

              // const roiPerBlock =
              //   (Number(token.derivedETH) *
              //     rewardPerBlock *
              //     3 *
              //     (Number(pool.allocPoint) / Number(pool.owner.totalAllocPoint))) /
              //   (Number(pair.reserveETH) * (balance / Number(pair.totalSupply)));
              const balanceUSD =
                (balance / Number(pair.totalSupply)) * Number(pair.reserveUSD);

              const rewardPerBlock =
                ((pool.allocPoint / pool.owner.totalAllocPoint) *
                  pool.owner.swipePerBlock) /
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
                tvl:
                  (pair.reserveUSD / pair.totalSupply) *
                  (liquidityPosition?.liquidityTokenBalance || 0),
              };
            });

          callback(filteredPools, pairTokenContracts);
        })
        .catch(err => {
          // console.log(err);
        });
    })
    .catch(console.log);
}

function initUserData(callback) {
  const {
    ACCOUNT,
    farm: { POOLS },
  } = window.variables;
  if (!ACCOUNT) return;

  Promise.all([
    ACCOUNT ? getPoolUser(ACCOUNT) : Promise.resolve([]),
    ACCOUNT && POOLS ? getAllowances(ACCOUNT, POOLS) : Promise.resolve([]),
  ])
    .then(([users, allowances]) => {
      window.variables.farm.USERS = users;
      window.variables.farm.ALLOWANCES = allowances;
      callback();
    })
    .catch(console.log);
}

function farmTableRender() {
  const users = window.variables.farm.USERS || [];
  const allowances = window.variables.farm.ALLOWANCES || [];
  // $("#farm-table-body .farm-item").remove();
  const assets =
    window.variables.TOKEN_LIST[window.variables.NETWORK || NETWORK];
  if (pairList.length > 0) {
    $("#farm-table-body .farm-item").remove();
    pairList.forEach((pair) => {
      const pairName = `${pair.liquidityPair.token0.name} ${pair.liquidityPair.token1.name}`;
      const pairSymbol = `${pair.liquidityPair.token0.symbol}-${pair.liquidityPair.token1.symbol}`;
      const token0 = assets.find(
        (asset) => asset.address.toLowerCase() == pair.liquidityPair.token0.id
      );
      const token1 = assets.find(
        (asset) => asset.address.toLowerCase() == pair.liquidityPair.token1.id
      );
      const user = pair.user;
      const userPercent = pair.user.userPercent;
      const stakedAmount = userPercent.times(pair.liquidityPair?.reserveUSD);
      const token0Amount = userPercent.times(pair.liquidityPair?.reserve0);
      const token1Amount = userPercent.times(pair.liquidityPair?.reserve1);

      let reward =
        allowances[pair.pair] && allowances[pair.pair].reward
          ? allowances[pair.pair].reward
          : "0.00";
      const rewardRext =
        !allowances[pair.pair] ||
        (allowances[pair.pair] && !allowances[pair.pair].reward)
          ? "No rewards"
          : "Harvest Now";

      const addLiquidityBtn = `<a class="btn btn-lbiege" href="add-liquidity.html?type=add&inputCurrency=${pair.liquidityPair.token0.id}&outputCurrency=${pair.liquidityPair.token1.id}">Add Liquidity</a>`;
      let stakeBtn = "";
      let unStakeBtn = "";

      if (
        (!allowances[pair.pair] ||
          (allowances[pair.pair] && !allowances[pair.pair].allowance)) &&
        new BigNumber(users ? (user?.amount || 0) / 1e18 : "0.00").isZero()
      ) {
        stakeBtn = `<a class="btn btn-link btn-approve-staking" href="#" data-address="${pair.pair}" data-name="${pairSymbol}">Approve Staking</a>`;
      } else {
        stakeBtn = `<a class="btn btn-link js-popup-open"
                        href="#stake_asset"
                        data-id="${pair.id}"
                        data-address="${pair.pair}"
                        data-name="${pairSymbol}"
                        data-type="stake"
                        data-amount="${allowances[pair.pair]?.balance || 0}"
                        data-title="Deposit">Stake</a>`;
      }

      if (
        !new BigNumber(users ? (user?.amount || 0) / 1e18 : "0.00").isZero()
      ) {
        unStakeBtn = `<a class="btn btn-link js-popup-open"
                          href="#stake_asset"
                          data-id="${pair.id}"
                          data-address="${pair.pair}"
                          data-name="${pairSymbol}"
                          data-type="unstake"
                          data-amount="${
                            new BigNumber(user?.amount)
                              .div(1e18)
                              .toString(10) || 0
                          }"
                          data-title="Withdraw">UnStake</a>`;
      }

      const existingTR = $("#farm-table-body").find(`#pair-${pairSymbol}`);
      if (!existingTR.length) {
        let harvestBtn = "";
        if (
          !allowances[pair.pair] ||
          (allowances[pair.pair] && !allowances[pair.pair].reward)
        ) {
          harvestBtn = `
            <div id="pair-${pairSymbol}-earned-desc" class="descr">
              ${rewardRext}
            </div>
          `;
        } else {
          harvestBtn = `
            <div id="pair-${pairSymbol}-earned-desc" class="earn-descr">
              <a class="btn btn-lbiege btn-harvest-now" href="#" data-id="${pair.id}">${rewardRext}</a>
            </div>
          `;
        }

        let actionTD = `<td id="pair-${pairSymbol}-actions" class="td-btns"></td>`;
        if (window.variables.NETWORK) {
          actionTD = `<td id="pair-${pairSymbol}-actions" class="td-btns">
            ${addLiquidityBtn}
            ${stakeBtn}
            ${unStakeBtn}
          </td>`;
        }

        const firstIconUrl =
          assets.find(
            (asset) =>
              toChecksumAddress(asset.address) ===
              toChecksumAddress(pair.liquidityPair.token0.id)
          )?.logoURI || `images/defaultAsset.svg`;
        const secondIconUrl =
          assets.find(
            (asset) =>
              toChecksumAddress(asset.address) ===
              toChecksumAddress(pair.liquidityPair.token1.id)
          )?.logoURI || `images/defaultAsset.svg`;

        // render tr to tbody
        $("#loading").hide();
        $("#no-pools").hide();
        $("#farm-table-body").append(`
          <tr id="pair-${pairSymbol}" class="farm-item">
            <td>
              <div class="cell-title">Farm : </div>
              <div class="cell-farms">
                <div class="cell-farms__icons">
                  <div class="first-icon">
                    <img src="${firstIconUrl}" alt="${
          pair.liquidityPair.token0.symbol
        }">
                  </div>
                  <div class="second-icon">
                    <img src="${secondIconUrl}" alt="${
          pair.liquidityPair.token1.symbol
        }">
                  </div>
                </div>
                <div class="cell-farms__text">
                  <p>${pairName}</p>
                  <div class="descr">${pairSymbol}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="cell-title">Yield(per $1,000) : </div>
              <div class="cell-yield">
                <div class="cell-yield__icon">
                  <img src="images/sxp.svg" alt="sxp">
                </div>
                <div class="cell-yield__text">
                  <p>${formatNumber(pair.rewardPerThousand, 2)} SXP/Day</p>
                  <div class="descr">${pair.allocPoint} allocPoint</div>
                </div>
              </div>
            </td>
            <td class="${
              pair.roiPerYear * 100 >= 0 ? "td-apy-raised" : "td-apy-down"
            }">
              <div class="cell-title">APY : </div>
              <div class="td-apy-raised--value">
                <span>⬆ ${formatNumber(pair.roiPerYear * 100, 2)}%</span>
              </div>
            </td>
            <td class="farm-liquidity">
              <div class="cell-title">Liquidity : </div>
              <div class="farm-liquidity-value" title="${formatNumber(
                pair.liquidityPair.reserveUSD,
                2,
                "en",
                "currency",
                "USD"
              )}">
                ${formatNumber(
                  pair.liquidityPair.reserveUSD,
                  2,
                  "en",
                  "currency",
                  "USD"
                )}
              </div>
            </td>
            <td>
              <div class="cell-title">Staked : </div>
              <div class="cell-staked">
                <p id="pair-${pairSymbol}-staked-amount">
                  ${formatNumber(stakedAmount, 2, "en", "currency", "USD")}
                </p>
                <div class="descr" id="pair-${pairSymbol}-staked-desc">
                  ${formatNumber(token0Amount.toNumber(), token0.decimals)} ${
          token0.symbol
        } / ${formatNumber(token1Amount.toNumber(), token1.decimals)} ${
          token1.symbol
        }
                </div>
              </div>
            </td>
            <td>
              <div class="cell-title">Earned : </div>
              <div class="cell-earned">
                <div class="cell-earned__icon">
                  <img src="images/sxp.svg">
                </div>
                <div class="cell-earned__text">
                  <p id="pair-${pairSymbol}-earned-title">${formatNumber(
          reward
        )} SXP</p>
                  ${harvestBtn}
                </div>
              </div>
            </td>
            ${actionTD}
          </tr>
        `);
      } else {
        // Update the staked values
        existingTR
          .find(`#pair-${pairSymbol}-staked-amount`)
          .text(`${formatNumber(stakedAmount, 2, "en", "currency", "USD")}`);
        existingTR
          .find(`#pair-${pairSymbol}-staked-desc`)
          .text(
            `${formatNumber(token0Amount, token0.decimals)} ${
              token0.symbol
            } / ${formatNumber(token1Amount, token1.decimals)} ${token1.symbol}`
          );

        // Update the earned values
        existingTR
          .find(`#pair-${pairSymbol}-earned-title`)
          .text(`${formatNumber(reward)} SXP`);
        existingTR.find(`#pair-${pairSymbol}-earned-desc`).empty();
        if (
          !allowances[pair.pair] ||
          (allowances[pair.pair] && !allowances[pair.pair].reward)
        ) {
          existingTR
            .find(`#pair-${pairSymbol}-earned-desc`)
            .text(`${rewardRext}`);
          existingTR
            .find(`#pair-${pairSymbol}-earned-desc`)
            .removeClass("earn-descr")
            .addClass("descr");
        } else {
          existingTR
            .find(`#pair-${pairSymbol}-earned-desc`)
            .removeClass("descr")
            .addClass("earn-descr");
          existingTR.find(`#pair-${pairSymbol}-earned-desc`).append(`
            <a class="btn btn-lbiege btn-harvest-now" href="#" data-id="${pair.id}">${rewardRext}</a>
          `);
        }
        existingTR.find(`#pair-${pairSymbol}-actions`).empty();
        existingTR.find(`#pair-${pairSymbol}-actions`).append(`
          ${addLiquidityBtn}
          ${stakeBtn}
          ${unStakeBtn}
        `);
      }
    });
  } else {
    $("#loading").hide();
    $("#no-pools").show();
  }
}

function harvestNow(pid, earning) {
  runHarvest([pid, earning], function (result, error) {
    if (error) {
      console.log(error);
    } else {
      // console.log(result);
    }
  });
}

function approveStaking(pairAddress, name) {
  runApproveStaking(pairAddress, name, function (result, error) {
    if (error) {
      console.log(error);
    } else {
      // console.log(result);
    }
  });
}

function onStake(e) {
  const form = $(document.forms.stake);
  const amount = form.find("input#available_amount").val();
  const availableAmount = form
    .find("a.js-input-max-balance")
    .attr("data-value");
  const type = form.find("#current_stake_type").val();
  const pid = form.find("#current_pool_id").val();
  const pairName = form.find("#current_pool_pair_name").val();

  if (amount > 0 && amount <= availableAmount && pid && type) {
    runStake(pid, amount, pairName, type, function (result, error) {
      if (error) {
        console.log(error);
      } else {
        // console.log(result);
      }
    });
  }
}

function onStakeMaxAmount(e) {
  const form = $(document.forms.stake);
  form
    .find("input#available_amount")
    .val(
      new BigNumber(form.find("a.js-input-max-balance").attr("data-value"))
        .dp(18, 1)
        .toString(10)
    );
}

function onStakeInput(e) {
  const form = $(document.forms.stake);
  const availableAmount = form
    .find("a.js-input-max-balance")
    .attr("data-value");

  if (e.target.value > availableAmount) {
    $(form).find(".js-confirm-btn").prop("disabled", true);
  } else {
    $(form).find(".js-confirm-btn").prop("disabled", false);
  }
}

function isNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function onSort(field) {
  sortField = field;
  if ($(`.farm-table-header-${field}`).hasClass("desc")) {
    sortDirection = "asc";
  } else {
    sortDirection = "desc";
  }
  $(".farm-table-header").removeClass("asc").removeClass("desc");
  $(`.farm-table-header-${field}`).addClass(sortDirection);

  sortData();
}

function sortData() {
  const users = window.variables.farm.USERS || [];
  pairList = pairList
    .map((pair) => {
      const user = users.find((u) => u.pool.id === pair.id);
      const userPercent = user
        ? new BigNumber(user.amount)
            .div(1e18)
            .div(pair.liquidityPair?.totalSupply)
        : new BigNumber(0);
      return {
        ...pair,
        user: {
          ...user,
          userPercent,
        },
      };
    })
    .sort((a, b) => {
      switch (sortField) {
        case "apy":
          if (sortDirection === "asc") {
            return a.roiPerYear - b.roiPerYear;
          }
          return b.roiPerYear - a.roiPerYear;
        case "liquidity":
          const aReserveUSD = new BigNumber(a.liquidityPair?.reserveUSD);
          const bReserveUSD = new BigNumber(b.liquidityPair?.reserveUSD);
          if (sortDirection === "asc") {
            return aReserveUSD.minus(bReserveUSD).toNumber();
          }
          return bReserveUSD.minus(aReserveUSD).toNumber();
        case "staked":
          const aStakedAmount = a.user.userPercent.times(
            a.liquidityPair?.reserveUSD
          );
          const bStakedAmount = b.user.userPercent.times(
            b.liquidityPair?.reserveUSD
          );
          if (sortDirection === "asc") {
            return aStakedAmount.minus(bStakedAmount).toNumber();
          }
          return bStakedAmount.minus(aStakedAmount).toNumber();
        default:
          break;
      }
    });
  farmTableRender();
}
