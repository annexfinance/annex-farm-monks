"use strict";
const NETWORK = 56;

const tokenFields = `{
    id
    name
    symbol
    totalSupply
    derivedETH
}`;

const factoryFields = `{
  volumeUSD
  volumeETH
  untrackedVolumeUSD
  liquidityUSD
  liquidityETH
  txCount
  tokenCount
  userCount
}`;

const pairFields = `{
    id
    reserveUSD
    reserveETH
    volumeUSD
    untrackedVolumeUSD
    trackedReserveETH
    token0 ${tokenFields}
    token1 ${tokenFields}
    reserve0
    reserve1
    token0Price
    token1Price
    totalSupply
    txCount
    timestamp
}`;

const blockFields = `{
    id
    number
    timestamp
}`;

const tokenFullFields = `{
    id
    symbol
    name
    decimals
    totalSupply
    volume
    volumeUSD
    untrackedVolumeUSD
    txCount
    liquidity
    derivedETH
    basePairs ${pairFields}
    quotePairs ${pairFields}
}`;

const globalFailed = function (error) {
  console.log("Failed!!!", error);
};

const globalSuccess = function (data) {
  console.log("Suucess!!!", data);
};

function makeGraphQLRequest(
  url,
  params,
  method = "post",
  success = null,
  failed = null
) {
  $.ajax({
    url,
    method,
    data: JSON.stringify(params),
    dataType: "json",
    contentType: "application/json",
    success: function (response) {
      // console.log('graph response: ', response);
      if (response.data) {
        if (success) {
          success(response.data);
        } else {
          globalSuccess(response.data);
        }
      } else {
        console.log(response)
        globalFailed(response.error);
      }
    },
    error: function(error) {
      failed ? failed : globalFailed(error)
    }
  });
}

async function getPool(id) {
  const { MASTERCHEF_URL } = window.variables.URLS || values[NETWORK].URLS;
  return new Promise((resolve, reject) => {
    makeGraphQLRequest(
      MASTERCHEF_URL,
      {
        query: `
                query(
                    $id: ID!
                    ) {
                        pools(
                            id: $id
                        ) {
                            id
                            pair
                            allocPoint
                            lastRewardBlock
                            accAnnexPerShare
                            balance
                            userCount
                            owner {
                                id
                                annexPerBlock
                                totalAllocPoint
                            }
                            users(orderBy: amount, orderDirection: desc) {
                                id
                                address
                                amount
                                rewardDebt
                            }
                            slpAge
                            liquidityPair @client
                            timestamp
                            entryUSD
                            exitUSD
                        }
                    }
            `,
        variables: {
          id,
        },
      },
      "post",
      function (data) {
        return resolve(data.pools);
      },
      function (error) {
        return reject(error);
      }
    );
  });
}

async function getPools(url = null) {
  const { MASTERCHEF_URL } = window.variables.URLS || values[NETWORK].URLS;

  if (!url) {
    url = MASTERCHEF_URL;
  }

  return new Promise((resolve, reject) => {
    makeGraphQLRequest(
      url,
      {
        query: `
                query(
                    $first: Int! = 1000
                    $skip: Int! = 0
                    $orderBy: String! = "timestamp"
                    $orderDirection: String! = "desc"
                    ) {
                        pools(
                            first: $first
                            skip: $skip
                            orderBy: $orderBy
                            orderDirection: $orderDirection
                        ) {
                            id
                            pair
                            allocPoint
                            lastRewardBlock
                            accAnnexPerShare
                            balance
                            userCount
                            owner {
                                id
                                annexPerBlock
                                totalAllocPoint
                            }
                        }
                    }
            `,
        variables: {
          first: 1000,
          skip: 0,
          orderBy: "timestamp",
          orderDirection: "desc",
        },
      },
      "post",
      function (data) {
        return resolve(data.pools);
      },
      function (error) {
        return reject(error);
      }
    );
  });
}

