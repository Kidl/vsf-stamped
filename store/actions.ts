import { getThumbnailPath } from '@vue-storefront/core/helpers';
// import { StampedProductRating } from './../types/StampedState';
import { StampedState } from '../types/StampedState'
import { ActionTree } from 'vuex'
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import fetch from 'isomorphic-fetch'
import * as types from './mutation-types'

// interface StampedAddReviewPayload {
//   productId: number;
//   author: string;
//   email: string;
//   location: string;
//   reviewRating: number;
//   reviewTitle: string;
//   reviewMessage: string;
//   reviewRecommendProduct: boolean;
//   productName: string;
//   productSKU: string;
//   productImageURL: string;
//   productURL: string;
//   reviewSource: string;
// }
interface StampedStoreConfig {
  publicKey: string,
  storeHash: string,
  products?: {
    configurable?: {
      useSimpleSku: Boolean
    }
  }
}
interface StampedConfig extends StampedStoreConfig{
  storeCode?: {
    [key: string]: StampedStoreConfig
  }
}

const stampedMultiStoreConfig = (config, storeCode = null): StampedStoreConfig | undefined  => {
  if (!config.stamped) {
    console.log('Stamped extension not configured')
    return
  }

  const stampedConfig = config.stamped
  let currentConfig = {}

  // Find base
  const requiredKeys = [
    'storeHash',
    'publicKey',
    'products'
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
    // products is not required
    if (key == 'products') {
      continue
    }
    if (!currentConfig[key]) {
      console.log('Stamped extension badly configured')
      return
    }
  }

  return (<StampedStoreConfig>currentConfig)
}

interface StampedReview {
  author: string;
  email: string;
  rating: number;
  title: string;
  message: string;
  recommendProduct: boolean;
}

const preparePayload = (product, review: StampedReview, productUrl: string, useSimpleSku: Boolean): URLSearchParams => {
  const { i18n, storeCode } = currentStoreView()
  const data = new URLSearchParams()

  let image = product.image
  if (!image && product.configurable_children) {
    const child = product.configurable_children.find(child => child.sku == product.sku)
    if (child && child.image) {
      image = child.image
    }
  }
  let childName = product.name
  let childId = product.id
  if (product.type_id == 'configurable') {
    const child = product.configurable_children.find(child => child.sku == product.sku)
    if (child) {
      if (child.name) {
        childName = child.name
      }
      if (child.id) {
        childId = child.id
      }
    }
  }
  image = getThumbnailPath(image, 300, 300)

  data.append('productId', useSimpleSku ? childId : product.id)
  data.append('author', review.author)
  data.append('email', review.email)
  data.append('location', i18n.fullCountryName)
  data.append('reviewRating', review.rating + '')
  data.append('reviewTitle', review.title)
  data.append('reviewMessage', review.message)
  data.append('reviewRecommendProduct', review.recommendProduct + '')
  data.append('productName', useSimpleSku && product.type_id == 'configurable' ? childName : product.name)
  data.append('productSKU', !useSimpleSku && product.parentSku ? product.parentSku : product.sku)
  data.append('productImageURL', image)
  data.append('productURL', productUrl)
  data.append('reviewSource', 'pwa')

  return data
}

export const actions: ActionTree<StampedState, any> = {

  async addReview ({}, { product, review, productUrl }): Promise<Boolean> {
    const { storeCode } = currentStoreView()
    const stampedConfig: StampedConfig | undefined = stampedMultiStoreConfig(config, !!storeCode ? storeCode : null)
    if (!stampedConfig) {
      console.error('[StampedIO] Bad config')
      return
    }
    const placeholderUrl = `https://stamped.io/api/reviews2?apiKey=${stampedConfig.publicKey}&sId=${stampedConfig.storeHash}`
    const useSimpleSku = stampedConfig.products && stampedConfig.products.configurable && stampedConfig.products.configurable.useSimpleSku
    const body = preparePayload(product, review, productUrl, useSimpleSku)
    try {
      await fetch(placeholderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body,
        redirect: 'follow'
      })
      return true
    } catch (err) {
      console.error('[StampedIO] ', err)
      return false
    }
  },

  async loadReview ({ commit }, { productId }): Promise<Boolean> {
    const { storeCode } = currentStoreView()
    const stampedConfig: StampedConfig | undefined = stampedMultiStoreConfig(config, !!storeCode ? storeCode : null)
    if (!stampedConfig) {
      console.error('[StampedIO] Bad config')
      return
    }
    const placeholderUrl = `https://stamped.io/api/widget/reviews?productIds=${productId}&productType&email&isWithPhotos&minRating&take&page&dateFrom&dateTo&sortReviews&tags&storeUrl=${stampedConfig.storeHash}&apiKey=${stampedConfig.publicKey}`
    try {
      const { data } = await (await fetch(placeholderUrl)).json()
      commit(types.SET_CURRENT_PRODUCT_REVIEWS, data)
      return true
    } catch (err) {
      console.error('[StampedIO] ', err)
      return false
    }
  },

  async getRatings ({ commit }, { productId }): Promise<Boolean> {

    const { storeCode } = currentStoreView()
    const stampedConfig: StampedConfig | undefined = stampedMultiStoreConfig(config, !!storeCode ? storeCode : null)
    if (!stampedConfig) {
      console.error('[StampedIO] Bad config')
      return
    }
    const placeholderUrl = 'http://stamped.io/api/widget/badges'
    try {
      const [ rating, ] = await (await fetch(placeholderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIds: [
            {
              productId
            }
          ],
          apiKey: stampedConfig.publicKey,
          storeUrl: stampedConfig.storeHash
        })
      })).json()

      commit(types.SET_PRODUCT_RATING, { rating: {
        rating: rating.rating,
        count: rating.count
      }, productId })
      return true
    } catch (err) {
      console.error('[StampedIO] ', err)
      return false
    }
  }

}
