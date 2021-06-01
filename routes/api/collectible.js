let mongoose = require('mongoose');
let express = require('express');
const multer = require('multer');
let router = express.Router();
const fs = require("fs");
const Web3 = require("web3");
let CollectibleSchema = require('../../models/collectible');
const Axios  = require('axios');

var web3 = new Web3();
var tokenAddress = "0xe56F12123c583De823720A603b2DC11D659C12fC";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
}
let random = between(1,900000000)



router.post('/create-single-collectible',multer({ dest: 'uploads' }).any(), async (req,res) => {
    var temp_tokenID;
    var temp_hash;
    var temp_pubKey;
    if(req.files)
    {
        temp_hash = req.body.tokenHash;
        temp_pubKey = req.body.publicKey;

        var filename = between(1,900000000);
        var originalname = req.files[0].originalname;
        var originalname = originalname.split('.');
        var new_path = 'uploads/' + filename + '.' + originalname[originalname.length-1];
        var old_path = req.files[0].path;
        var save_path =  filename + '.' + originalname[originalname.length-1];
        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink('uploads/' + req.files[0].filename, async err => {
                    if(!err){
                        const { name, description,price, royalty, propertySize, propertyM,tokenHash, publicKey} = req.body;
                        const collectibleInfo = new CollectibleSchema({
                            name,
                            description,
                            price,
                            royalty,
                            propertySize,
                            propertyM,
                            tokenHash,
                            tokenID: temp_tokenID,
                            creatorPubKey: publicKey,
                            ownerPubKey: publicKey,
                            file_path: save_path
                        });
                        CollectibleSchema.findOne({name:req.body.name})
                            .then(check => {
                                collectibleInfo.save().then((rdata) => {
                                    res.json(rdata);
                                });
                            })
                        while(!temp_tokenID) {
                            await delay(1000)
                            Axios.get(`https://api.bscscan.com/api?module=account&action=tokennfttx&address=${temp_pubKey}&apikey=YACI5FBNF39PI3FD7ZVWRWFFCAH6RAVY7W`).then((response)=>{
                                console.log("temp_pubkey", temp_pubKey, temp_hash, );
                                response.data.result.map((token)=>{
                                    if(token.hash==temp_hash){
                                        temp_tokenID = token.tokenID;
                                        console.log("it is ",temp_tokenID);
                                        CollectibleSchema.findOneAndUpdate({tokenHash: temp_hash},{tokenID:temp_tokenID }, (error,data)=>{
                                            if(error){
                                                console.log(error)
                                            }
                                            else{
                                                console.log("let's go to smoking")
                                            }
                                        })
                                    }
                                })
                            })
                        }
                       
                       
                    }
                    else {
                        res.json({                                                                                                      
                            status : "error"
                        })
                    }
                })
            });
        });
    }
})



router.route('/get-all-collectibles').post((req,res, next) =>{
    CollectibleSchema.find((error,data)=>{
        if(error){
            return next(error)
        }
        else{
            res.json(data);
        }
    })
})

router.route('/set-collectible-on-sale').post((req,res)=>{
    console.log(req.body)
    CollectibleSchema.findOneAndUpdate({tokenID: req.body.tokenId},{onSale:true }, (error,data)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(data)
        }
    })
})

router.route('/get-one-collectible').post((req,res)=>{
    console.log(req.body)
    CollectibleSchema.findOne({tokenID: req.body.tokenId}, (error,data)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(data)
        }
    })
})

router.route('/get-my-item-collectibles').post((req,res)=>{
    console.log(req.body.myPubKey);
    var lowPubKey = req.body.myPubKey.toLowerCase();
    CollectibleSchema.find({ownerPubKey: lowPubKey, onSale: false},(error,data)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(data)
            console.log("wowo")
        }
    })
})

router.route('/buy-collectible').post((req,res)=>{
    
    CollectibleSchema.findOneAndUpdate({tokenID: req.body.tokenId},{ownerPubKey:req.body.owner, onSale: false }, (error,data)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(data)
            console.log("great")
        }
    })
})

module.exports = router;