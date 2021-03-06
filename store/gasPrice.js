/* eslint-disable no-console */
import { GasPriceOracle } from 'gas-price-oracle'
import networkConfig from '@/networkConfig'
const { toHex, toWei } = require('web3-utils')

export const state = () => {
  return {
    instant: networkConfig.netId1.gasPrices.instant,
    fast: networkConfig.netId1.gasPrices.fast,
    standard: networkConfig.netId1.gasPrices.standard,
    low: networkConfig.netId1.gasPrices.low,
    custom: null,
  }
}

export const getters = {
  oracle: (state, getters, rootState, rootGetters) => {
    const currentRpc = rootGetters['provider/getNetwork'].rpcUrls.Infura.url
    console.log('currentRpc', currentRpc)
    return new GasPriceOracle({ defaultRpc: currentRpc })
  },
  fastGasPrice: (state) => {
    return toHex(toWei(state.fast.toString(), 'gwei'))
  },
  lowGasPrice: (state) => {
    return toHex(toWei(state.standard.toString(), 'gwei'))
  },
}

export const mutations = {
  SAVE_GAS_PRICES(state, { instant, fast, standard, low }) {
    this._vm.$set(state, 'instant', instant)
    this._vm.$set(state, 'fast', fast)
    this._vm.$set(state, 'standard', standard)
    this._vm.$set(state, 'low', low)
  },
  SAVE_CUSTOM_GAS_PRICE(state, { custom }) {
    this._vm.$set(state, 'custom', custom)
  },
}

export const actions = {
  async fetchGasPrice({ getters, commit, dispatch, rootGetters, state }) {
    const { pollInterval } = rootGetters['provider/getNetwork']
    try {
      const gas = await getters.oracle.gasPrices(state)
      commit('SAVE_GAS_PRICES', gas)
      console.log(`Got fast gas price ${state.fast}`)
      setTimeout(() => dispatch('fetchGasPrice'), 1000 * pollInterval)
    } catch (e) {
      console.error('fetchGasPrice', e)
      setTimeout(() => dispatch('fetchGasPrice'), 1000 * pollInterval)
    }
  },
}
