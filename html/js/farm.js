"use strict";function ownKeys(t,e){var i,a=Object.keys(t);return Object.getOwnPropertySymbols&&(i=Object.getOwnPropertySymbols(t),e&&(i=i.filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})),a.push.apply(a,i)),a}function _objectSpread(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?ownKeys(Object(i),!0).forEach(function(e){_defineProperty(t,e,i[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(i)):ownKeys(Object(i)).forEach(function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e))})}return t}function _defineProperty(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function _slicedToArray(e,t){return _arrayWithHoles(e)||_iterableToArrayLimit(e,t)||_unsupportedIterableToArray(e,t)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArrayLimit(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var i=[],a=!0,n=!1,r=void 0;try{for(var o,c=e[Symbol.iterator]();!(a=(o=c.next()).done)&&(i.push(o.value),!t||i.length!==t);a=!0);}catch(e){n=!0,r=e}finally{try{a||null==c.return||c.return()}finally{if(n)throw r}}return i}}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _toConsumableArray(e){return _arrayWithoutHoles(e)||_iterableToArray(e)||_unsupportedIterableToArray(e)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);return"Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i?Array.from(e):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?_arrayLikeToArray(e,t):void 0}}function _iterableToArray(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function _arrayWithoutHoles(e){if(Array.isArray(e))return _arrayLikeToArray(e)}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,a=new Array(t);i<t;i++)a[i]=e[i];return a}var BSC=56,NETWORK=1,pairList=[],sortField="apy",sortDirection="desc",searchKeyward="";function initHook(){window.hooks.forEach(createHook)}function initFarm(){console.log("initFarm"),initData(function(e,t){console.log("POOOOOOOLS : ",e),window.variables.PAIR_TOKEN_CONTRACTS=t,window.variables.farm.POOLS=e,window.variables.farm.USERS=[],window.variables.farm.ALLOWANCES=[],window.variables.ACCOUNT?updateFarm():(pairList=e,sortData()),refreshFarm()})}function updateFarm(){window.variables.farm.POOLS&&(pairList=window.variables.farm.POOLS,initUserData(function(){sortData()}))}function refreshFarm(){setTimeout(function(){updateFarm(),refreshFarm()},3e4)}function onNetworkChanged(){$("#farm-table-body .farm-item").remove(),$("#loading").show(),$("#no-pools").hide()}function initData(c){var e=window.variables.CONTRACT_TOKEN_ADDRESS,t=void 0===e?values[56].CONTRACT_TOKEN_ADDRESS:e;Promise.all([getLiquidityPositions(),getPools(),getAverageBlockTime(),getToken(t),getEthPrice()]).then(function(e){var t=_slicedToArray(e,5),p=t[0],r=t[1],f=t[2],i=t[3],a=t[4];console.log([p,r,f,i,a]);var n=0!==a.length?a[0].ethPrice:0,b=n*i.derivedETH,o=r.map(function(e){return e.pair}).sort(),y=(window.variables||y).NETWORK;console.log("annexPrice: ",b),Promise.all([getPairs(o,n,b),getFarmALPBalance(r)]).then(function(e){var t=_slicedToArray(e,2),m=t[0],i=t[1],v=i.balances,a=i.pairTokenContracts,n=r.filter(function(t){return!window.variables.POOL_DENY.includes(t.id)&&"0"!==t.allocPoint&&m.find(function(e){return(null==e?void 0:e.id)===t.pair})}).map(function(t){var i=m.find(function(e){return e.id===t.pair}),e=p.find(function(e){return e.pair.id===i.id});f=y==BSC?4:f;var a=v[t.pair].balance.toString(10),n=3600/f,r=a/Number(i.totalSupply)*Number(i.reserveUSD),o=t.allocPoint/t.owner.totalAllocPoint*t.owner.annexPerBlock/1e18,c=r?2*o*b/r:0,s=c*n,d=24*s,l=30*d,u=12*l;return _objectSpread(_objectSpread({},t),{},{liquidityPair:i,roiPerBlock:c,roiPerHour:s,roiPerDay:d,roiPerMonth:l,roiPerYear:u,rewardPerThousand:1e3/b*d,tvl:i.reserveUSD/i.totalSupply*((null==e?void 0:e.liquidityTokenBalance)||0)})});c(n,a)}).catch(function(e){})}).catch(console.log)}function initUserData(n){var e=window.variables,t=e.ACCOUNT,i=e.farm.POOLS;t&&Promise.all([t?getPoolUser(t):Promise.resolve([]),t&&i?getAllowances(t,i):Promise.resolve([])]).then(function(e){var t=_slicedToArray(e,2),i=t[0],a=t[1];console.log("^^^^^ ",[i,a]),window.variables.farm.USERS=i,window.variables.farm.ALLOWANCES=a,n()}).catch(console.log)}function farmTableRender(){var O=window.variables.farm.USERS||[],q=window.variables.farm.ALLOWANCES||[],T=window.variables.TOKEN_LIST[window.variables.NETWORK||NETWORK];console.log("assets : ",T),0<pairList.length?pairList.forEach(function(t){var e,i,a,n,r=t.liquidityPair.token1.name?"".concat(t.liquidityPair.token0.name," ").concat(t.liquidityPair.token1.name):t.liquidityPair.token0.name,o=t.liquidityPair.token1.symbol?"".concat(t.liquidityPair.token0.symbol,"-").concat(t.liquidityPair.token1.symbol):t.liquidityPair.token0.symbol,c="".concat(t.liquidityPair.id),s=(T.find(function(e){return e.address.toLowerCase()==t.liquidityPair.token0.id}),T.find(function(e){return e.address.toLowerCase()==t.liquidityPair.token1.id}),t.user),d=t.user.userPercent,l=d.times(null===(e=t.liquidityPair)||void 0===e?void 0:e.reserveUSD),u=d.times(null===(i=t.liquidityPair)||void 0===i?void 0:i.reserve0),m=d.times(null===(a=t.liquidityPair)||void 0===a?void 0:a.reserve1),v=q[t.pair]&&q[t.pair].reward?q[t.pair].reward:"0.00",p=!q[t.pair]||q[t.pair]&&!q[t.pair].reward?"No rewards":"Harvest Now",f='<a class="btn" href="add-liquidity?type=add&inputCurrency='.concat(t.liquidityPair.token0.id,"&outputCurrency=").concat(t.liquidityPair.token1.id,'">Add Liquidity</a>'),b="",y="";b=(!q[t.pair]||q[t.pair]&&!q[t.pair].allowance)&&new BigNumber(O?((null==s?void 0:s.amount)||0)/1e18:"0.00").isZero()?'<a class="btn btn-link btn-approve-staking" href="#" data-address="'.concat(t.pair,'" data-name="').concat(o,'">Approve Staking</a>'):'<a class="btn js-popup-open"\n                        href="#stake_asset"\n                        data-id="'.concat(t.id,'"\n                        data-address="').concat(t.pair,'"\n                        data-name="').concat(o,'"\n                        data-type="stake"\n                        data-amount="').concat((null===(n=q[t.pair])||void 0===n?void 0:n.balance)||0,'"\n                        data-title="Deposit">Stake</a>'),new BigNumber(O?((null==s?void 0:s.amount)||0)/1e18:"0.00").isZero()||(y='<a class="btn js-popup-open"\n                          href="#stake_asset"\n                          data-id="'.concat(t.id,'"\n                          data-address="').concat(t.pair,'"\n                          data-name="').concat(o,'"\n                          data-type="unstake"\n                          data-amount="').concat(new BigNumber(null==s?void 0:s.amount).div(1e18).toString(10)||0,'"\n                          data-title="Withdraw">UnStake</a>'));var w,g,P,_,k,h,S,N="",N=t.liquidityPair.token1.id?"".concat(formatNumber(u.toNumber(),Number(t.liquidityPair.token0.decimals))," ").concat(t.liquidityPair.token0.symbol," / ").concat(formatNumber(m.toNumber(),Number(t.liquidityPair.token1.decimals))," ").concat(t.liquidityPair.token1.symbol):"".concat(formatNumber(u.toNumber(),Number(t.liquidityPair.token0.decimals))," ").concat(t.liquidityPair.token0.symbol),A=$(".farm-list-items").find("#pair-".concat(c));A.length?(A.find("#pair-".concat(c,"-staked-amount")).text("".concat(formatNumber(l,2,"en","currency","USD"))),A.find("#pair-".concat(c,"-staked-desc")).text("".concat(N)),A.find("#pair-".concat(c,"-earned-title")).text("".concat(formatNumber(v)," ANN")),A.find("#pair-".concat(c,"-earned-desc")).empty(),!q[t.pair]||q[t.pair]&&!q[t.pair].reward?(A.find("#pair-".concat(c,"-earned-desc")).text("".concat(p)),A.find("#pair-".concat(c,"-earned-desc")).removeClass("earn-descr").addClass("descr")):(A.find("#pair-".concat(c,"-earned-desc")).removeClass("descr").addClass("earn-descr"),A.find("#pair-".concat(c,"-earned-desc")).append('\n            <a class="btn btn-lbiege btn-harvest-now" href="#" data-id="'.concat(t.id,'">').concat(p,"</a>\n          "))),A.find("#pair-".concat(c,"-actions")).empty(),A.find("#pair-".concat(c,"-actions")).append("\n          ".concat(f,'\n          <div class="farm-list-items-item-actions__wrapper-buttons">\n            ').concat(b,"\n            ").concat(y,"\n          </div>\n        "))):(P="",P=!q[t.pair]||q[t.pair]&&!q[t.pair].reward?'\n            <div id="pair-'.concat(c,'-earned-desc" class="descr">\n              ').concat(p,"\n            </div>\n          "):'\n            <div id="pair-'.concat(c,'-earned-desc" class="earn-descr">\n              <a class="btn btn-lbiege btn-harvest-now" href="#" data-id="').concat(t.id,'">').concat(p,"</a>\n            </div>\n          "),'<td id="pair-'.concat(c,'-actions" class="td-btns"></td>'),window.variables.NETWORK&&'<td id="pair-'.concat(c,'-actions" class="td-btns">\n            ').concat(f,"\n            ").concat(b,"\n            ").concat(y,"\n          </td>"),_=(null===(w=T.find(function(e){return toChecksumAddress(e.address)===toChecksumAddress(t.liquidityPair.token0.id)}))||void 0===w?void 0:w.logoURI)||"images/defaultAsset.svg",k=(null===(g=T.find(function(e){return toChecksumAddress(e.address)===toChecksumAddress(t.liquidityPair.token1.id)}))||void 0===g?void 0:g.logoURI)||"",h='<img src="'.concat(_,'" alt="').concat(t.liquidityPair.token0.symbol,'">'),S=k?'<img src="'.concat(k,'" alt="').concat(t.liquidityPair.token1.symbol,'">'):"",$("#loading").hide(),$("#no-pools").hide(),$(".farm-list-items").append('\n          <div class="farm-list-items-item" id="pair-'.concat(c,'">\n            <div class="farm-list-items-item-title">\n              <div class="farm-list-items-item-title__icons">\n                <div class="first-icon">\n                  ').concat(h,'\n                </div>\n                <div class="second-icon">\n                  ').concat(S,'\n                </div>\n              </div>\n              <div class="farm-list-items-item-title__text">\n                <p>').concat(r,'</p>\n                <div class="descr">').concat(o,'</div>\n              </div>\n            </div>\n            <div class="farm-list-items-item-content">\n              <div class="farm-list-items-item-content__cell">Yield (per $1,000) : </div>\n              <div class="farm-list-items-item-content__cell">\n                <div class="cell-yield__icon">\n                  <img src="images/ann.svg" alt="ANN">\n                </div>\n                <div class="cell-yield__text">\n                  <p>').concat(formatNumber(t.rewardPerThousand,2),' ANN/Day</p>\n                  <div class="descr">').concat(t.allocPoint,' allocPoint</div>\n                </div>\n              </div>\n              <div class="farm-list-items-item-content__cell">\n                <div>\n                  <div class="cell-apy-title">APY</div>\n                  <div class="cell-apy"><span>⬆</span> ').concat(formatNumber(100*t.roiPerYear,2),'%</div>\n                </div>\n              </div>\n              <div class="farm-list-items-item-content__cell">\n                <div class="farm-list-items-item-content__cell-wrapper-right">\n                  <div class="cell-apy-title">Liquidity</div>\n                  <div class="cell-apy">\n                    ').concat(formatNumber(t.liquidityPair.reserveUSD,2,"en","currency","USD"),'\n                  </div>\n                </div>\n              </div>\n              <div class="farm-list-items-item-content__cell">\n                <div>\n                  <div class="cell-apy-title">Staked</div>\n                  <p class="cell-apy" id="pair-').concat(c,'-staked-amount">\n                    ').concat(formatNumber(l,2,"en","currency","USD"),'\n                  </p>\n                </div>\n              </div>\n              <div class="farm-list-items-item-content__cell">\n                <div class="farm-list-items-item-content__cell-wrapper-right">\n                  <div class="staked-assets" id="pair-').concat(c,'-staked-desc">\n                    ').concat(N,'\n                  </div>\n                </div>\n              </div>\n              <div class="farm-list-items-item-content__cell">Earned</div>\n              <div class="farm-list-items-item-content__cell">\n                <div class="cell-earned__icon">\n                  <img src="images/ann.svg" alt="ANN">\n                </div>\n                <div class="cell-earned__text">\n                  <p id="pair-').concat(c,'-earned-title">').concat(formatNumber(v)," ANN</p>\n                  ").concat(P,'\n                </div>\n              </div>\n            </div>\n            <div class="farm-list-items-item-actions">\n              <div class="farm-list-items-item-actions__wrapper" id="pair-').concat(c,'-actions">\n                ').concat(f,'\n                <div class="farm-list-items-item-actions__wrapper-buttons">\n                  ').concat(b,"\n                  ").concat(y,"\n                </div>\n              </div>\n            </div>\n          </div>\n        ")))}):($("#loading").hide(),$("#no-pools").show())}function harvestNow(e,t){runHarvest([e,t],function(e,t){t&&console.log(t)})}function approveStaking(e,t){runApproveStaking(e,t,function(e,t){t&&console.log(t)})}function onStake(e){var t=$(document.forms.stake),i=t.find("input#available_amount").val(),a=t.find("a.js-input-max-balance").attr("data-value"),n=t.find("#current_stake_type").val(),r=t.find("#current_pool_id").val(),o=t.find("#current_pool_pair_name").val();0<i&&i<=a&&r&&n&&runStake(r,i,o,n,function(e,t){t&&console.log(t)})}function onStakeMaxAmount(e){var t=$(document.forms.stake);t.find("input#available_amount").val(new BigNumber(t.find("a.js-input-max-balance").attr("data-value")).dp(18,1).toString(10))}function onStakeInput(e){var t=$(document.forms.stake),i=t.find("a.js-input-max-balance").attr("data-value");e.target.value>i?$(t).find(".js-confirm-btn").prop("disabled",!0):$(t).find(".js-confirm-btn").prop("disabled",!1)}function isNumber(e){return"number"==typeof e&&isFinite(e)}function onSearch(e){searchKeyward=e,console.log(searchKeyward),searchData()}function searchData(){pairList=window.variables.farm.POOLS.filter(function(e){var t=new RegExp(searchKeyward,"i");return!!(0<=e.liquidityPair.token0.name.search(t)||0<=e.liquidityPair.token0.symbol.search(t)||e.liquidityPair.token1.name&&0<=e.liquidityPair.token1.name.search(t)||e.liquidityPair.token1.symbol&&0<=e.liquidityPair.token1.symbol.search(t))}),sortData()}function onSort(e){sortField=e,sortData()}function sortData(){var n=window.variables.farm.USERS||[],m=window.variables.farm.ALLOWANCES||[];pairList=pairList.map(function(t){var e,i=n.find(function(e){return e.pool.id===t.id}),a=i?new BigNumber(i.amount).div(1e18).div(null===(e=t.liquidityPair)||void 0===e?void 0:e.totalSupply):new BigNumber(0);return _objectSpread(_objectSpread({},t),{},{user:_objectSpread(_objectSpread({},i),{},{userPercent:a})})}).sort(function(e,t){var i,a,n,r;switch(sortField){case"apy":return"asc"===sortDirection?e.roiPerYear-t.roiPerYear:t.roiPerYear-e.roiPerYear;case"liquidity":var o=new BigNumber(null===(i=e.liquidityPair)||void 0===i?void 0:i.reserveUSD),c=new BigNumber(null===(a=t.liquidityPair)||void 0===a?void 0:a.reserveUSD);return"asc"===sortDirection?o.minus(c).toNumber():c.minus(o).toNumber();case"staked":var s=e.user.userPercent.times(null===(n=e.liquidityPair)||void 0===n?void 0:n.reserveUSD),d=t.user.userPercent.times(null===(r=t.liquidityPair)||void 0===r?void 0:r.reserveUSD);return"asc"===sortDirection?s.minus(d).toNumber():d.minus(s).toNumber();case"earned":var l=m[e.pair]&&m[e.pair].reward?new BigNumber(m[e.pair].reward):new BigNumber(0),u=m[t.pair]&&m[t.pair].reward?new BigNumber(m[t.pair].reward):new BigNumber(0);return"asc"===sortDirection?l.minus(u).toNumber():u.minus(l).toNumber();case"allocpoint":return"asc"===sortDirection?e.allocPoint-t.allocPoint:t.allocPoint-e.allocPoint}}),$(".farm-list-items-item").remove(),farmTableRender()}window.onload=function(){console.log("onLoad!"),window.events.initHook=initHook,window.triggers.onLoad=[].concat(_toConsumableArray(window.triggers.onLoad||[]),["initHook"]),window.variables.farm={},window.triggers.networkChanged=[].concat(_toConsumableArray(window.triggers.networkChanged||[]),["onNetworkChanged"]),window.events.initFarm=initFarm,window.triggers.selectAccount=[].concat(_toConsumableArray(window.triggers.selectAccount||[]),["initFarm"]),window.events.onNetworkChanged=onNetworkChanged,window.events.onStakeMaxAmount=onStakeMaxAmount,window.events.onStakeInput=onStakeInput,window.events.onStake=onStake,$(document).on("click",".btn-harvest-now",function(e){e.preventDefault(),harvestNow($(this).attr("data-id"),$(this).closest(".cell-earned__text").find("p").text())}),$(document).on("click",".btn-approve-staking",function(e){e.preventDefault(),approveStaking($(this).attr("data-address"),$(this).attr("data-name"))}),$(document).on("change","#farm-sort",function(e){e.preventDefault(),"apy"===e.target.value?onSort("apy"):"allocpoint"===e.target.value?onSort("allocpoint"):"earned"===e.target.value?onSort("earned"):onSort("liquidity")}),$(document).on("change","#farm-search",function(e){e.preventDefault(),console.log(e.target.value),onSearch(e.target.value)}),window.variables.NETWORK||initFarm()};