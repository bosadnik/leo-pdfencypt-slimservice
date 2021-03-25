# PDFEncryt slimservice

NodeJS task implementation using express

App runs with in-memory-db, initiated when starts with 2 users for test purposes:

    username: 'example',
    password: '1234',
    email: 'example@mail.com'

    username: 'second-example',
    password: '4321',
    email: 'second-example@mail.com'


## Development Notes

Before first run - setup env variables into .env file - refer to .env.example 


Install dependencies:

```bash
npm install
```

running:

```bash
npm start
```

running in dev:

```bash
npm run dev
```

testing:

```bash
npm test
```


## API calls supported

## Health check

`GET <service uri>/health`

## Authorization

### 0. Check authorization status

`GET <service uri>/sign-in`

```http
HTTP/1.1 200 OK
```

```json
{
    message: 'You are authenticated.',
    user: <user email>,
}
```

```http
HTTP/1.1 401 UNAUTHORIZED
```

```json
{
    message: 'You are not authenticated.',
    user: <user email>,
}
```

### 1. Login

`POST <service uri>/sign-in`

```json
body:{
    username,
    password
}
```

```http
HTTP/1.1 200 OK
{
    "token": "XXX generated token to be used for further athorisation"
}
```

```http
HTTP/1.1 401 UNAUTHORIZED
{
    "message": "Invalid id and password combination"
}
```

### 2. Generate key pair

_AUTHORIZATION required_ if not 401 _UNATHORIZED_ returned

_generate public and private keys pair used for encrypt/decrypt purposes in endpoint 3_

`POST <service uri>/generate-key-pair `

```json
headers:[
    Authorization:Bearer <GENERATED-TOKEN>
]
```

```http
HTTP/1.1 200 OK
{
 "privKey":
    "-----BEGIN PRIVATE KEY-----\n
    ...........
    ...........
    -----END PRIVATE KEY-----\n",

"pubKey":
     -----BEGIN PUBLIC KEY-----\n
    ...........
    ...........
    -----END PUBLIC KEY-----\n"

}
```

```http
HTTP/1.1 401 UNAUTHORIZED
```

```json
{
    message: 'You are not authenticated.',
    user: <user email>,
}
```

### 3. Encrypt pdf file

_AUTHORIZATION required_ if not 401 _UNATHORIZED_ returned

_Encrypts provided pdf file using users public key, stored in db. When key hasn't been yet generated, proper 401 response being returned with information how to generate keys, prior to encrypting any file_

`POST <service uri>/api/encrypt `

```json
headers:[
    Authorization:Bearer <GENERATED-TOKEN>
    Content-Type: application/pdf
]

body:[
    file: [pdf-file]
]

```

```http
HTTP/1.1 200 OK
{
    [encrypted-file-content]
}
```

```http
HTTP/1.1 400 BAD REQUEST
{
    "No public key yet generated. Use /api/generate-key-pair first!"
}
```

```http
HTTP/1.1 401 UNAUTHORIZED
```

```json
{
    message: 'You are not authenticated.',
    user: <user email>,
}
```

### 4. Encrypt-decrypt pdf file

_AUTHORIZATION required_ if not 401 _UNATHORIZED_ returned

_It is technical api endpoint created only for test/demonstration purposes, to test encryption and decryption procedure. It just does encryption process using public key and immiedielty decrypts it back to original file using private key, that has been stored (insecure!!!) in db only for sake of this test :) - corresponding `FIXME` markups shows where and what method should be disabled_

`POST <service uri>/api/encrypt-decrypt `

```json
headers:[
    Authorization:Bearer <GENERATED-TOKEN>
    Content-Type: application/pdf
]

body:[
    file: [pdf-file]
]

```

```http
HTTP/1.1 200 OK
{
    [decrypted-file-content]
}
```

```http
HTTP/1.1 400 BAD REQUEST
{
    "No public key yet generated. Use /api/generate-key-pair first!"
}
```

```http
HTTP/1.1 401 UNAUTHORIZED
```

```json
{
    message: 'You are not authenticated.',
    user: <user email>,
}
```

