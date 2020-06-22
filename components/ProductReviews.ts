export default (productId: string) => ({

  data () {
    return {
      loadingReviews: false
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
      this.loadingReviews = true;
      await this.$store.dispatch('vsf-stamped/loadReview', {
        productId: this[productId]
      })
      this.loadingReviews = false;
    }

  },

  async serverPrefetch () {
    await this.fetchReviews();
  },

  async beforeMount () {
    await this.fetchReviews();
  }

})