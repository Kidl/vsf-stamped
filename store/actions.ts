import { StampedState } from '../types/StampedState'
import { ActionTree } from 'vuex'
import config from 'config'
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore'
import fetch from 'isomorphic-fetch'

const stampedMultiStoreConfig = (config, storeCode = null) => {
  if (!config.extensions.stamped) {
    console.log('Stamped extension not configured')
    return
  }

  const stampedConfig = config.extensions.stamped
  let currentConfig = {}

  // Find base
  const requiredKeys = [
    'storeHash',
    'publicKey',
    'privateKey'
  ]

  for (let key of requiredKeys) {
    if (stampedConfig[key]) {
      currentConfig[key] = stampedConfig[key]
    }
  }

  // Overwrite from storeCode
  if (storeCode) {
    if (stampedConfig.storeCode && stampedConfig.storeCode[storeCode]) {
      currentConfig = {
        ...currentConfig,
        ...stampedConfig.storeCode[storeCode]
      }
    }
  }

  for (let key of requiredKeys) {
    if (!currentConfig[key]) {
      console.log('Stamped extension badly configured')
      return
    }
  }

  return currentConfig
}

export const actions: ActionTree<StampedState, any> = {

  

}