function getPoolsFromBSC() {
  let { MASTERCHEF_CONTRACT, ACCOUNT, NETWORK } = window.variables;
console.log('network: ', NETWORK);
  if (!MASTERCHEF_CONTRACT) {
    const { CONTRACT_MASTERCHEF_ADDRESS } = window.values[NETWORK];
    const BSC_PROVIDER = "https://bsc-dataseed.binance.org/";
    web3.setProvider(BSC_PROVIDER);
    MASTERCHEF_CONTRACT = new web3.eth.Contract(
      window.variables.CONTRACT_MASTERCHEF_ABI,
      CONTRACT_MASTERCHEF_ADDRESS
    );
  }

  return Promise.all([
    call(MASTERCHEF_CONTRACT.methods.poolLength)(),
    call(MASTERCHEF_CONTRACT.methods.owner)(),
    call(MASTERCHEF_CONTRACT.methods.annexPerBlock)(),
    call(MASTERCHEF_CONTRACT.methods.totalAllocPoint)(),
  ]).then(([poolLength, owner, annexPerBlock, totalAllocPoint]) => {
    let poolIds = [];
    for (let i = 0; i < poolLength; i += 1) {
      poolIds.push(i);
    }
    return Promise.all(
      poolIds.map((pid) => {
        return Promise.all([
          Promise.resolve(pid),
          call(MASTERCHEF_CONTRACT.methods.getPoolInfo)(pid),
          ACCOUNT ? call(MASTERCHEF_CONTRACT.methods.userInfo)(pid, ACCOUNT) : Promise.resolve({ amount: 0, rewardDebt: 0 }),
        ]);
      })
    )
      .then((poolInfos) => {
        console.log('pool infos: ', poolInfos);
        const pools = poolInfos.map(([poolId, info, user]) => {
          return {
            id: poolId.toString(),
            lpSupply: info.lpSupply,
            allocPoint: info.allocPoint,
            lastRewardBlock: info.lastRewardBlock,
            pair: info.lpToken.toLowerCase(),
            accAnnexPerShare: info.accAnnexPerShare,
            owner: {
              id: owner,
              annexPerBlock,
              totalAllocPoint,
            },
            balance: user.amount,
            rewardDebt: user.rewardDebt
          };
        });
        return pools;
      })
      .catch(console.log);
  });
}

async function getLiquidityPositions() {
  const { ANNEX_FARM_URL } = window.variables.URLS || values[NETWORK].URLS;
  const { ACCOUNT } = window.variables;
  if (ACCOUNT) {
    return new Promise((resolve, reject) => {
      makeGraphQLRequest(
        ANNEX_FARM_URL,
        {
          query: `query(
                    $first: Int! = 1000,
                    $user: Bytes!
                  ) {
                    liquidityPositions(first: $first, where: { user: $user }) {
                      id
                      liquidityTokenBalance
                      user {
                        id
                      }
                      pair {
                        id
                      }
                    }
                  }`,
          variables: {
            user: ACCOUNT.toLowerCase(),
          },
        },
        "post",
        function (data) {
          return resolve(data.liquidityPositions);
        },
        function (error) {
          return reject(error);
        }
      );
    });
  } else {
    return new Promise((resolve, reject) => {
      return resolve([]);
    });
  }
}

