/* eslint-disable no-undef */
const keyPairGenerator = require('./key-pair-generator');

test('Expect to have public and private keys in reponse', () => {
  const {privateKey, publicKey} = keyPairGenerator(); 
  expect(privateKey).toBeDefined();
  expect(publicKey).toBeDefined();
})