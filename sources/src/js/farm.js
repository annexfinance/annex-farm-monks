"use strict";

const BSC = 56;
const NETWORK = 56;
let pairList = [];
let sortField = "apy";
let sortDirection = "desc";
let searchKeyward = "";

window.onload = function () {
  console.log("onLoad!");
  $("#loading").show();
  $("#no-pools").hide();
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

  $(document).on("change", "#farm-sort", function (e) {
    e.preventDefault();
    if (e.target.value === 'apy') {
      onSort("apy");
    } else if (e.target.value === 'allocpoint') {
      onSort("allocpoint");
    } else if (e.target.value === 'earned') {
      onSort("earned");
    } else {
      onSort("liquidity");
    }
  });

  $(document).on("change", "#farm-search", function (e) {
    e.preventDefault();
    onSearch(e.target.value);
  });
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
  $(".farm-list-items-item").remove();
  $("#loading").show();
  $("#no-pools").hide();

  initFarm();
}

function initData(callback) {
  const {
    CONTRACT_TOKEN_ADDRESS = values[56].CONTRACT_TOKEN_ADDRESS,
  } = window.variables;
  Promise.all([
    getLiquidityPositions(),
    getPools(),
    // getToken(CONTRACT_TOKEN_ADDRESS),
    getEthPrice(),
    getAnnPrice(),
  ])
    .then(function ([
      liquidityPositions,
      pools,
      // token,
      bundles,
      annexBundle
    ]) {
      const ethPrice = bundles.length !== 0 ? bundles[0].ethPrice : 0;
      const annexPrice = annexBundle;
      const pairAddresses = pools.map((pool) => pool.pair).sort();
      const { NETWORK } = window.variables || NETWORK;
      window.variables.PRICES[CONTRACT_TOKEN_ADDRESS.toLowerCase()] = annexPrice;

      Promise.all([getPairs(pairAddresses, ethPrice, annexPrice), getFarmALPBalance(pools)])
        .then(function ([pairs, { balances, pairTokenContracts }]) {
          const filteredPools = pools
            .filter(
              (pool) =>
                !window.variables.POOL_DENY.includes(pool.id) &&
                pool.allocPoint !== "0" &&
                // pool.accAnnexPerShare !== "0" &&
                pairs.find((pair) => pair?.id === pool.pair)
            )
            .map((pool) => {
              const pair = pairs.find((pair) => pair.id === pool.pair);
              const liquidityPosition = liquidityPositions.find(
                (liquidityPosition) => liquidityPosition.pair.id === pair.id
              );

              const averageBlockTime = 3;//NETWORK == BSC ? 3 : averageBlockTime;
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
                  pool.owner.annexPerBlock) /
                1e18;

              const roiPerBlock = balanceUSD
                ? (rewardPerBlock * annexPrice) / balanceUSD
                : 0;
              const roiPerHour = roiPerBlock * blocksPerHour;
              const roiPerDay = roiPerHour * 24;
              const roiPerMonth = roiPerDay * 30;
              const roiPerYear = roiPerMonth * 12;
              // console.log('poollllllllllllllll: ', pool, liquidityPosition);
              
              return {
                ...pool,
                liquidityPair: pair,
                roiPerBlock,
                roiPerHour,
                roiPerDay,
                roiPerMonth,
                roiPerYear,
                ethPrice,
                annexPrice,
                rewardPerThousand: 1 * roiPerDay * (1000 / annexPrice),
                rewardPerDay: rewardPerBlock * blocksPerHour * 24,
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
  const { ACCOUNT } = window.variables;
  const users = window.variables.farm.USERS || [];
  const allowances = window.variables.farm.ALLOWANCES || [];
  const { ADD_LIQUIDITY_URL } = window.variables.URLS;
  // $("#farm-table-body .farm-item").remove();
  const assets =
    window.variables.TOKEN_LIST[window.variables.NETWORK || NETWORK];
  if (pairList.length > 0) {
    pairList.forEach((pair) => {
      const pairName = pair.liquidityPair.token1.name ? `${pair.liquidityPair.token0.name} ${pair.liquidityPair.token1.name}` : pair.liquidityPair.token0.name;
      const pairSymbol = pair.liquidityPair.token1.symbol ? `${pair.liquidityPair.token0.symbol}-${pair.liquidityPair.token1.symbol}` : pair.liquidityPair.token0.symbol;
      const pairId = `${pair.liquidityPair.id}`
      const token0 = assets.find(
        (asset) => asset.address.toLowerCase() == pair.liquidityPair.token0.id
      );
      const token1 = assets.find(
        (asset) => asset.address.toLowerCase() == pair.liquidityPair.token1.id
      );
      const user = pair.user;
      const userPercent = pair.user.userPercent;
      let stakedAmount = 0;
      if (pair.liquidityPair.token1.id) {
        stakedAmount = userPercent.times(pair.liquidityPair?.reserveUSD);
      } else {
        stakedAmount = new BigNumber(pair.balance).div(1e18).times(window.variables.PRICES[pair.liquidityPair.token0.id]).toString(10);
      }

      if (pair.liquidityPair) {
        pair.liquidityPair.volume = (new BigNumber(pair.liquidityPair.token0PriceUSD)
          .plus(pair.liquidityPair.token1PriceUSD)).times(pair.lpSupply).div(1e18).toString(10);

        if (!pair.liquidityPair.token1.id){
          const totalLiquidity = pair.liquidityPair.token0PriceUSD * pair.lpSupply / 1e18;
          if (totalLiquidity == 0) {
            pair.roiPerYear = 0;
          } else {
            const rewardUSDPerDay = pair.rewardPerDay * pair.annexPrice;
            pair.roiPerYear = ((1 + rewardUSDPerDay / totalLiquidity) ^ 365 - 1) * 100;
          }
        }
      }
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

      let addLiquidityBtn = `<a class="btn" href="${ADD_LIQUIDITY_URL}/${pair.liquidityPair.token0.id}/${pair.liquidityPair.token1.id}" target="_new">Add Liquidity</a>`;
      if (!ACCOUNT) {
        addLiquidityBtn = `<a href="#connect_wallet" class="btn btn-big js-popup-open">Connect Wallet</a>`;
      }
      let stakeBtn = "";
      let unStakeBtn = "";

      if (
        ACCOUNT &&
        (!allowances[pair.pair] ||
          (allowances[pair.pair] && !allowances[pair.pair].allowance)) &&
        new BigNumber(users ? (user?.amount || 0) / 1e18 : "0.00").isZero()
      ) {
        stakeBtn = `<a class="btn btn-link btn-approve-staking" href="#" data-address="${pair.pair}" data-name="${pairSymbol}">Approve Staking</a>`;
      } else if (ACCOUNT) {
        stakeBtn = `<a class="btn js-popup-open"
                        href="#stake_asset"
                        data-id="${pair.id}"
                        data-address="${pair.pair}"
                        data-name="${pairSymbol}"
                        data-type="stake"
                        data-amount="${allowances[pair.pair]?.balance || 0}"
                        data-title="Deposit">Stake</a>`;
      } else {
        stakeBtn = '';
      }

      if (
        ACCOUNT &&
        !new BigNumber(users ? (user?.amount || 0) / 1e18 : "0.00").isZero()
      ) {
        unStakeBtn = `<a class="btn js-popup-open"
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
      } else {
        unStakeBtn = '';
      }

      let stakedPair = '';
      if (pair.liquidityPair.token1.id) {
        stakedPair = `${formatNumber(token0Amount.toNumber(), Number(pair.liquidityPair.token0.decimals))} ${
          pair.liquidityPair.token0.symbol
        } / ${formatNumber(token1Amount.toNumber(), Number(pair.liquidityPair.token1.decimals))} ${
          pair.liquidityPair.token1.symbol
        }`
      } else {
        stakedPair = `${new BigNumber(pair.balance).div(1e18).toString(10)} ${
          pair.liquidityPair.token0.symbol
        }`
      }

      const existingTR = $(".farm-list-items").find(`#pair-${pairId}`);
      if (!existingTR.length) {
        let harvestBtn = "";
        if (
          !allowances[pair.pair] ||
          (allowances[pair.pair] && !allowances[pair.pair].reward)
        ) {
          harvestBtn = `
            <div id="pair-${pairId}-earned-desc" class="descr">
              ${rewardRext}
            </div>
          `;
        } else {
          harvestBtn = `
            <div id="pair-${pairId}-earned-desc" class="earn-descr">
              <a class="btn btn-lbiege btn-harvest-now" href="#" data-id="${pair.id}">${rewardRext}</a>
            </div>
          `;
        }

        let actionTD = `<td id="pair-${pairId}-actions" class="td-btns"></td>`;
        if (window.variables.NETWORK) {
          actionTD = `<td id="pair-${pairId}-actions" class="td-btns">
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
          )?.logoURI || '';
        const firstAssetLogo = `<img src="${firstIconUrl}" alt="${
          pair.liquidityPair.token0.symbol
        }">`;
        const secondAssetLogo = secondIconUrl ? `<img src="${secondIconUrl}" alt="${
          pair.liquidityPair.token1.symbol
        }">` : '';

        // render tr to tbody
        $("#loading").hide();
        $("#no-pools").hide();
        $(".farm-list-items").append(`
          <div class="farm-list-items-item" id="pair-${pairId}">
            <div class="farm-list-items-item-title">
              <div class="farm-list-items-item-title__icons">
                <div class="first-icon">
                  ${firstAssetLogo}
                </div>
                <div class="second-icon">
                  ${secondAssetLogo}
                </div>
              </div>
              <div class="farm-list-items-item-title__text">
                <p>${pairName}</p>
                <div class="descr">${pairSymbol}</div>
              </div>
            </div>
            <div class="farm-list-items-item-content">
              <div class="farm-list-items-item-content__cell">Yield : </div>
              <div class="farm-list-items-item-content__cell">
                <div class="cell-yield__icon">
                  <img src="images/ann.svg" alt="ANN">
                </div>
                <div class="cell-yield__text">
                  <p>${formatNumber(pair.rewardPerDay, 2)} ANN/Day</p>
                  <div class="descr">${pair.allocPoint}x Multiplier</div>
                </div>
              </div>
              <div class="farm-list-items-item-content__cell">
                <div>
                  <div class="cell-apy-title">APY</div>
                  <div class="cell-apy"><span>⬆</span> ${formatNumber(pair.roiPerYear * 100, 2)}%</div>
                </div>
              </div>
              <div class="farm-list-items-item-content__cell">
                <div class="farm-list-items-item-content__cell-wrapper-right">
                  <div class="cell-apy-title">Liquidity</div>
                  <div class="cell-apy">
                    ${formatNumber(
                      pair.liquidityPair.volume,
                      2,
                      "en",
                      "currency",
                      "USD"
                    )}
                  </div>
                </div>
              </div>
              <div class="farm-list-items-item-content__cell">
                <div>
                  <div class="cell-apy-title">Staked</div>
                  <p class="cell-apy" id="pair-${pairId}-staked-amount">
                    ${formatNumber(stakedAmount, 2, "en", "currency", "USD")}
                  </p>
                </div>
              </div>
              <div class="farm-list-items-item-content__cell">
                <div class="farm-list-items-item-content__cell-wrapper-right">
                  <div class="staked-assets" id="pair-${pairId}-staked-desc">
                    ${stakedPair}
                  </div>
                </div>
              </div>
              <div class="farm-list-items-item-content__cell">Earned</div>
              <div class="farm-list-items-item-content__cell">
                <div class="cell-earned__icon">
                  <img src="images/ann.svg" alt="ANN">
                </div>
                <div class="cell-earned__text">
                  <p id="pair-${pairId}-earned-title">${formatNumber(
                    reward
                  )} ANN</p>
                  ${harvestBtn}
                </div>
              </div>
            </div>
            <div class="farm-list-items-item-actions">
              <div class="farm-list-items-item-actions__wrapper" id="pair-${pairId}-actions">
                ${addLiquidityBtn}
                <div class="farm-list-items-item-actions__wrapper-buttons">
                  ${stakeBtn}
                  ${unStakeBtn}
                </div>
              </div>
            </div>
          </div>
        `);
      } else {
        // Update the staked values
        existingTR
          .find(`#pair-${pairId}-staked-amount`)
          .text(`${formatNumber(stakedAmount, 2, "en", "currency", "USD")}`);
        existingTR
          .find(`#pair-${pairId}-staked-desc`)
          .text(
            `${stakedPair}`
          );

        // Update the earned values
        existingTR
          .find(`#pair-${pairId}-earned-title`)
          .text(`${formatNumber(reward)} ANN`);
        existingTR.find(`#pair-${pairId}-earned-desc`).empty();
        if (
          !allowances[pair.pair] ||
          (allowances[pair.pair] && !allowances[pair.pair].reward)
        ) {
          existingTR
            .find(`#pair-${pairId}-earned-desc`)
            .text(`${rewardRext}`);
          existingTR
            .find(`#pair-${pairId}-earned-desc`)
            .removeClass("earn-descr")
            .addClass("descr");
        } else {
          existingTR
            .find(`#pair-${pairId}-earned-desc`)
            .removeClass("descr")
            .addClass("earn-descr");
          existingTR.find(`#pair-${pairId}-earned-desc`).append(`
            <a class="btn btn-lbiege btn-harvest-now" href="#" data-id="${pair.id}">${rewardRext}</a>
          `);
        }
        existingTR.find(`#pair-${pairId}-actions`).empty();
        existingTR.find(`#pair-${pairId}-actions`).append(`
          ${addLiquidityBtn}
          <div class="farm-list-items-item-actions__wrapper-buttons">
            ${stakeBtn}
            ${unStakeBtn}
          </div>
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

function onSearch(keyward) {
  searchKeyward = keyward;
  console.log(searchKeyward)

  searchData();
}

function searchData() {
  pairList = window.variables.farm.POOLS
    .filter((pair) => {
      const re = new RegExp(searchKeyward, 'i');

      if (pair.liquidityPair.token0.name.search(re) >= 0 ||
        pair.liquidityPair.token0.symbol.search(re) >= 0 ||
        pair.liquidityPair.token1.name && pair.liquidityPair.token1.name.search(re) >= 0 ||
        pair.liquidityPair.token1.symbol && pair.liquidityPair.token1.symbol.search(re) >= 0
      ) {
        return true
      } else {
        return false
      }
    })

  sortData();
}

function onSort(field) {
  sortField = field;

  sortData();
}

function sortData() {
  const users = window.variables.farm.USERS || [];
  const allowances = window.variables.farm.ALLOWANCES || [];
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
        case "earned":
          const rewardA =
            allowances[a.pair] && allowances[a.pair].reward
              ? new BigNumber(allowances[a.pair].reward)
              : new BigNumber(0);
          const rewardB =
            allowances[b.pair] && allowances[b.pair].reward
              ? new BigNumber(allowances[b.pair].reward)
              : new BigNumber(0);

          if (sortDirection === "asc") {
            return rewardA.minus(rewardB).toNumber();
          }
          return rewardB.minus(rewardA).toNumber();
        case "allocpoint":
          if (sortDirection === "asc") {
            return a.allocPoint - b.allocPoint;
          }
          return b.allocPoint - a.allocPoint;
        default:
          break;
      }
    });
  
  $(".farm-list-items-item").remove();
  farmTableRender();
}