function getPairs(pairAddresses, ethPrice, annexPrice) {
  const { CONTRACT_TOKEN_ADDRESS, CONTRACT_TOKEN_ABI, CONTRACT_ERC20_ABI } = window.variables;
  
  const pairContracts = pairAddresses.map(pairAddress => {
    if (toChecksumAddress(pairAddress) === toChecksumAddress(CONTRACT_TOKEN_ADDRESS)) {
      return [pairAddress, getPairTokenContract(pairAddress, CONTRACT_TOKEN_ABI)];
    } else {
      return [pairAddress, getPairTokenContract(pairAddress)];
    }
  });

  return Promise.all(
    pairContracts.map((pairContract) => {
      return Promise.all([
        Promise.resolve(pairContract[0]),
        web3 && pairContract[1].methods.token0 ? call(pairContract[1].methods.token0)() : Promise.resolve(pairContract[0]),
        web3 && pairContract[1].methods.token1 ? call(pairContract[1].methods.token1)() : Promise.resolve(null),
        web3 && pairContract[1].methods.getReserves ? call(pairContract[1].methods.getReserves)() : Promise.resolve('0'),
        web3 && pairContract[1].methods.totalSupply ? call(pairContract[1].methods.totalSupply)() : Promise.resolve(null),
        web3 && pairContract[1].methods.name ? call(pairContract[1].methods.name)() : Promise.resolve(null),
      ]);
    })
  )
    .then((results) => {
      console.log('results : ', results)

      return Promise.all(
        results.map(([pair, token0, token1, reserves, totalSupply, name]) => {
          const tokenContract0 = token0 ? getPairTokenContract(token0, CONTRACT_ERC20_ABI) : null;
          const tokenContract1 = token1 ? getPairTokenContract(token1, CONTRACT_ERC20_ABI) : null;

          return Promise.all([
            Promise.resolve(pair),
            Promise.resolve(reserves),
            Promise.resolve(totalSupply),
            Promise.resolve(name),
            Promise.resolve(token0),
            web3 && tokenContract0 ? call(tokenContract0.methods.decimals)() : Promise.resolve(null),
            web3 && tokenContract0 ? call(tokenContract0.methods.name)() : Promise.resolve(null),
            web3 && tokenContract0 ? call(tokenContract0.methods.symbol)() : Promise.resolve(null),
            Promise.resolve(token1),
            web3 && tokenContract1 ? call(tokenContract1.methods.decimals)() : Promise.resolve(null),
            web3 && tokenContract1 ? call(tokenContract1.methods.name)() : Promise.resolve(null),
            web3 && tokenContract1 ? call(tokenContract1.methods.symbol)() : Promise.resolve(null),
            token0 ? getOnlyToken(token0) : Promise.resolve(null),
            token1 ? getOnlyToken(token1) : Promise.resolve(null),
          ])
        })
      )
        .then((result) => {
          console.log('result: ', result)
          return result.map(data => {
            const reserve0 = data[1]._reserve0 ? new BigNumber(data[1]._reserve0).div(new BigNumber(10).pow(data[5])).toString(10) : new BigNumber(data[1]).div(new BigNumber(10).pow(data[5])).toString(10);
            const reserve1 = data[1]._reserve1 ? new BigNumber(data[1]._reserve1).div(new BigNumber(10).pow(data[9])).toString(10) : 0;
            console.log('------- ', reserve0, reserve1)
            let token0Price = 0;
            if (new BigNumber(reserve1).isZero()) {
              token0Price = 0
            } else {
              token0Price = new BigNumber(reserve0).div(reserve1).toString(10);
            }
            let token1Price = 0;
            if (new BigNumber(reserve0).isZero()) {
              token1Price = 0
            } else {
              token1Price = new BigNumber(reserve1).div(reserve0).toString();
            }
            const derivedToken0 = data[12];
            const derivedToken1 = data[13];
            const token0PriceUSD = data[4] ? window.variables.PRICES[data[4].toLowerCase()] : 0;
            const token1PriceUSD = data[8] ? window.variables.PRICES[data[8].toLowerCase()] : 0;
            console.log('prices : ', token0PriceUSD, token1PriceUSD)
            let reserveETH = new BigNumber(0);
            if (derivedToken0 && derivedToken1) {
              reserveETH = new BigNumber(reserve0)
                .times(derivedToken0.derivedETH)
                .plus(reserve1.times(derivedToken1.derivedETH))
            } else if (derivedToken0) {
              reserveETH = new BigNumber(reserve0).times(annexPrice).div(ethPrice)
            }
            console.log('reserveETH: ', reserveETH.toString(10))

            const reserve0USD = new BigNumber(reserve0).times(token0PriceUSD);
            const reserve1USD = new BigNumber(reserve1).times(token1PriceUSD);
            console.log('====== ', reserve0USD.toString(10), reserve1USD.toString(10))
            const reserveUSD = reserve0USD.plus(reserve1USD);
            // const reserveUSD = reserveETH.times(ethPrice)
            const pair = {
              id: data[0],
              reserve0,
              reserve1,
              reserveETH,
              reserveUSD,
              token0Price,
              token1Price,
              token0PriceUSD,
              token1PriceUSD,
              totalSupply: new BigNumber(data[2]).div(1e18).toString(10),
              token0: {
                id: data[4],
                decimals: data[5],
                name: data[6],
                symbol: data[7],
              },
              token1: {
                id: data[8],
                decimals: data[9],
                name: data[10],
                symbol: data[11],
              },
            }

            return pair
          });
        })
    })
    .catch(console.log);
}

