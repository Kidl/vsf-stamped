import * as types from './mutation-types'
import Vue from 'vue'
import { StampedPageData, StampedProductRating } from '../types/StampedState'

interface ProductRating {
  productId: number;
  rating: StampedProductRating;
}

export const mutations = {
  // [types.SET_CURRENT_PRODUCT_REVIEWS_PAGE_DATA] (state, pageData: StampedPageData) {
  //   Vue.set(state, 'currentProductReviewsPageData', pageData)
  // },

  [types.SET_CURRENT_PRODUCT_REVIEWS] (state, reviews) {
    Vue.set(state, 'currentProductReviews', reviews)
  },

  // [types.ADD_MORE_PRODUCT_REVIEWS] (state, reviews: Array<any>) {
  //   if (!state.currentProductReviews || !Array.isArray(state.currentProductReviews)) {
  //     Vue.set(state, 'currentProductReviews', [])
  //   }
  //   state.currentProductReviews.push(...reviews)
  // },

  [types.SET_PRODUCT_RATING] (state, { productId, rating }: ProductRating) {
    Vue.set(state.productsRating, productId+'', rating)
  }
}