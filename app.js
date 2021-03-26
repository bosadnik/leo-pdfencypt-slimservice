const express = require('express');
const authenticatedCheck = require('./middlewares/auth.check')
const { authLimiter } = require('./middlewares/rateLimiter');
const morgan = require('morgan');
const db = require('./modules/db');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const fileStreamRotator = require('file-stream-rotator')
var multer = require('multer');
var upload = multer();


//routes
const api = require('./routes/api.route');


// loading env variables from .env
require('dotenv').config();


// Enviroments variables and config 
const {
    env
// eslint-disable-next-line no-undef
} = process;

//app setup
const app = express();

// init database:
db.initDB();


//TODO define and apply correct log location
var accessLogStream = fileStreamRotator.getStream({filename:"./log/access-%DATE%.log", frequency:"daily", verbose: false});
var errorLogStream = fileStreamRotator.getStream({filename:"./log/error-%DATE%.log", frequency:"daily", verbose: false});

// morgan for better logging expirience 
app.use(morgan('combined', {
    stream: accessLogStream,
    skip: (req) => /^\/health$/g.test(req.path) //skiping log for frequent helth check 
}));

app.use(morgan('combined', {
    stream: errorLogStream,
    skip: function (req, res) {
        return res.statusCode < 400
    } //saving errors only to errorLogStream
}));


const router = express.Router();




// JWT configuration
if (!env.JWT_SECRET) {
    throw new Error('You must specify a JWT_SECRET environment variable');
}

const jwtOptions = {
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_SECRET,
    authScheme: 'Bearer',
};

const strategyCallback = async (jwtPayload, done) => {
    try {
        // The jwtPayload object is weird;
        // destructuring does not seem to pull out the id correctly!
        // So please leave it like `const id = jwtPayload.id;`
        const email = jwtPayload.email;
        const user = await db.getUser(email);

        if (user.email === email) {
            // We can add more properties as required.
            // It is probably inappropriate to pass the password hash.
            done(null, {
                id: user.email,
            });
        } else {
            done(null, false);
        }
    } catch (error) {
        console.error(error);
        done(error, false);
    }
};

const passportStrategy = new passportJWT.Strategy(jwtOptions, strategyCallback);

passport.use(passportStrategy);


 app.use(express.urlencoded({ extended: true }));
 app.use(express.json());
 app.use(upload.any()); 


app.use(passport.initialize());
app.use(passport.session());




// healthcheck endpoint
router.get('/health', async (req, res) => {
    return res.status(200).json({
        message: 'OK'
    });
});

// Auth


// POST Login
router.post('/sign-in', authLimiter, async (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const verification = await db.verifyUser(username, password);

        if (verification) {
            const payload = {
                email:verification.email
            };
            const options = {
                expiresIn: env.JWT_EXPIRES_IN || '14 days',
            };
            const token = jwt.sign(payload, jwtOptions.secretOrKey, options);
            
            return res.json({
                token
            });
        }
    } catch (error) {
        console.error(error);
    }

    return res.status(401).json({
        message: 'Invalid id and password combination',
    });
});


//  CHECK authentication status
router.get('/sign-in', authenticatedCheck, (req, res) => {
    res.json({
        message: 'You are authenticated. ',
        user: req.user,
    });
});


// API
router.use('/api', authenticatedCheck, api);

app.use(router);

// 404 catch-all
app.get('*', (req, res) => {
    res.status(404).json({ message: 'Page not found. ' });
  });


module.exports = app;