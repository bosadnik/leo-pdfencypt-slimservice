const express = require('express');
const fs = require('fs');
const router = express.Router();
const keyPairGenerator = require('../modules/key-pair-generator');
const db = require('../modules/db');
const multer  = require('multer')
const NodeRSA = require('node-rsa');

const API_VERSION = '1.0.1';

router.get('/', (req, res) => {
    res.status(200).send({
        apiVersion: API_VERSION

    });
})


router.post('/generate-key-pair', (req, res) => {
    try{
        const keys = keyPairGenerator();
     // FIXME chenge to correct @savePublicKey method   
     // db.savePublicKey(req.user.id, keys.publicKey);
        db.saveUserKeys(req.user.id, keys);
        res.status(200).send({
            "privKey": keys.privateKey,
            "pubKey": keys.publicKey
        });
    } catch(e) {
        res.status(500).send("keys generation errror ...");
    }
    
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname)
    },
  })
  
const uploadStorage = multer({ storage: storage })

const encrypt = (content, pubKey) => {
    var key = new NodeRSA();
    key.importKey(pubKey,"pkcs8-public-pem");
    return key.encrypt(content, 'base64');

}

const decrypt = (content, privKey) => {
    var key = new NodeRSA();
    key.importKey(privKey,"pkcs8-private-pem");
    return key.decrypt(content, 'utf8');

}


router.post('/encrypt',  uploadStorage.single("file"), async (req, res) => {
    let pubKey = await db.getPublicKey(req.user.id);
    if(!pubKey){
        return res.status(400).send("No public key yet generated. Use /api/generate-key-pair first!")    
    } else {
        let filecontent = fs.readFileSync(req.file.path);
        let encryptedContent = encrypt(filecontent, pubKey);
        
        res.contentType("application/pdf");
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=encrypted_${req.file.originalname}`);
        return res.send(encryptedContent);
    }
});

// FIXME remove that enpoint  /encrypt-decrypt
// ONLY for test purposes... don't try it on prod;)
router.post('/encrypt-decrypt',  uploadStorage.single("file"), async (req, res) => {
    
        let keys = await db.getUserKeys(req.user.id);
        if(!keys){
            return res.status(400).send("No keys yet generated. Use /api/generate-key-pair first!")    
        } else {
            let filecontent = fs.readFileSync(req.file.path);
            let encryptedContent = encrypt(filecontent, keys.publicKey);
       
            let decryptedContent = decrypt(encryptedContent, keys.privateKey);
            
            res.contentType("application/pdf");
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=decrypted_${req.file.originalname}`);
            return res.send(decryptedContent);
        }
     
    });
    
    



module.exports = router;