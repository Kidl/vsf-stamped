import { StampedModule } from 'src/modules/vsf-stamped'
import { registerModule } from '@vue-storefront/core/lib/modules'

export default (productId: string) => ({

  beforeCreate () {
    registerModule(StampedModule)
  },

  watch: {
    async [productId]() {
      await this.fetchProductReviews()
    }
  },

  computed: {
    productReviews () {
      return this.$store.state['vsf-stamped'] && this.$store.state['vsf-stamped'].currentProductReviews
        ? this.$store.state['vsf-stamped'].currentProductReviews
        : []
    }
  },

  methods: {

    async fetchReviews () {
      await this.$store.dispatch('vsf-stamped/loadReview', {
        productId: this[productId]
      })
    }

  },

  async serverPrefetch () {
    await this.fetchReviews();
  },

  async beforeMount () {
    if (!this.productReviews || !this.productReviews.length) {
      await this.fetchReviews();
    }
  }

})