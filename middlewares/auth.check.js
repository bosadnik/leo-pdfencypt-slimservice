const passport = require('passport');


module.exports =  (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, user, info = {}) => {
      if (!user) {
        return res.status(401).json({
          message: 'You are not authenticated. ', 
          info, 
        });
      }
      
      if (error) {
        // eslint-disable-next-line no-console
        console.error(error);
  
        return res.status(500).json({
          message: 'Internal server error', 
        }); 
      }
      
      req.user = user;
  
      return next();
    })(req, res, next);
  };  