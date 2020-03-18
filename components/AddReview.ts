import { required } from 'vuelidate/lib/validators'
export default (product: string) => ({

  validations: {
    author: {
      required
    },
    email: {
      required
    },
    title: {
      required
    },
    message: {
      required
    }
  },

  data () {
    return {
      author: '',
      email: '',
      title: '',
      rating: 5,
      message: '',
      recommendProduct: false,
      sent: false,
      isSending: false
    }
  },

  methods: {
    async addReview () {
      this.isSending = true
      this.sent = await this.$store.dispatch('vsf-stamped/addReview', {
        review: {
          author: this.author,
          email: this.email,
          rating: this.rating,
          title: this.title,
          message: this.message,
          recommendProduct: this.recommendProduct
        },
        product: this[product],
        productUrl: window.location.href
      })
      this.isSending = false
    }
  }

})