export default (productId: string) => ({

  data () {
    return {
      loader: false
    }
  },

  watch: {
    async [productId]() {
      await this.fetchReviews()
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
      this.loader = true;
      await this.$store.dispatch('vsf-stamped/loadReview', {
        productId: this[productId]
      })
      this.loader = false;
    }

  },

  async serverPrefetch () {
    await this.fetchReviews();
  },

  async beforeMount () {
    // if (!this.productReviews || !this.productReviews.length) {
    await this.fetchReviews();
    // }
  }

})