import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { module } from './store'

export const StampedModule: StorefrontModule = function ({ store }) {
  store.registerModule('vsf-stamped', module)
}