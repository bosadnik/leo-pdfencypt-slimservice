const loki = require('lokijs');

var db = new loki('pdfencrypt.db');


const __getRandomCallDelay = () => {
    let getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    return getRandomInt(300, 800);
}

const initDB = () => {

    const users = db.addCollection('users', {
        indices: ['email']
    });

    users.insert({
        username: 'example',
        password: '1234',
        email: 'example@mail.com'
    });

    users.insert({
        username: 'second-example',
        password: '4321',
        email: 'second-example@mail.com'
    });



}

const sleep = async (milisecons) => {
    return new Promise((resolve) => {
        setTimeout(resolve, milisecons);
    })
}

const returnWithDelaySimulatingRealAsynch = async (value) => {

    await sleep(__getRandomCallDelay());
    return value;

}

const verifyUser = async (username, password) => {
    // there shold be password hasing algorithm here to not store open paswords in db ;)
    const users = db.getCollection('users');
    return await returnWithDelaySimulatingRealAsynch(users.findOne({
        username,
        password
    }));

}



const getUser = async (id) => {

    const users = db.getCollection('users');
    return await returnWithDelaySimulatingRealAsynch(users.findOne({
        email: id
    }));

}

const addUser = async (user) => {

    const users = db.getCollection('users');
    return await returnWithDelaySimulatingRealAsynch(
        users.insert(user));
}


const savePublicKey = async (id, publicKey) => {
    const users = db.getCollection('users');
    let user = users.findOne({
        email: id
    })
    user.publicKey = publicKey;
    users.update(user);
    return await returnWithDelaySimulatingRealAsynch(user);
}


const getPublicKey = async (id) => {
    const users = db.getCollection('users');
    let user = users.findOne({
        email: id
    })

    return await returnWithDelaySimulatingRealAsynch(user.publicKey);
}


/**
 * 
 * save both public and private is not secure!!! 
 * @saveUserKeys and @getUserKeys methods added only for test purposed 
 * and should be removed once ecripion correcness is checked
 * 
 **/
// FIXME remove saveUserKeys when done testing
const saveUserKeys = async (id, keys) => {
    const users = db.getCollection('users');
    let user = users.findOne({
        email: id
    })
    user = {
        ...user,
        ...keys
    }
    users.update(user);
    return await returnWithDelaySimulatingRealAsynch(user);
}

// FIXME remove saveUserKeys when done testing
const getUserKeys = async (id) => {
    const users = db.getCollection('users');
    let user = users.findOne({
        email: id
    })
    return await returnWithDelaySimulatingRealAsynch({
        privateKey: user.privateKey,
        publicKey: user.publicKey
    });
}




const getAllUsers = () => {
    const users = db.getCollection('users');
    let allusers = users.find();
    return allusers


}

module.exports = {
    initDB,
    getAllUsers,
    verifyUser,
    getUser,
    savePublicKey,
    getPublicKey,
    saveUserKeys,
    getUserKeys,
    addUser
}