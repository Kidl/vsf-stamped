import { apiStatus } from "../../../lib/util";
import { Router, } from "express";
import { multiStoreConfig } from '../../../platform/magento2/util'

const rp = require('request-promise-native')

const Magento2Client = require("magento2-rest-client").Magento2Client;

const stampedMultiStoreConfig = (config, res, storeCode = null) => {
  if (!config.extensions.stamped) {
    apiStatus(res, 'Stamped extension not configured', 500);
  }

  const stampedConfig = config.extensions.stamped
  let currentConfig = {}

  // Find base
  const requiredKeys = [
    'storeHash',
    'publicKey',
    'privateKey'
  ]

  for (let key of requiredKeys) {
    if (stampedConfig[key]) {
      currentConfig[key] = stampedConfig[key]
    }
  }

  // Overwrite from storeCode
  if (storeCode) {
    if (stampedConfig.storeCode && stampedConfig.storeCode[storeCode]) {
      currentConfig = {
        ...currentConfig,
        ...stampedConfig.storeCode[storeCode]
      }
    }
  }

  for (let key of requiredKeys) {
    if (!currentConfig[key]) {
      apiStatus(res, 'Stamped extension badly configured', 500)
      return
    }
  }

  return currentConfig

  // "stamped": {
  //   "storeHash": "000000",
  //   "publicKey": "pubkey-DFJASDJASKLDJASLKDJK",
  //   "privateKey": "key-SDKLADJKLASDKLASDJKLASLK",
  //   "storeCode": {
  //     "es": {
  //       "storeHash": "000001",
  //       "publicKey": "pubkey-DFJASDJASKLDJASLKDJK",
  //       "privateKey": "key-SDKLADJKLASDKLASDJKLASLK"
  //     }
  //   }
  // },
}

module.exports = ({ config, db }) => {
  let mcApi = Router();
  mcApi.get("/", (req, res) => {

    if (!req.query.productId) {
      apiStatus(res, 'productId not provided', 400)
    }

    const { productId } = req.query
    let page = req.query.page ? req.query.page : 1

    const storeCode = req.query.storeCode ? req.query.storeCode : null
    const localConfig = stampedMultiStoreConfig(config, res, storeCode)
    const endpointUrl = `http://s2.stamped.io/api/v2/${localConfig.storeHash}/dashboard/reviews/?productId=${productId}&page=${page}&search=&dateFrom&dateTo&rating=&state=`
    
    const token = new Buffer(`${localConfig.publicKey}:${localConfig.privateKey}`).toString('base64')

    rp({
      uri: endpointUrl,
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(response => {
      apiStatus(res, JSON.parse(response), 200)

      // Sample response
      // {
      //   "code": 200,
      //   "result": {
      //       "results": [],
      //       "total": 3,
      //       "page": 2,
      //       "totalPages": 1,
      //       "summary": {
      //           "unread": 1,
      //           "published": 2,
      //           "unpublished": 1,
      //           "archived": 0,
      //           "flagged": 0,
      //           "spam": 0
      //       }
      //   }
      // }

    }).catch(err => {
      console.log(err)
      apiStatus(res, 'Something went wrong: ' + err, 500)
    })

  });

  return mcApi;
};
