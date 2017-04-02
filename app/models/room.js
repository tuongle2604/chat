var express = require('express');
var app = express();

var dbconfig = require('../../config/database')
var qb = require('node-querybuilder').QueryBuilder(dbconfig, 'mysql', 'single');

var findRoom = function(roomTitle,cb){
  qb.select('*').where('name', roomTitle).get('rooms',function(err,response){
    if(err){
      console.log('loi findRoom')
      console.log(err)

      cb(1);
    }else{
      cb(response[0]);
    }
  })
}

var insertRoom = function(roomTitle,cb){
  var data= {
    name:roomTitle,
  }
  qb.insert('rooms', data, function(err, response) {
            if (err){
              console.log('loi insertRoom')
              console.log(err);
              cb(1);
            }
            else{
              cb(2);
          }
        });
}

var findListRoom = function(cb){
  qb.select('*').get('rooms',function(err,response){
    if(err){
      console.log('loi findListRoom');
      console.log(err)
      cb(1);
    }else{
      cb(response);
    }
  })
}

var findListUser = function(id_room,cb){
  qb.select('r.id_user,r.role,r.id_room,u.facebook,u.google')
    .where('r.id_room',id_room)
    .join('users u', 'r.id_user=u.id','inner')
    .get('roomdetail r',function(err,response){
      if(err){
        console.log(err);
      }else{
        cb(response)
      }
    });
}

var findUser = function(id_room,id_user,cb){
    qb.select('*').where('id_room', id_room)
    .where('id_user',id_user)
    .get('roomdetail',function(err,response){
    if(err){
      console.log(err)
      cb(1);
    }else{
      cb(response[0]);
    }
  })
}
var findID = function(id_user,cb){
  qb.select('*').where('id',id_user)
  .get('users',function(err,response){
  if(err){
    console.log(err)
    cb(1);
  }else{
    cb(response[0]);
  }
})
}

var insertUser = function(role,id_room,id_user,cb){
  var data= {
    role:role,
    id_room:id_room,
    id_user:id_user,
  }
  qb.insert('roomdetail', data, function(err, response) {
            if (err){
              console.log('loi insertUser')
              console.log(err);
              cb(1);
            }
            else{
              cb(2);
          }
        });
}

var updateLeaveRoom =function(id_room,id_user,cb){
  findUser(id_room,id_user,function(dl){
    if(dl==1){
      console.log('loi updateLeaveRoom')
      console.log(err);
      cb(1);
    }else{
      if(dl.role=="admin"){
        var data={
            id_room:id_room,
            id_user:id_user,
            role:'AddminOffline',
        }
        qb.update('roomdetail', data, {id_user:id_user,id_room:id_room}, function(err, res) {
                  if (err){
                    console.log('loi updateLeaveRoom')
                    console.log(err);
                    cb(1);
                  }else{
                    cb(2);
                  }

              });
      }else{
        var data={
            id_room:id_room,
            id_user:id_user,
            role:'offline',
        }
        qb.update('roomdetail', data, {id_user:id_user,id_room:id_room}, function(err, res) {
                  if (err){
                    console.log('loi updateLeaveRoom')
                    console.log(err);
                    cb(1);
                  }else{
                    cb(2);
                  }

              });
      }
    }
  })

}
var updateJoinRoom =function(role,id_room,id_user,cb){
  var data={
      id_room:id_room,
      id_user:id_user,
      role:role,
  }
  qb.update('roomdetail', data, {id_user:id_user,id_room:id_room}, function(err, res) {
            if (err){
              console.log('loi updateJoinRoom')
              console.log(err);
              cb(1);
            }else{
              cb(2);
            }

        });

}
var insertMessage = function(id_room,id_user,message,date,type,name,cb){
  var date = (new Date(date)).toLocaleString();
  console.log(name)
  if(name){
    console.log(1);
    var data ={
      id_room:id_room,
      id_user:id_user,
      message:message,
      date:date,
      type:type,
      file_name:name,
    }
  }else{
    console.log(2);
    var data ={
      id_room:id_room,
      id_user:id_user,
      message:message,
      date:date,
      type:type,
    }
  }

  qb.insert('message', data, function(err, response) {
            if (err){
              console.log('loi insertMessage')
              console.log(err);
              cb(1);
            }
            else{
              cb(2);
          }
        });
}

var findListMessage = function(id_room,cb){
  qb.select('*').where('id_room',id_room)
    .get('message',function(err,response){
    if(err){
      console.log(err)
      cb(1);
    }else{
      cb(response);
    }
  })
}

var findRoomWithUserId = function(id_user,cb){
  qb.select('id_room')
  .where('id_user',id_user)
  .get('roomdetail',function(err,response){
    console.log(1);
    if(err){
      console.log(2);
      console.log(err)
      cb(1);
    }else{
      var arr = [];
      for(var i=0;i<response.length;i++){
        arr[i]=response[i].id_room;
      }
      cb(arr);
    }
  });
}

module.exports  = {
  findRoom,
  insertRoom,
  findListRoom,
  findListUser,
  findUser,
  findID,
  insertUser,
  updateLeaveRoom,
  updateJoinRoom,
  insertMessage,
  findListMessage,
  findRoomWithUserId
};
