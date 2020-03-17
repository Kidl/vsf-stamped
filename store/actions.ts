import { getThumbnailPath } from '@vue-storefront/core/helpers';
import { StampedProductRating } from './../types/StampedState';
import { StampedState } from '../types/StampedState'
import { ActionTree } from 'vuex'
import config from 'config'
import { adjustMultistoreApiUrl, currentStoreView } from '@vue-storefront/core/lib/multistore'
import fetch from 'isomorphic-fetch'

interface StampedAddReviewPayload {
  productId: number;
  author: string;
  email: string;
  location: string;
  reviewRating: number;
  reviewTitle: string;
  reviewMessage: string;
  reviewRecommendProduct: boolean;
  productName: string;
  productSKU: string;
  productImageURL: string;
  productURL: string;
  reviewSource: string;
}
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
    'publicKey'
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
  image = getThumbnailPath(image, 300, 300)

  data.append('productId', product.id)
  data.append('author', review.author)
  data.append('email', review.email)
  data.append('location', i18n.fullCountryName)
  data.append('reviewRating', review.rating + '')
  data.append('reviewTitle', review.title)
  data.append('reviewMessage', review.message)
  data.append('reviewRecommendProduct', review.recommendProduct + '')
  data.append('productName', product.name)
  data.append('productSKU', !useSimpleSku && product.parentSku ? product.parentSku : product.sku)
  data.append('productImageURL', image)
  data.append('productURL', productUrl)
  data.append('reviewSource', storeCode ? `pwa_${storeCode}` : 'pwa')

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
