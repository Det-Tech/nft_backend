const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const multer = require('multer');
const fs = require("fs");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");

// @route POST api/users/register
// @desc Register user
// @access Public


router.post('/update-profile',multer({ dest: 'uploads' }).any(), async (req,res) => {
      if(req.files.length!=0){
        var originalname = req.files[0].originalname;
        var originalname = originalname.split('.');
        var new_path = 'uploads/avatars/' + req.body.customUrl + '.' + originalname[originalname.length-1];
        var old_path = req.files[0].path;
        var save_path =  req.body.customUrl + '.' + originalname[originalname.length-1];
        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
              fs.unlink('uploads/' + req.files[0].filename, async err => {
                    if(!err){}
                    else{
                      console.log(err)
                    }
                })
              })
            })
          }
      User.findOneAndUpdate({publicKey:req.body.publicKey},{name: req.body.name, bio: req.body.bio, customUrl: req.body.customUrl, twitter: req.body.twitter, portfolio: req.body.portfolio, email: req.body.email, file_path: save_path})
      .then(exist=>{
        if(exist){
         res.json(exist)
        }
        else{
            if(req.files){
            var originalname = req.files[0].originalname;
            var originalname = originalname.split('.');
            var new_path = 'uploads/avatars/' + req.body.customUrl + '.' + originalname[originalname.length-1];
            var old_path = req.files[0].path;
            var save_path =  req.body.customUrl + '.' + originalname[originalname.length-1];
            fs.readFile(old_path, function(err, data) {
                fs.writeFile(new_path, data, function(err) {
                  fs.unlink('uploads/' + req.files[0].filename, async err => {
                        if(!err){}
                        else{
                          console.log(err)
                        }
                    })
                  })
                })
              }
                    console.log("it is ", req.body.publicKey)
                    const { name, bio,customUrl, twitter, portfolio, email, publicKey} = req.body;
                    const userInfo = new User({
                        name,
                        bio,
                        customUrl,
                        twitter,
                        portfolio,
                        email,
                        publicKey,
                        file_path: save_path
                    });
                    
                      userInfo.save().then((rdata) => {
                            res.json(rdata);
                        });
              }
    })
})

router.post("/valid-custom-url", (req, res) => {
  User.findOne({customUrl: req.body.customUrl})
  .then((value)=>{
    if(value){
      if(value.publicKey==req.body.publicKey){
        res.json(value);
      }
      else{
        res.json({status: "exist"});
      }
    }
    else{
      res.json(200);
    }
  })
})

router.post("/get-my-profile", (req, res)=>{
  User.findOne({publicKey: req.body.publicKey})
  .then((check)=>{
    if(check){
      res.json(check);
    }
    else{
      res.json("error");
    }
  })
})

router.post("/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;
