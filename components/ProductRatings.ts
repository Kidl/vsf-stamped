import { StampedModule } from 'src/modules/vsf-stamped'
import { registerModule } from '@vue-storefront/core/lib/modules'

export default (productId: string) => ({

  beforeCreate () {
    registerModule(StampedModule)
  },
  
  watch: {
    async [productId]() {
      await this.fetchProductRatings()
    }
  },

  computed: {
    productRatings () {
      let currentProductId = this[productId]
      let productRatings = this.$store.state['vsf-stamped'] && this.$store.state['vsf-stamped'].productsRating

      if (currentProductId) {
        let currentRating = productRatings && productRatings[currentProductId+'']
        if (currentRating) {
          return currentRating
        } else {
          return {
            mocked: true,
            count: 0,
            rating: 5
          }
        }
      }
        
      return {
        mocked: true,
        count: 0,
        rating: 5
      }
    }
  },

  methods: {

    async fetchProductRatings () {
      await this.$store.dispatch('vsf-stamped/getRatings', {
        productId: this[productId]
      })
    }

  },

  async serverPrefetch () {
    await this.fetchProductRatings();
  },

  async beforeMount () {
    if (!this.productRatings || this.productRatings.mocked) {
      await this.fetchProductRatings();
    }
  }

})