import * as types from './mutation-types'
import Vue from 'vue'
import { StampedProductRating } from '../types/StampedState'

interface ProductRating {
  productId: number;
  rating: StampedProductRating;
}

export const mutations = {

  [types.SET_CURRENT_PRODUCT_REVIEWS] (state, reviews) {
    Vue.set(state, 'currentProductReviews', reviews)
  },

  [types.SET_PRODUCT_RATING] (state, { productId, rating }: ProductRating) {
    Vue.set(state.productsRating, productId+'', rating)
  }

}