function getFullPairs(offset = 0, limit = 1000, url = null) {
  if (!url) {
    const { ANNEX_FARM_URL } = window.variables.URLS || values[NETWORK].URLS;
    url = ANNEX_FARM_URL;
  }

  return new Promise((resolve, reject) => {
    makeGraphQLRequest(
      url,
      {
        query: `
                query(
                    $first: Int! = 1000
                    $offset: Int! = 0
                    $orderBy: String! = "timestamp"
                    $orderDirection: String! = "desc"
                ) {
                    pairs(
                        first: $first
                        skip: $offset
                        orderBy: $orderBy
                        orderDirection: $orderDirection
                    ) ${pairFields}
                }
            `,
        variables: {
          first: limit,
          offset,
        },
      },
      "post",
      function (data) {
        return resolve(data.pairs);
      },
      function (error) {
        return reject(error);
      }
    );
  });
}

function getPair(pair) {
  const { ANNEX_FARM_URL } = window.variables.URLS || values[NETWORK].URLS;
  return new Promise((resolve, reject) => {
    makeGraphQLRequest(
      ANNEX_FARM_URL,
      {
        query: `
                query(
                    $id: ID!
                ) {
                    pairs(
                        where: { id: $id }
                    ) ${pairFields}
                }
            `,
        variables: {
          id: pair.toLowerCase(),
        },
      },
      "post",
      function (data) {
        return resolve(data.pairs);
      },
      function (error) {
        return reject(error);
      }
    );
  });
}

function getAverageBlockTime(url = null) {
  const now = dateFns.startOfSecond(
    dateFns.startOfMinute(dateFns.startOfHour(Date.now()))
  );
  const start = dateFns.getTime(dateFns.subHours(now, 6)) / 1000;
  const end = dateFns.getTime(now) / 1000;
  const { BLOCK_URL } = window.variables.URLS || values[NETWORK].URLS;

  if (!url) {
    url = BLOCK_URL
  }

  return new Promise((resolve, reject) => {
    makeGraphQLRequest(
      url,
      {
        query: `
                query(
                    $first: Int! = 1000
                    $skip: Int! = 0
                    $start: Int!
                    $end: Int!
                ) {
                    blocks(
                        first: $first
                        skip: $skip
                        orderBy: number
                        orderDirection: desc
                        where: { timestamp_gt: $start, timestamp_lt: $end, number_gt: 9300000 }
                    ) ${blockFields}
                }
            `,
        variables: {
          start,
          end,
        },
      },
      "post",
      function (data) {
        const blocks = data.blocks;
        const averageBlockTime = blocks.reduce(
          (previousValue, currentValue, currentIndex) => {
            if (previousValue.timestamp) {
              const difference =
                previousValue.timestamp - currentValue.timestamp;
              previousValue.difference = previousValue.difference + difference;
            }

            previousValue.timestamp = currentValue.timestamp;

            if (currentIndex === blocks.length - 1) {
              return previousValue.difference / blocks.length;
            }

            return previousValue;
          },
          { timestamp: null, difference: 0 }
        );

        return resolve(averageBlockTime);
      },
      function (error) {
        return reject(error);
      }
    );
  });
}

async function getToken(id, url = null) {
  const oneDayBlock = { number: 5546330 };
  const twoDayBlock = { number: 5546330 };
  const { ANNEX_FARM_URL } = window.variables.URLS || values[NETWORK].URLS || {};

  if (!url) {
    url = ANNEX_FARM_URL;
  }

  return Promise.all([
    new Promise((resolve, reject) => {
      makeGraphQLRequest(
        url,
        {
          query: `
                    query(
                        $id: String!
                    ) {
                        token(
                            id: $id
                        ) ${tokenFullFields}
                    }
                `,
          variables: {
            id: id.toLowerCase(),
          },
        },
        "post",
        function (data) {
          return resolve(data.token);
        },
        function (error) {
          return reject(error);
        }
      );
    }),
    new Promise((resolve, reject) => {
      makeGraphQLRequest(
        url,
        {
          query: `
                    query(
                        $id: String!, $block: Block_height!
                    ) {
                        token(
                            id: $id, block: $block
                        ) ${tokenFullFields}
                    }
                `,
          variables: {
            id,
            block: oneDayBlock,
          },
        },
        "post",
        function (data) {
          return resolve(data.token);
        },
        function (error) {
          return reject(error);
        }
      );
    }),
    new Promise((resolve, reject) => {
      makeGraphQLRequest(
        url,
        {
          query: `
                    query(
                        $id: String!, $block: Block_height!
                    ) {
                        token(
                            id: $id, block: $block
                        ) ${tokenFullFields}
                    }
                `,
          variables: {
            id,
            block: twoDayBlock,
          },
        },
        "post",
        function (data) {
          return resolve(data.token);
        },
        function (error) {
          return reject(error);
        }
      );
    }),
  ])
    .then(function ([token, oneDayToken, twoDayToken]) {
      return {
        ...token,
        oneDay: {
          volumeUSD: String(oneDayToken?.volumeUSD),
          derivedETH: String(oneDayToken?.derivedETH),
          liquidity: String(oneDayToken?.liquidity),
          txCount: String(oneDayToken?.txCount),
        },
        twoDay: {
          volumeUSD: String(twoDayToken?.volumeUSD),
          derivedETH: String(twoDayToken?.derivedETH),
          liquidity: String(twoDayToken?.liquidity),
          txCount: String(twoDayToken?.txCount),
        },
      };
    })
    .catch(function (error) {
      return {};
    });
}

