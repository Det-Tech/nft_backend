const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CollectibleSchema = new Schema({
    name: {
      type: String,
      required: true
      },
    description: {
      type: String,
      required: true
      },
    price: {
      type: String,
      required: true
      },
    royalty: {
      type: String,
      required: true
    },
    propertySize: {
      type: String,
      required: true
    },
    propertyM: {
      type: String
     
    },
    tokenHash: {
      type: String,
      required: true
    },
    tokenID: {
      type: String
     
    },
    creatorPubKey:{
      type: String
    },
    ownerPubKey:{
      type: String
    },
    file_path: {
      type: String
    },
    onSale: {
      type: Boolean,
      default: false
    }
  });
  
  module.exports = Collectible = mongoose.model("collectible", CollectibleSchema);