# Vue Storefront Stamped.io module
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
  "publicKey": "pubkey-DFJASDJASKLDJASLKDJK"
  "storeCode": {
    "es": {
      "storeHash": "000001",
      "publicKey": "pubkey-DFJASDJASKLDJASLKDJK"
    }
  }
}
```