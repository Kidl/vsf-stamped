import { StampedProductRating } from './../types/StampedState';
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

  async addReview ({}): Promise<Boolean> {
    // 1. Send request to Stamped Api
    // 2. Return status
    return true
  },

  async loadReview ({}, { page = 1 }): Promise<any> {
    // 1. Send request to VSF Api
    // 2. Set it in state
    // 3. Add support for page values like `next` & `previous`
    // 4. Return status
    return true
  },

  async getRatings ({}, {}): Promise<StampedProductRating> {

    // 1. Send request to Stamped Api
    // 2. Set it in state
    // 3. Return it

    return {
      "productId": "1",
      "rating": 4.5,
      "count": 2,
      "countQuestions": 0
    }
  }

}