function getOnlyToken(id, url = null) {
  const { ANNEX_FARM_URL } = window.variables.URLS || values[NETWORK].URLS || {};

  if (!url) {
    url = ANNEX_FARM_URL;
  }

  return new Promise((resolve, reject) => {
      makeGraphQLRequest(
        url,
        {
          query: `
                    query(
                        $id: String!
                    ) {
                        token(
                            id: $id
                        ) ${tokenFullFields}
                    }
                `,
          variables: {
            id: id.toLowerCase(),
          },
        },
        "post",
        function (data) {
          return resolve(data.token);
        },
        function (error) {
          return reject(error);
        }
      );
    })
    .then(function (token) {
      return token;
    })
    .catch(function (error) {
      return {};
    });
}

function getEthPrice(url = null) {
  const { ANNEX_FARM_URL } = window.variables.URLS || values[NETWORK].URLS;

  if (!url) {
    url = ANNEX_FARM_URL;
  }

  return new Promise((resolve, reject) => {
    makeGraphQLRequest(
      url,
      {
        query: `
                query(
                    $id: Int! = 1
                ) {
                    bundles(
                        id: $id
                    ) {
                        id
                        ethPrice
                    }
                }
            `,
      },
      "post",
      function (data) {
        return resolve(data.bundles);
      },
      function (error) {
        return reject(error);
      }
    );
  });
}

function getPoolUser(id) {
  const { MASTERCHEF_URL } = window.variables.URLS || values[NETWORK].URLS;
  return new Promise((resolve, reject) => {
    makeGraphQLRequest(
      MASTERCHEF_URL,
      {
        query: `
                query(
                    $address: String!, $amount_gt: Int! = 0
                ) {
                    users(
                        where: { address: $address, amount_gt: $amount_gt }
                    ) {
                        id
                        address
                        pool {
                            id
                            pair
                            balance
                            accAnnexPerShare
                            lastRewardBlock
                        }
                        amount
                        rewardDebt
                        entryUSD
                        exitUSD
                        annexHarvested
                        annexHarvestedUSD
                    }
                }
            `,
        variables: {
          address: id,
        },
      },
      "post",
      function (data) {
        const { MASTERCHEF_CONTRACT, farm } = window.variables
        if (MASTERCHEF_CONTRACT) {
          if (farm && farm.POOLS) {
            Promise.all(farm.POOLS.map(({ id: poolId, balance, accAnnexPerShare, lastRewardBlock, pair }) => Promise.all([
              Promise.resolve({
                id: `${poolId}-${id}`,
                pool: { id: poolId, balance, accAnnexPerShare, lastRewardBlock, pair }
              }),
              call(MASTERCHEF_CONTRACT.methods.userInfo)(poolId, id)
            ])))
              .then(users => {
                resolve(users.map(([user, info]) => ({
                  ...user,
                  ...info
                })));
              })
              .catch(reject);
          } else {
            Promise.all(data.users.map(user => Promise.all([
              Promise.resolve(user),
              call(MASTERCHEF_CONTRACT.methods.userInfo)(user.pool.id, user.address)
            ])))
              .then(users => {
                resolve(users.map(([user, info]) => ({
                  ...user,
                  ...info
                })));
              })
              .catch(reject);
          }
        } else {
          return resolve(data.users);
        }
      },
      function (error) {
        return reject(error);
      }
    );
  });
}

