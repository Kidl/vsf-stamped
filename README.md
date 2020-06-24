# Vue Storefront Stamped.io module
## Features
- Adding reviews for product
- Loading reviews of product
- Loading product's ratings
- Works with SSR

## Configuration
### PWA
```json
"stamped": {
  "storeHash": "000000",
  "publicKey": "pubkey-DFJASDJASKLDJASLKDJK",
  "products": {
    "configurable": {
      "useSimpleSku": false
    }
  }
}
```

If you want to override `storeHash` or `publicKey` for different store, do it like that:
```json
"stamped": {
  "storeHash": "000000",
  "publicKey": "pubkey-DFJASDJASKLDJASLKDJK",
  "storeCode": {
    "es": {
      "storeHash": "000001",
      "publicKey": "pubkey-DFJASDJASKLDJASLKDJK"
    }
  }
}
```

Where `es` is one of storecodes.

## Mixins
I've prepared 3 mixins which take care of logical operations. Use them and think only about creating your own cool User Interface.

### AddReview.ts
It is function that returns Vue.js mixin.   
Signature:
```ts
(productKey: string, namespace: string = 'review'): VueMixin
```
productKey - key in component's `this` which contains product. If you have product accessible via `this.product` then `productKey` should equal `product`.
namespace - mixin adds data & Vuelidate validators for `adding a review process`. They will be inside object with key equals value of `namespace`. So if `namespace = 'myReviewData' then function will return:
```js
export default {
  validations: {
    // Pasted here!
    myReviewData: {
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
      // Pasted here!
      myReviewData: {
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
      this.myReviewData.isSending = true
      this.myReviewData.sent = await this.$store.dispatch('vsf-stamped/addReview', {
        review: {
          author: this.myReviewData.author,
          email: this.myReviewData.email,
          rating: this.myReviewData.rating,
          title: this.myReviewData.title,
          message: this.myReviewData.message,
          recommendProduct: this.myReviewData.recommendProduct
        },
        product: this.product, // Here we have value of `productKey` - the first argument
        productUrl: window.location.href
      })
      this.myReviewData.isSending = false
    }
  }

}
```

### ProductRatings.ts
It is function that returns Vue.js mixin. Mixin will watch product's id then fetch ratings for it from stamped.
Signature:
```ts
(productId: string): VueMixin
```
productId - key in component's `this` which contains product's ID that will be used in the Stamped.io. I recommend to create computed that returns `product.id`. It must be an number casted to a string. Stamped won't accept letters. Function will return:
```js
export default {
  
  watch: {
    async productId() {
      await this.fetchProductRatings()
    }
  },

  computed: {
    productRatings () {
      let currentProductId = this.productId
      let productRatings = this.$store.state['vsf-stamped'] && this.$store.state['vsf-stamped'].productsRating

      if (currentProductId) {
        let currentRating = productRatings && productRatings[currentProductId+'']
        if (currentRating) {
          return currentRating
        } else {
          return {
            mocked: true,
            count: 0,
            rating: 0
          }
        }
      }
        
      return {
        mocked: true,
        count: 0,
        rating: 0
      }
    }
  },

  methods: {

    async fetchProductRatings () {
      await this.$store.dispatch('vsf-stamped/getRatings', {
        productId: this.productId
      })
    }

  },

  async serverPrefetch () {
    await this.fetchProductRatings();
  },

  async beforeMount () {
    await this.fetchProductRatings();
  }

}
```

### ProductReviews.ts
It is function that returns Vue.js mixin. Mixin will watch product's id then fetch **reviews** for it from stamped.
Signature:
```ts
(productId: string): VueMixin
```
productId - key in component's `this` which contains product's ID that will be used in the Stamped.io. I recommend to create computed that returns `product.id`. It must be an number casted to a string. Stamped won't accept letters. Function will return:
```js
export default {

  data () {
    return {
      loadingReviews: false
    }
  },

  watch: {
    async productId() {
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
        productId: this.productId
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

}
```

I had problems with pagination even with Postman. If someone managed to add support for this in the third mixin or `loadReview` action - feel free to make a Pull Request.
