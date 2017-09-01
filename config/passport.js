var dbconfig = require('./database')
var qb = require('node-querybuilder').QueryBuilder(dbconfig, 'mysql', 'single');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy   = require('passport-local').Strategy;
var insert = require('../app/models/user').insert;
var find = require('../app/models/user').find;
var encode = require('../app/models/user').encode;
var decode = require('../app/models/user').decode;
var checkEmailFB = require('../app/models/user').checkEmailFB;
var checkEmailGoogle = require('../app/models/user').checkEmailGoogle;
var checkId = require('../app/models/user').checkId;
var validator = require('validator');
module.exports = function(passport){

passport.serializeUser(function(response, done) {
  done(null, response.id);
});

passport.deserializeUser(function(id, done) {
    qb.select('*').where('id',id).get('users',function(err,response){
    done(err, response[0]);
  })
});

passport.use('local-login',new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback : true
    },
  function(req,email, password, done) {

    find('email',email,function(dl){
      if(dl===undefined){
        return done(null, false,  req.flash('Message', 'sai email'));
      }
      else if(dl==1){
        return done(null, false,  req.flash('Message', 'loi truy van'));
      }else{
        var pw = decode(dl.password);
        if(pw==password){
          return done(null,dl);
        }else{
          return done(null, false,  req.flash('Message', 'sai mat khau'));
        }
      }
    })

  }
));

passport.use(
    'local-signup',
    new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
      if(validator.isEmail(email)){
        find('email',email,function(dl){
            if(dl===undefined){
              if(password.length<7){
                return done(null, false,  req.flash('Message', 'mat khau phai co hon 7 ky tu'));
              }else{
                var data = {
                  email: email,
                  password: encode(password),
                }
                insert(data,function(dl){
                  if(dl==1){
                    return done(null, false,  req.flash('Message', 'loi truy van'));
                  }else{
                    find('email',email,function(dl){
                      return done(null,dl);
                    })
                  }
                })
              }

            }
            else if(dl==1){
              return done(null, false,  req.flash('Message', 'loi truy van'));
            }else{
              return done(null, false,  req.flash('Message', 'email da ton tai'));
              }
            })
      }else{
        return done(null, false,  req.flash('Message', 'email khong hop le'));
      }

    }
  ));


  passport.use(new FacebookStrategy({
          clientID        : '377155859334760',
          clientSecret    : '83f3b29647f9a053cd315dbdf0cf279b',
          callbackURL     : 'http://localhost:3000/auth/facebook/callback',
          profileFields: ['id', 'displayName', 'link',  'photos', 'email'],
          enableProof: true
      },
      function(req,token, refreshToken, profile, done) {
          process.nextTick(function() {
              if(profile.emails !==undefined){
                var str = profile.emails[0].value.concat(";",profile.displayName).concat(";",profile.profileUrl).concat(";",profile.photos[0].value);
                var email =profile.emails[0].value;
                checkEmailFB(email,function(num){
                  if(num==1){
                    return done('loi truy van');
                  }
                  if(num==2){
                    find('facebook',str,function(dl){
                      return done(null, dl);
                    })
                  }
                  if(num==3){
                    // var str = email.concat(";",profile.displayName).concat(";",profile.profileUrl).concat(";",profile.photos[0].value).concat(";",token);
                    var data ={
                      facebook:str,
                    };
                    insert(data,function(num){
                      if(num==1){
                        console.log('loi truy van');
                      }else{
                        find('facebook',str,function(dl){
                          return done(null, dl);
                        })
                    }
                  })
                }
              })
        }else{
                var id=profile.id;
                var str=id.concat(";",profile.displayName).concat(";",profile.profileUrl).concat(";",profile.photos[0].value);
                // var str=id.concat(";",profile.displayName).concat(";",profile.profileUrl).concat(";",profile.photos[0].value).concat(";",token);
                  checkId(id,function(num){
                  if(num==1){
                      return done('loi truy van')
                    }
                  if(num==2){
                      find('facebook',str,function(dl){
                        return done(null, dl);
                      })
                    }
                    if(num==3){
                      var data =  {
                        facebook:str,
                      }
                        insert(data,function(num){
                        if(num==1){
                          console.log('loi truy van');
                          }else{
                            find('facebook',str,function(dl){
                            return done(null, dl);
                              })
                            }
                          })
                        }
              })
          }

       })
     }))

     passport.use(new GoogleStrategy({
                    clientID        : '359603809187-021gqicvhol3vqdd1h8vhsc6v69lqs99.apps.googleusercontent.com',
                    clientSecret    : 'FKns_naE2-Gjsz5yUdpwdvNJ',
                    callbackURL     : 'http://localhost:3000/auth/google/callback',
                },function(token, refreshToken, profile, done) {
             process.nextTick(function() {
                  var email = profile.emails[0].value;
                  var providerData = profile._json;
                  // var str=email.concat(";",profile.displayName).concat(";",providerData.url).concat(";",profile.photos[0].value).concat(";",token);
                  var str=email.concat(";",profile.displayName).concat(";",providerData.url).concat(";",profile.photos[0].value);
                  checkEmailGoogle(email,function(num){
                    if(num==1){
                      return done('loi truy van')
                    }else if(num==2){
                      find('google',str,function(dl){
                        return done(null, dl);
                      })
                    }else{
                      var data =  {
                        google:str,
                      }
                      insert(data,function(dl){
                        if(dl==1){
                          console.log('loi truy van')
                        }else{
                          find('google',str,function(dl){
                            if(dl==1){
                              console.log('loi truy van');
                            }else{
                              return done(null,dl);
                            }
                          })
                        }
                      })
                    }
                  })
             })
         }));

}