function getPairTokenContract(address, abi = null) {
  if (!web3) return null;

  if (!abi) {
    return new web3.eth.Contract(
      window.variables.CONTRACT_PAIR_TOKEN_ABI,
      address
    );
  } else {
    return new web3.eth.Contract(
      abi,
      address
    );
  }
}

function convertFromWei(value) {
  return web3.utils.fromWei(value, "ether");
}

function convertToWei(value) {
  return web3.utils.toWei(value, "ether");
}

function getAllowances(address, pools) {
  const { MASTERCHEF_CONTRACT, PAIR_TOKEN_CONTRACTS } = window.variables;
  return new Promise((resolve, reject) => {
    Promise.all(
      pools.map((pool) => {
        return Promise.all([
          Promise.resolve(pool.pair),
          call(PAIR_TOKEN_CONTRACTS[pool.pair].methods.allowance)(
            address,
            window.variables.CONTRACT_MASTERCHEF_ADDRESS
          ),
          call(MASTERCHEF_CONTRACT.methods.pendingAnnex)(pool.id, address),
          call(PAIR_TOKEN_CONTRACTS[pool.pair].methods.balanceOf)(address),
        ]);
      })
    )
      .then((results) => {
        const pairs = results.reduce(
          (a, [pair, allowance, reward, balance]) => ({
            ...a,
            [pair]: {
              allowance: Number(web3.utils.fromWei(allowance, "ether")),
              reward: Number(web3.utils.fromWei(reward, "ether")),
              balance: web3.utils.fromWei(balance, "ether"),
            },
          }),
          {}
        );
        resolve(pairs);
      })
      .catch(error => {
        console.log('error : ', error);
        reject(error)
      });
  });
}

function getBalance(address, pairContract) {
  return Promise.all([call(pairContract.methods.balanceOf)(address)]);
}

function getBalances(address, pairs) {
  const { PAIR_TOKEN_CONTRACTS } = window.variables;
  return new Promise((resolve, reject) => {
    Promise.all(
      pairs.map((pair) => {
        return Promise.all([
          Promise.resolve(pair.id),
          call(PAIR_TOKEN_CONTRACTS[pair.id].methods.balanceOf)(address),
        ]);
      })
    )
      .then((results) => {
        const pairs = results.reduce(
          (a, [pair, balance]) => ({
            ...a,
            [pair]: {
              balance: +web3.utils.fromWei(balance, "ether"),
            },
          }),
          {}
        );
        resolve(pairs);
      })
      .catch(reject);
  });
}

