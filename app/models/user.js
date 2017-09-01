var Crypto = require("crypto-js");
var dbconfig = require('../../config/database')
var qb = require('node-querybuilder').QueryBuilder(dbconfig, 'mysql', 'single');

var SECRET_KEY ="adfgpoiufkjhgfmbvcx";

var insert = function(data,cb){
  qb.insert('users', data, function(err, response) {
            if (err){
              cb(1);
            }
            else{
              cb(2);
          }
        });
}
var find = function(colum,value,cb){
  qb.select('*').where(colum, value).get('users',function(err,response){
    if(err){
      cb(1);
    }else{
      cb(response[0]);
    }
  })
}

var encode = function(password){
  return Crypto.AES.encrypt(password, SECRET_KEY).toString();
}
var decode = function(password){
  return Crypto.AES.decrypt(password, SECRET_KEY).toString(Crypto.enc.Utf8);
}

var checkEmailFB = function(email,cb){
  const stars = [null, 'Null'];
  qb.select('*')
  .where_not_in('facebook',stars)
  .get('users',function(err,response){
    if(err){
      cb(1);
    }else{
      var i=0;
      for(;i<response.length;i++){
          var arr = response[i].facebook.split(";");
            if(arr[0]==email){
              cb(2);break;
            }
          }
        if(i==response.length){
            cb(3);
          }
    }
  })
}

var checkId = function(id,cb){
  qb.select('*').get('users',function(err,response){
    if(err){
      cb(1);
    }else{
      var i=0;
      for(;i<response.length;i++){
          var arr = response[i].facebook.split(";");
            if(arr[0]==id){
              cb(2);break;
            }
          }
        if(i==response.length){
            cb(3);
          }
    }
  })
}

var checkEmailGoogle = function(email,cb){
  const stars = [null, 'Null'];

  qb.select('*')
  .where_not_in('google',stars)
  .get('users',function(err,response){
    if(err){
      cb(1);
    }else{
      var i=0;
      for(;i<response.length;i++){
          var arr = response[i].google.split(";");
            if(arr[0]==email){
              cb(2);break;
            }
          }
        if(i==response.length){
            cb(3);
          }
    }
  })
}

module.exports.checkId = checkId;
module.exports.checkEmailFB = checkEmailFB;
module.exports.checkEmailGoogle = checkEmailGoogle;
module.exports.insert = insert;
module.exports.find = find;
module.exports.encode = encode;
module.exports.decode = decode;
