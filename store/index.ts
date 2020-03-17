import { Module } from 'vuex'
import { StampedState } from '../types/StampedState'
import { actions } from './actions'
import { mutations } from './mutations'
import { state } from './state'

export const module: Module<StampedState, any> = {
  namespaced: true,
  actions,
  mutations,
  state
}