function getFarmALPBalance(pools) {
  const { CONTRACT_MASTERCHEF_ADDRESS = values[1].CONTRACT_MASTERCHEF_ADDRESS } = window.variables;

  const pairTokenContracts = Object.fromEntries(
    pools.map((pool) => [pool.pair, getPairTokenContract(pool.pair)])
  );

  return Promise.all(
    Object.keys(pairTokenContracts).map((pairAddress) => {
      return Promise.all([
        Promise.resolve(pairAddress),
        web3 ? call(pairTokenContracts[pairAddress].methods.balanceOf)(
          CONTRACT_MASTERCHEF_ADDRESS
        ) : Promise.resolve('0'),
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

function getAllowance(address, pool, pairContract) {
  const { MASTERCHEF_CONTRACT } = window.variables;

  return Promise.all([
    call(pairContract.methods.allowance)(
      address,
      window.variables.CONTRACT_MASTERCHEF_ADDRESS
    ),
    call(MASTERCHEF_CONTRACT.methods.pendingAnnex)(pool.id, address),
    call(pairContract.methods.balanceOf)(address),
  ]);
}

function toChecksumAddress(address) {
  if (!web3 || !address) return address;

  return web3.utils.toChecksumAddress(address);
}

function runHarvest([pid, earning], callback) {
  const { MASTERCHEF_CONTRACT, ACCOUNT } = window.variables;

  if (ACCOUNT) {
    send(MASTERCHEF_CONTRACT.methods.deposit)(pid, 0, { from: ACCOUNT })
      .send()
      .on("transactionHash", (hash) => {
        services.push({ text: `Claim ${earning}`, hash });
      })
      .on("receipt", (receipt) => {
        callback(data, null);
        services.update(receipt);
      })
      .on("error", (error, receipt) => {
        callback(null, error);
        if (receipt) services.update(receipt);
      });
  } else {
    callback(null, {
      error: "Choose account!",
    });
  }
}

function runApproveStaking(pairAddress, name, callback) {
  const {
    ACCOUNT,
    CONTRACT_MASTERCHEF_ADDRESS,
    PAIR_TOKEN_CONTRACTS,
    farm: { LOADDING_APPROVE },
  } = window.variables;

  if (ACCOUNT && !LOADDING_APPROVE) {
    window.variables.farm.LOADDING_APPROVE = 1;

    send(
      PAIR_TOKEN_CONTRACTS[pairAddress].methods.approve
    )(
      CONTRACT_MASTERCHEF_ADDRESS,
      new BigNumber(2).pow(256).minus(1).toString(10),
      { from: ACCOUNT }
    )
      .send()
      .on("transactionHash", (hash) => {
        window.variables.farm.LOADDING_APPROVE = 0;
        services.push({ text: `Approve ${name}`, hash });
      })
      .on("receipt", (receipt) => {
        window.variables.farm.LOADDING_APPROVE = 0;
        callback(data, null);
        services.update(receipt);
      })
      .on("error", (error, receipt) => {
        window.variables.farm.LOADDING_APPROVE = 0;
        callback(null, error);
        if (receipt) services.update(receipt);
      });
  } else {
    callback(null, {
      error: "Choose account!",
    });
  }
}

function runStake(poolId, amount, name, type = "stake", callback) {
  const { MASTERCHEF_CONTRACT, ACCOUNT } = window.variables;

  if (type == "stake" && ACCOUNT) {
    send(MASTERCHEF_CONTRACT.methods.deposit)(
      poolId,
      toWei(new BigNumber(amount), 18).toString(10),
      { from: ACCOUNT }
    )
      .send()
      .on("transactionHash", (hash) => {
        services.push({
          text: `Stake ${Number(amount).toFixed(6)} ALP (${name})`,
          hash,
        });
        $("#stake_asset .js-confirm-btn").attr("disabled", true);
      })
      .on("receipt", (receipt) => {
        callback(data, null);
        services.update(receipt);
        $("#stake_asset .js-confirm-btn").attr("disabled", false);
      })
      .on("error", (error, receipt) => {
        callback(null, error);
        if (receipt) services.update(receipt);
        $("#stake_asset .js-confirm-btn").attr("disabled", false);
      });
  } else if (type == "unstake" && ACCOUNT) {
    send(MASTERCHEF_CONTRACT.methods.withdraw)(
      poolId,
      toWei(new BigNumber(amount), 18).toString(10),
      { from: ACCOUNT }
    )
      .send()
      .on("transactionHash", (hash) => {
        services.push({
          text: `Unstake ${Number(amount).toFixed(6)} ALP (${name})`,
          hash,
        });
        $("#stake_asset .js-confirm-btn").attr("disabled", true);
      })
      .on("receipt", (receipt) => {
        callback(data, null);
        services.update(receipt);
        $("#stake_asset .js-confirm-btn").attr("disabled", false);
      })
      .on("error", (error, receipt) => {
        callback(null, error);
        if (receipt) services.update(receipt);
        $("#stake_asset .js-confirm-btn").attr("disabled", false);
      });
  } else {
    callback(null, {
      error: "Choose account!",
    });
  }
}

function getQuote(amountA, reserveA, reserveB) {
  const { ROUTER_CONTRACT } = window.variables;

  return amountA
    ? call(ROUTER_CONTRACT.methods.quote)(
      toWei(new BigNumber(amountA)).toString(10),
      toWei(new BigNumber(reserveA)).toString(10),
      toWei(new BigNumber(reserveB)).toString(10)
    )
      .then((amountB) => {
        return fromWei(new BigNumber(amountB.toString()));
      })
      .catch((error) => {
        return null;
      })
    : Promise.resolve(null);
}

const formatNumber = (
  value,
  round = 2,
  locale = "en",
  style = null,
  currency = null
) => {
  let newValue = new BigNumber(value).toFixed(round);
  if (style && currency) {
    value = new Intl.NumberFormat(locale, { style, currency }).format(newValue);
  } else if (style) {
    value = new Intl.NumberFormat(locale, { style }).format(newValue);
  } else {
    value = new Intl.NumberFormat(locale).format(newValue);
  }

  return value;
};
