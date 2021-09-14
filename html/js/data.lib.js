"use strict";function ownKeys(n,e){var r,t=Object.keys(n);return Object.getOwnPropertySymbols&&(r=Object.getOwnPropertySymbols(n),e&&(r=r.filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})),t.push.apply(t,r)),t}function _objectSpread(n){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?ownKeys(Object(r),!0).forEach(function(e){_defineProperty(n,e,r[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach(function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(r,e))})}return n}function _defineProperty(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function _slicedToArray(e,n){return _arrayWithHoles(e)||_iterableToArrayLimit(e,n)||_unsupportedIterableToArray(e,n)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(e,n){if(e){if("string"==typeof e)return _arrayLikeToArray(e,n);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,n):void 0}}function _arrayLikeToArray(e,n){(null==n||n>e.length)&&(n=e.length);for(var r=0,t=new Array(n);r<n;r++)t[r]=e[r];return t}function _iterableToArrayLimit(e,n){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var r=[],t=!0,o=!1,i=void 0;try{for(var a,s=e[Symbol.iterator]();!(t=(a=s.next()).done)&&(r.push(a.value),!n||r.length!==n);t=!0);}catch(e){o=!0,i=e}finally{try{t||null==s.return||s.return()}finally{if(o)throw i}}return r}}function _arrayWithHoles(e){if(Array.isArray(e))return e}function asyncGeneratorStep(e,n,r,t,o,i,a){try{var s=e[i](a),l=s.value}catch(e){return void r(e)}s.done?n(l):Promise.resolve(l).then(t,o)}function _asyncToGenerator(s){return function(){var e=this,a=arguments;return new Promise(function(n,r){var t=s.apply(e,a);function o(e){asyncGeneratorStep(t,n,r,o,i,"next",e)}function i(e){asyncGeneratorStep(t,n,r,o,i,"throw",e)}o(void 0)})}}var NETWORK=56,tokenFields="{\n    id\n    name\n    symbol\n    totalSupply\n    derivedETH\n}",factoryFields="{\n  volumeUSD\n  volumeETH\n  untrackedVolumeUSD\n  liquidityUSD\n  liquidityETH\n  txCount\n  tokenCount\n  userCount\n}",pairFields="{\n    id\n    reserveUSD\n    reserveETH\n    volumeUSD\n    untrackedVolumeUSD\n    trackedReserveETH\n    token0 ".concat(tokenFields,"\n    token1 ").concat(tokenFields,"\n    reserve0\n    reserve1\n    token0Price\n    token1Price\n    totalSupply\n    txCount\n    timestamp\n}"),blockFields="{\n    id\n    number\n    timestamp\n}",tokenFullFields="{\n    id\n    symbol\n    name\n    decimals\n    totalSupply\n    volume\n    volumeUSD\n    untrackedVolumeUSD\n    txCount\n    liquidity\n    derivedETH\n    basePairs ".concat(pairFields,"\n    quotePairs ").concat(pairFields,"\n}"),globalFailed=function(e){console.log("Failed!!!",e)},globalSuccess=function(e){console.log("Suucess!!!",e)};function makeGraphQLRequest(e,n){var r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:"post",t=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null,o=4<arguments.length&&void 0!==arguments[4]?arguments[4]:null;$.ajax({url:e,method:r,data:JSON.stringify(n),dataType:"json",contentType:"application/json",success:function(e){e.data?(t||globalSuccess)(e.data):(console.log(e),globalFailed(e.error))},error:function(e){o||globalFailed(e)}})}function getPool(e){return _getPool.apply(this,arguments)}function _getPool(){return(_getPool=_asyncToGenerator(regeneratorRuntime.mark(function e(t){var n,o;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=window.variables.URLS||values[NETWORK].URLS,o=n.MASTERCHEF_URL,e.abrupt("return",new Promise(function(n,r){makeGraphQLRequest(o,{query:"\n                query(\n                    $id: ID!\n                    ) {\n                        pools(\n                            id: $id\n                        ) {\n                            id\n                            pair\n                            allocPoint\n                            lastRewardBlock\n                            accAnnexPerShare\n                            balance\n                            userCount\n                            owner {\n                                id\n                                annexPerBlock\n                                totalAllocPoint\n                            }\n                            users(orderBy: amount, orderDirection: desc) {\n                                id\n                                address\n                                amount\n                                rewardDebt\n                            }\n                            slpAge\n                            liquidityPair @client\n                            timestamp\n                            entryUSD\n                            exitUSD\n                        }\n                    }\n            ",variables:{id:t}},"post",function(e){return n(e.pools)},function(e){return r(e)})}));case 2:case"end":return e.stop()}},e)}))).apply(this,arguments)}function getPools(){return _getPools.apply(this,arguments)}function _getPools(){return(_getPools=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,n,r,o=arguments;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=0<o.length&&void 0!==o[0]?o[0]:null,n=window.variables.URLS||values[NETWORK].URLS,r=n.MASTERCHEF_URL,t=t||r,e.abrupt("return",new Promise(function(n,r){makeGraphQLRequest(t,{query:'\n                query(\n                    $first: Int! = 1000\n                    $skip: Int! = 0\n                    $orderBy: String! = "timestamp"\n                    $orderDirection: String! = "desc"\n                    ) {\n                        pools(\n                            first: $first\n                            skip: $skip\n                            orderBy: $orderBy\n                            orderDirection: $orderDirection\n                        ) {\n                            id\n                            pair\n                            allocPoint\n                            lastRewardBlock\n                            accAnnexPerShare\n                            balance\n                            userCount\n                            owner {\n                                id\n                                annexPerBlock\n                                totalAllocPoint\n                            }\n                        }\n                    }\n            ',variables:{first:1e3,skip:0,orderBy:"timestamp",orderDirection:"desc"}},"post",function(e){return n(e.pools)},function(e){return r(e)})}));case 4:case"end":return e.stop()}},e)}))).apply(this,arguments)}function getPoolsFromBSC(){var e,n=window.variables,l=n.MASTERCHEF_CONTRACT,u=n.ACCOUNT;return l||(e=window.values[56].CONTRACT_MASTERCHEF_ADDRESS,web3.setProvider("https://bsc-dataseed.binance.org/"),l=new web3.eth.Contract(window.variables.CONTRACT_MASTERCHEF_ABI,e)),Promise.all([call(l.methods.poolLength)(),call(l.methods.owner)(),call(l.methods.annexPerBlock)(),call(l.methods.totalAllocPoint)()]).then(function(e){for(var n=_slicedToArray(e,4),r=n[0],i=n[1],a=n[2],s=n[3],t=[],o=0;o<r;o+=1)t.push(o);return Promise.all(t.map(function(e){return Promise.all([Promise.resolve(e),call(l.methods.poolInfo)(e),u?call(l.methods.userInfo)(e,u):Promise.resolve({amount:0,rewardDebt:0})])})).then(function(e){return e.map(function(e){var n=_slicedToArray(e,3),r=n[0],t=n[1],o=n[2];return{id:r.toString(),allocPoint:t.allocPoint,lastRewardBlock:t.lastRewardBlock,pair:t.lpToken.toLowerCase(),accAnnexPerShare:t.accAnnexPerShare,owner:{id:i,annexPerBlock:a,totalAllocPoint:s},balance:o.amount,rewardDebt:o.rewardDebt}})}).catch(console.log)})}function getLiquidityPositions(){return _getLiquidityPositions.apply(this,arguments)}function _getLiquidityPositions(){return(_getLiquidityPositions=_asyncToGenerator(regeneratorRuntime.mark(function e(){var n,t,o;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(n=window.variables.URLS||values[NETWORK].URLS,t=n.ANNEX_FARM_URL,o=window.variables.ACCOUNT)return e.abrupt("return",new Promise(function(n,r){makeGraphQLRequest(t,{query:"query(\n                    $first: Int! = 1000,\n                    $user: Bytes!\n                  ) {\n                    liquidityPositions(first: $first, where: { user: $user }) {\n                      id\n                      liquidityTokenBalance\n                      user {\n                        id\n                      }\n                      pair {\n                        id\n                      }\n                    }\n                  }",variables:{user:o.toLowerCase()}},"post",function(e){return n(e.liquidityPositions)},function(e){return r(e)})}));e.next=6;break;case 6:return e.abrupt("return",new Promise(function(e,n){return e([])}));case 7:case"end":return e.stop()}},e)}))).apply(this,arguments)}function getPairs(e,u,c){console.log("pairAddresses: ",e);var n=window.variables,r=n.CONTRACT_TOKEN_ADDRESS,t=n.CONTRACT_TOKEN_ABI,d=n.CONTRACT_ERC20_ABI,o=e.map(function(e){return toChecksumAddress(e)===toChecksumAddress(r)?[e,getPairTokenContract(e,t)]:[e,getPairTokenContract(e)]});return console.log("pairContracts: ",o),Promise.all(o.map(function(e){return Promise.all([Promise.resolve(e[0]),web3&&e[1].methods.token0?call(e[1].methods.token0)():Promise.resolve(e[0]),web3&&e[1].methods.token1?call(e[1].methods.token1)():Promise.resolve(null),web3&&e[1].methods.getReserves?call(e[1].methods.getReserves)():Promise.resolve("0"),web3&&e[1].methods.totalSupply?call(e[1].methods.totalSupply)():Promise.resolve(null),web3&&e[1].methods.name?call(e[1].methods.name)():Promise.resolve(null)])})).then(function(e){return console.log("results : ",e),Promise.all(e.map(function(e){var n=_slicedToArray(e,6),r=n[0],t=n[1],o=n[2],i=n[3],a=n[4],s=n[5],l=t?getPairTokenContract(t,d):null,u=o?getPairTokenContract(o,d):null;return Promise.all([Promise.resolve(r),Promise.resolve(i),Promise.resolve(a),Promise.resolve(s),Promise.resolve(t),web3&&l?call(l.methods.decimals)():Promise.resolve(null),web3&&l?call(l.methods.name)():Promise.resolve(null),web3&&l?call(l.methods.symbol)():Promise.resolve(null),Promise.resolve(o),web3&&u?call(u.methods.decimals)():Promise.resolve(null),web3&&u?call(u.methods.name)():Promise.resolve(null),web3&&u?call(u.methods.symbol)():Promise.resolve(null),t?getOnlyToken(t):Promise.resolve(null),o?getOnlyToken(o):Promise.resolve(null)])})).then(function(e){return console.log("result: ",e),e.map(function(e){var n=Array.isArray(e[1])?new BigNumber(e[1][0]).div(new BigNumber(10).pow(e[4])).toString(10):new BigNumber(e[1]).div(new BigNumber(10).pow(e[4])).toString(10),r=Array.isArray(e[1])?new BigNumber(e[1][1]).div(new BigNumber(10).pow(e[8])).toString(10):0,t=0,t=new BigNumber(r).isZero()?0:new BigNumber(n).div(r).toString(10),o=0,o=new BigNumber(n).isZero()?0:new BigNumber(r).div(n).toString(),i=e[12],a=e[13],s=new BigNumber(0),l=(s=i&&a?new BigNumber(n).times(i.derivedETH).plus(r.times(a.derivedETH)):new BigNumber(n).times(c).div(u)).times(u);return{id:e[0],reserve0:n,reserve1:r,reserveETH:s,reserveUSD:l,token0Price:t,token1Price:o,totalSupply:new BigNumber(e[2]).div(1e18).toString(10),token0:{id:e[4],decimals:e[5],name:e[6],symbol:e[7]},token1:{id:e[8],decimals:e[9],name:e[10],symbol:e[11]}}})})}).catch(console.log)}function getFullPairs(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:0,t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:1e3,o=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;return o=o||(window.variables.URLS||values[NETWORK].URLS).ANNEX_FARM_URL,new Promise(function(n,r){makeGraphQLRequest(o,{query:'\n                query(\n                    $first: Int! = 1000\n                    $offset: Int! = 0\n                    $orderBy: String! = "timestamp"\n                    $orderDirection: String! = "desc"\n                ) {\n                    pairs(\n                        first: $first\n                        skip: $offset\n                        orderBy: $orderBy\n                        orderDirection: $orderDirection\n                    ) '.concat(pairFields,"\n                }\n            "),variables:{first:t,offset:e}},"post",function(e){return n(e.pairs)},function(e){return r(e)})})}function getPair(e){var t=(window.variables.URLS||values[NETWORK].URLS).ANNEX_FARM_URL;return new Promise(function(n,r){makeGraphQLRequest(t,{query:"\n                query(\n                    $id: ID!\n                ) {\n                    pairs(\n                        where: { id: $id }\n                    ) ".concat(pairFields,"\n                }\n            "),variables:{id:e.toLowerCase()}},"post",function(e){return n(e.pairs)},function(e){return r(e)})})}function getAverageBlockTime(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,n=dateFns.startOfSecond(dateFns.startOfMinute(dateFns.startOfHour(Date.now()))),t=dateFns.getTime(dateFns.subHours(n,6))/1e3,o=dateFns.getTime(n)/1e3,r=(window.variables.URLS||values[NETWORK].URLS).BLOCK_URL,e=e||r;return new Promise(function(r,n){makeGraphQLRequest(e,{query:"\n                query(\n                    $first: Int! = 1000\n                    $skip: Int! = 0\n                    $start: Int!\n                    $end: Int!\n                ) {\n                    blocks(\n                        first: $first\n                        skip: $skip\n                        orderBy: number\n                        orderDirection: desc\n                        where: { timestamp_gt: $start, timestamp_lt: $end, number_gt: 9300000 }\n                    ) ".concat(blockFields,"\n                }\n            "),variables:{start:t,end:o}},"post",function(e){var o=e.blocks,n=o.reduce(function(e,n,r){var t;return e.timestamp&&(t=e.timestamp-n.timestamp,e.difference=e.difference+t),e.timestamp=n.timestamp,r===o.length-1?e.difference/o.length:e},{timestamp:null,difference:0});return r(n)},function(e){return n(e)})})}function getToken(e){return _getToken.apply(this,arguments)}function _getToken(){return(_getToken=_asyncToGenerator(regeneratorRuntime.mark(function e(t){var o,i,a,n,r,s=arguments;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return o=1<s.length&&void 0!==s[1]?s[1]:null,i={number:5546330},a={number:5546330},n=window.variables.URLS||values[NETWORK].URLS||{},r=n.ANNEX_FARM_URL,o=o||r,e.abrupt("return",Promise.all([new Promise(function(n,r){makeGraphQLRequest(o,{query:"\n                    query(\n                        $id: String!\n                    ) {\n                        token(\n                            id: $id\n                        ) ".concat(tokenFullFields,"\n                    }\n                "),variables:{id:t.toLowerCase()}},"post",function(e){return n(e.token)},function(e){return r(e)})}),new Promise(function(n,r){makeGraphQLRequest(o,{query:"\n                    query(\n                        $id: String!, $block: Block_height!\n                    ) {\n                        token(\n                            id: $id, block: $block\n                        ) ".concat(tokenFullFields,"\n                    }\n                "),variables:{id:t,block:i}},"post",function(e){return n(e.token)},function(e){return r(e)})}),new Promise(function(n,r){makeGraphQLRequest(o,{query:"\n                    query(\n                        $id: String!, $block: Block_height!\n                    ) {\n                        token(\n                            id: $id, block: $block\n                        ) ".concat(tokenFullFields,"\n                    }\n                "),variables:{id:t,block:a}},"post",function(e){return n(e.token)},function(e){return r(e)})})]).then(function(e){var n=_slicedToArray(e,3),r=n[0],t=n[1],o=n[2];return _objectSpread(_objectSpread({},r),{},{oneDay:{volumeUSD:String(null==t?void 0:t.volumeUSD),derivedETH:String(null==t?void 0:t.derivedETH),liquidity:String(null==t?void 0:t.liquidity),txCount:String(null==t?void 0:t.txCount)},twoDay:{volumeUSD:String(null==o?void 0:o.volumeUSD),derivedETH:String(null==o?void 0:o.derivedETH),liquidity:String(null==o?void 0:o.liquidity),txCount:String(null==o?void 0:o.txCount)}})}).catch(function(e){return{}}));case 6:case"end":return e.stop()}},e)}))).apply(this,arguments)}function getOnlyToken(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,n=window.variables.URLS||values[NETWORK].URLS||{},t=t||n.ANNEX_FARM_URL;return new Promise(function(n,r){makeGraphQLRequest(t,{query:"\n                    query(\n                        $id: String!\n                    ) {\n                        token(\n                            id: $id\n                        ) ".concat(tokenFullFields,"\n                    }\n                "),variables:{id:e.toLowerCase()}},"post",function(e){return n(e.token)},function(e){return r(e)})}).then(function(e){return e}).catch(function(e){return{}})}function getEthPrice(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,n=(window.variables.URLS||values[NETWORK].URLS).ANNEX_FARM_URL,e=e||n;return new Promise(function(n,r){makeGraphQLRequest(e,{query:"\n                query(\n                    $id: Int! = 1\n                ) {\n                    bundles(\n                        id: $id\n                    ) {\n                        id\n                        ethPrice\n                    }\n                }\n            "},"post",function(e){return n(e.bundles)},function(e){return r(e)})})}function getPoolUser(s){var e=(window.variables.URLS||values[NETWORK].URLS).MASTERCHEF_URL;return new Promise(function(t,o){makeGraphQLRequest(e,{query:"\n                query(\n                    $address: String!, $amount_gt: Int! = 0\n                ) {\n                    users(\n                        where: { address: $address, amount_gt: $amount_gt }\n                    ) {\n                        id\n                        address\n                        pool {\n                            id\n                            pair\n                            balance\n                            accAnnexPerShare\n                            lastRewardBlock\n                        }\n                        amount\n                        rewardDebt\n                        entryUSD\n                        exitUSD\n                        annexHarvested\n                        annexHarvestedUSD\n                    }\n                }\n            ",variables:{address:s}},"post",function(e){var n=window.variables,a=n.MASTERCHEF_CONTRACT,r=n.farm;if(!a)return t(e.users);r&&r.POOLS?Promise.all(r.POOLS.map(function(e){var n=e.id,r=e.balance,t=e.accAnnexPerShare,o=e.lastRewardBlock,i=e.pair;return Promise.all([Promise.resolve({id:"".concat(n,"-").concat(s),pool:{id:n,balance:r,accAnnexPerShare:t,lastRewardBlock:o,pair:i}}),call(a.methods.userInfo)(n,s)])})).then(function(e){t(e.map(function(e){var n=_slicedToArray(e,2),r=n[0],t=n[1];return _objectSpread(_objectSpread({},r),t)}))}).catch(o):Promise.all(e.users.map(function(e){return Promise.all([Promise.resolve(e),call(a.methods.userInfo)(e.pool.id,e.address)])})).then(function(e){t(e.map(function(e){var n=_slicedToArray(e,2),r=n[0],t=n[1];return _objectSpread(_objectSpread({},r),t)}))}).catch(o)},function(e){return o(e)})})}function getPairTokenContract(e){var n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;return web3?n?new web3.eth.Contract(n,e):new web3.eth.Contract(window.variables.CONTRACT_PAIR_TOKEN_ABI,e):null}function convertFromWei(e){return web3.utils.fromWei(e,"ether")}function convertToWei(e){return web3.utils.toWei(e,"ether")}function getAllowances(t,e){var n=window.variables,o=n.MASTERCHEF_CONTRACT,i=n.PAIR_TOKEN_CONTRACTS;return new Promise(function(r,n){Promise.all(e.map(function(e){return Promise.all([Promise.resolve(e.pair),call(i[e.pair].methods.allowance)(t,window.variables.CONTRACT_MASTERCHEF_ADDRESS),call(o.methods.pendingAnnex)(e.id,t),call(i[e.pair].methods.balanceOf)(t)])})).then(function(e){var n=e.reduce(function(e,n){var r=_slicedToArray(n,4),t=r[0],o=r[1],i=r[2],a=r[3];return _objectSpread(_objectSpread({},e),{},_defineProperty({},t,{allowance:Number(web3.utils.fromWei(o,"ether")),reward:Number(web3.utils.fromWei(i,"ether")),balance:web3.utils.fromWei(a,"ether")}))},{});console.log("pairs---- ",n),r(n)}).catch(function(e){console.log("error : ",e),n(e)})})}function getBalance(e,n){return Promise.all([call(n.methods.balanceOf)(e)])}function getBalances(n,t){var o=window.variables.PAIR_TOKEN_CONTRACTS;return new Promise(function(r,e){Promise.all(t.map(function(e){return Promise.all([Promise.resolve(e.id),call(o[e.id].methods.balanceOf)(n)])})).then(function(e){var n=e.reduce(function(e,n){var r=_slicedToArray(n,2),t=r[0],o=r[1];return _objectSpread(_objectSpread({},e),{},_defineProperty({},t,{balance:+web3.utils.fromWei(o,"ether")}))},{});r(n)}).catch(e)})}function getFarmALPBalance(e){var n=window.variables.CONTRACT_MASTERCHEF_ADDRESS,r=void 0===n?values[1].CONTRACT_MASTERCHEF_ADDRESS:n,t=Object.fromEntries(e.map(function(e){return[e.pair,getPairTokenContract(e.pair)]}));return Promise.all(Object.keys(t).map(function(e){return Promise.all([Promise.resolve(e),web3?call(t[e].methods.balanceOf)(r):Promise.resolve("0")])})).then(function(e){return{balances:e.reduce(function(e,n){var r=_slicedToArray(n,2),t=r[0],o=r[1];return _objectSpread(_objectSpread({},e),{},_defineProperty({},t,{balance:fromWei(new BigNumber(o),18)}))},{}),pairTokenContracts:t}}).catch(console.log)}function getAllowance(e,n,r){var t=window.variables.MASTERCHEF_CONTRACT;return Promise.all([call(r.methods.allowance)(e,window.variables.CONTRACT_MASTERCHEF_ADDRESS),call(t.methods.pendingAnnex)(n.id,e),call(r.methods.balanceOf)(e)])}function toChecksumAddress(e){return web3&&e?web3.utils.toChecksumAddress(e):e}function runHarvest(e,r){var n=_slicedToArray(e,2),t=n[0],o=n[1],i=window.variables,a=i.MASTERCHEF_CONTRACT,s=i.ACCOUNT;s?send(a.methods.deposit)(t,0,{from:s}).send().on("transactionHash",function(e){services.push({text:"Claim ".concat(o),hash:e})}).on("receipt",function(e){r(data,null),services.update(e)}).on("error",function(e,n){r(null,e),n&&services.update(n)}):r(null,{error:"Choose account!"})}function runApproveStaking(e,n,r){var t=window.variables,o=t.ACCOUNT,i=t.CONTRACT_MASTERCHEF_ADDRESS,a=t.PAIR_TOKEN_CONTRACTS,s=t.farm.LOADDING_APPROVE;o&&!s?(window.variables.farm.LOADDING_APPROVE=1,send(a[e].methods.approve)(i,new BigNumber(2).pow(256).minus(1).toString(10),{from:o}).send().on("transactionHash",function(e){window.variables.farm.LOADDING_APPROVE=0,services.push({text:"Approve ".concat(n),hash:e})}).on("receipt",function(e){window.variables.farm.LOADDING_APPROVE=0,r(data,null),services.update(e)}).on("error",function(e,n){window.variables.farm.LOADDING_APPROVE=0,r(null,e),n&&services.update(n)})):r(null,{error:"Choose account!"})}function runStake(e,n,r){var t=3<arguments.length&&void 0!==arguments[3]?arguments[3]:"stake",o=4<arguments.length?arguments[4]:void 0,i=window.variables,a=i.MASTERCHEF_CONTRACT,s=i.ACCOUNT;"stake"==t&&s?send(a.methods.deposit)(e,toWei(new BigNumber(n),18).toString(10),{from:s}).send().on("transactionHash",function(e){services.push({text:"Stake ".concat(Number(n).toFixed(6)," SLP (").concat(r,")"),hash:e}),$("#stake_asset .js-confirm-btn").attr("disabled",!0)}).on("receipt",function(e){o(data,null),services.update(e),$("#stake_asset .js-confirm-btn").attr("disabled",!1)}).on("error",function(e,n){o(null,e),n&&services.update(n),$("#stake_asset .js-confirm-btn").attr("disabled",!1)}):"unstake"==t&&s?send(a.methods.withdraw)(e,toWei(new BigNumber(n),18).toString(10),{from:s}).send().on("transactionHash",function(e){services.push({text:"Unstake ".concat(Number(n).toFixed(6)," SLP (").concat(r,")"),hash:e}),$("#stake_asset .js-confirm-btn").attr("disabled",!0)}).on("receipt",function(e){o(data,null),services.update(e),$("#stake_asset .js-confirm-btn").attr("disabled",!1)}).on("error",function(e,n){o(null,e),n&&services.update(n),$("#stake_asset .js-confirm-btn").attr("disabled",!1)}):o(null,{error:"Choose account!"})}function getQuote(e,n,r){var t=window.variables.ROUTER_CONTRACT;return e?call(t.methods.quote)(toWei(new BigNumber(e)).toString(10),toWei(new BigNumber(n)).toString(10),toWei(new BigNumber(r)).toString(10)).then(function(e){return fromWei(new BigNumber(e.toString()))}).catch(function(e){return null}):Promise.resolve(null)}var formatNumber=function(e,n,r,t,o){var i=1<arguments.length&&void 0!==n?n:2,a=2<arguments.length&&void 0!==r?r:"en",s=3<arguments.length&&void 0!==t?t:null,l=4<arguments.length&&void 0!==o?o:null,u=new BigNumber(e).toFixed(i);return e=s&&l?new Intl.NumberFormat(a,{style:s,currency:l}).format(u):s?new Intl.NumberFormat(a,{style:s}).format(u):new Intl.NumberFormat(a).format(u)};