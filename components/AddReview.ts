import { required } from 'vuelidate/lib/validators'
export default (productKey: string, namespace: string = 'review') => ({

  validations: {
    [namespace]: {
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
    }
  },

  data () {
    return {
      [namespace]: {
        author: '',
        email: '',
        title: '',
        rating: 5,
        message: '',
        recommendProduct: true,
        sent: false,
        isSending: false
      }
    }
  },

  methods: {
    async addReview () {
      this[namespace].isSending = true
      this[namespace].sent = await this.$store.dispatch('vsf-stamped/addReview', {
        review: {
          author: this[namespace].author,
          email: this[namespace].email,
          rating: this[namespace].rating,
          title: this[namespace].title,
          message: this[namespace].message,
          recommendProduct: this[namespace].recommendProduct
        },
        product: this[productKey],
        productUrl: window.location.href
      })
      this[namespace].isSending = false
    }
  }

})