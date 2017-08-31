var dbconfig = require('../config/database')
var qb = require('node-querybuilder').QueryBuilder(dbconfig, 'mysql', 'single');
var room= require('./models/room')
var fs      = require("fs");
module.exports =function(io,app){
//   io.of('/chat').use(sharedsession(session, {
//     autoSave: true
//
// }));
// io.of('/chatroom').use(sharedsession(session, {
//   autoSave: true
//
// }));
   io.of('/chat').on('connection', function(socket) {
     socket.on('con',function(id_user){
       socket.user_ID=id_user;
       room.findRoomWithUserId(id_user,function(data){
         if(data==1){
           console.log("xay ra loi");
         }else{
           socket.emit("getRooms",data);
         }
       })
     })
      socket.on('createRoom', function(name,id_user) {
        room.findRoom(name,function(dl){
          if(dl==1){
            socket.emit('updateRoomsList',{error:'da xay ra loi'});
          }else if(dl==undefined){
            room.insertRoom(name,function(dl1){
              if(dl1==1){
                socket.emit('updateRoomsList',{error:'da xay ra loi'});
              }else{
                room.findRoom(name,function(dl2){
                  if(dl2==1){
                    socket.emit('updateRoomsList',{error:'da xay ra loi'});
                  }else{
                  room.insertUser('admin',dl2.id_room,id_user,function(dl3){
                    if(dl3==1){
                      socket.emit('updateRoomsList',{error:'da xay ra loi'});
                    }else{
                      socket.emit('updateRoomsList',{data:dl2});
                      socket.broadcast.emit('updateRoomsList',{data:dl2});
                      socket.emit('moveToRoom',{data:dl2});
                    }
                  })

                  }
                })

              }
            })

          }else{
            socket.emit('updateRoomsList',{error:'ten room da ton tai'});
          }
        })
      });

  });

    io.of('/chatroom').on('connection', function(socket) {
     socket.on('joinRoom', function(id_room,id_user) {
       room.findUser(id_room,id_user,function(dl){
         if(dl==undefined){
           socket.user_ID=id_user;
           socket.room=id_room;
           socket.join(id_room);
           room.insertUser('online',id_room,id_user,function(dl1){
             if(dl1==1){
               socket.emit('updateUserList',{error:'da xay ra loi'});
             }else{
               room.findID(id_user,function(dl2){
                 socket.emit('updateUserList', {data:dl2});
                 socket.broadcast.to(id_room).emit('updateUserList',{data:dl2});
               })
             }
           })
         }else if(dl.role=='offline' || dl.role=='admin' || dl.role=='online' ||dl.role=='AddminOffline'){
           socket.room=id_room;
           socket.user_ID=id_user;
           socket.join(id_room);
           if(dl.role=="offline"){
             room.updateJoinRoom('online',id_room,id_user,function(dl3){
               if(dl3==1){
                 console.log('loi truy van');
               }else{
                 socket.emit('updateUserList2',id_user,dl.role);
                 socket.broadcast.to(id_room).emit('updateUserList2',id_user,dl.role);
                 }
               })
             }
             if(dl.role=='AddminOffline'){
               room.updateJoinRoom('admin',id_room,id_user,function(dl3){
                 if(dl3==1){
                   console.log('loi truy van');
                 }else{
                   socket.emit('updateUserList2',id_user,dl.role);
                   socket.broadcast.to(id_room).emit('updateUserList2',id_user);
                   }
                 })
               }
               if(dl.role=='admin'){
                  socket.emit('updateUserList2',id_user,dl.role);
               }
           }else{
             socket.emit('updateUserList',{error:'da xay ra loi'});
           }

         })
     })

     socket.on('newMessage', function(message1) {
       var size = ((message1.content.length*3)/4)/(1024*1024);
       var name = message1.name
       var id_user = message1.id;
       var message = message1.content;
       var date = message1.date;
       var id_room = message1.room;
       if(message1.type){
         var type = message1.type;
       }else{
         var firstSlash = message.indexOf(":")
         var firstSemicolon = message.indexOf(";");
         var type = message.slice(firstSlash+1, firstSemicolon);
       }
       if(type=="text" || type == "image/jpeg" || type == "image/jpg" || type == "image/png" || type == "application/pdf" || type == "text/plain" || type=="application/vnd.openxmlformats-officedocument.wordprocessingml.document" || type == "application/gzip")
       {
         if(size<5){
           room.insertMessage(id_room,id_user,message,date,type,name,function(dl){
             if(dl==1){
               console.log('loi insertMessage');
             }else{
               socket.emit('addMessage',message,id_user,date,type,name);
               socket.broadcast.to(id_room).emit('addMessage', message,id_user,date,type,name);
               io.emit('leaveRoomMessage',id_room,message,id_user,date,type,name);
               io.of('/chat').emit('leaveRoomMessage',id_room,message,id_user,date,type,name);
               io.of('/chatroom').emit('leaveRoomMessage',id_room,message,id_user,date,type,name);
             }
           });
         }else{
           socket.emit("addMessageErr",{err:"file size khong lon hon 5mb"});
         }
       }else{
         socket.emit("addMessageErr",{err:"file khong phu hop"})
       }

      });

      socket.on('invite',function(id_find,inviteMessage){
        room.findUser(socket.room,id_find,function(dl){
          if(dl==1){
              socket.emit('findMessage',1)
          }else if(dl===undefined){
            var count=0;
            var chat = io.of('/chat');
              if (chat) {
                for (var i in chat.connected) {
                        var index = chat.connected[i];
                        if(index.user_ID==id_find){
                          count++;
                          io.of('/chat').to(index.id).emit("getInvited",socket.room,inviteMessage);
                        }
              }
            }
            var chatroom = io.of('/chatroom');
              if (chatroom) {
                for (var i in chatroom.connected) {
                        var index = chatroom.connected[i];
                        if(index.user_ID==id_find){
                          count++;
                          io.of('/chatroom').to(index.id).emit("getInvited",socket.room,inviteMessage);
                        }
              }
            }
            if(count==0){
              socket.emit('findMessage',3)
            }
          }else{
            socket.emit('findMessage',2)
          }
        })

      })
      socket.on('invitedJoinRoom',function(id_room,id_user){
        room.insertUser('offline',id_room,id_user,function(dl){
          if(dl==1){
            console.log('loi truy van');
          }else{
            room.findID(id_user,function(dl2){
              socket.broadcast.to(id_room).emit('updateUserList3',{data:dl2});
            })
          }
        })
      })




      socket.on('disconnect',function(){
        console.log('-------------')
        setTimeout(function(){
          socket.emit('UpdateLocalstorageLeave',socket.room,socket.user_ID);
          io.emit('UpdateLocalstorageLeave',socket.room,socket.user_ID);
          io.of('/chat').emit('UpdateLocalstorageLeave',socket.room,socket.user_ID);
          io.of('/chatroom').emit('UpdateLocalstorageLeave',socket.room,socket.user_ID);
        }, 400);

        room.updateLeaveRoom(socket.room,socket.user_ID,function(dl){
          if(dl==1){
            console.log('loi truy van');
          }else{
            socket.broadcast.to(socket.room).emit('updateUserList1', socket.user_ID);

            socket.leave(socket.room);

          }
        })


      })


   })

}
