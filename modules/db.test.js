/* eslint-disable no-undef */
const db = require('./db');
db.initDB();


const testUser = {
    name: 'Testowy',
    firstName: 'Janusz',
    username: 'janusz',
    password: 'letmein',
    email: 'janusz@testowy.pl'
}

db.addUser(testUser);

let userId = testUser.email;
let publicKey = "-----BEGIN PUBLIC KEY-----\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n-----END PUBLIC KEY-----\n";


test("test user to be present", async () => {
    let user = await db.getUser(userId);
    expect(user).toBeDefined();
    expect(user.email).toEqual(userId);
})



test("test public key save", async () => {
    await db.savePublicKey(userId, publicKey);
    let recPublicKey = await db.getPublicKey(userId);
    expect(recPublicKey).toEqual(publicKey);
})



test("test sucessfull verification", async () => {
    let user = await db.verifyUser(testUser.username, testUser.password);
    expect(user).toBeDefined();
})

test("test unsucessfull verification", async () => {
    let user = await db.verifyUser(testUser.username, 'WRONG-PASWORD');
    expect(user).toBeNull();
})

