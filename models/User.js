const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  customUrl: {
    type: String,
    required: true
  },
  twitter: {
    type: String
  },
  portfolio: {
    type: String
  },
  email: {
    type: String
  },
  publicKey: {
    type: String,
    required: true
  },
  file_path: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model("users", UserSchema);
