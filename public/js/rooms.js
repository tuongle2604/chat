
var app = {

  rooms: function(id_user){

    $(document).ready(function(){
      $('#user_ID').hide();
      var socket = io('/chat', { transports: ['websocket'] });
      socket.on('connect',function(){

        if (typeof(Storage) !== "undefined") {
          if(!localStorage.getItem('arr')){
            socket.emit('con',id_user);
          }else{
            console.log(123);
          }
        } else {
          alert("trinh duyet khong ho tro");
        }

        socket.on('getRooms',function(data){
          console.log("data: "+data);
          localStorage.setItem('arr',data);
        })

        $('.room-create button').on('click', function() {
          var roomTitle = $("#title").val();
          if(roomTitle==" "){
            $('.room-create').append(`<p class="message error">ban chua nhap ten room</p>`);
          }else{
            socket.emit('createRoom', roomTitle,id_user);
            $("#title").val('');
            $('.message').hide();
          }
        });

        socket.on('updateRoomsList',function(data){
          if(data.error){
            $('.room-create').append(`<p class="message error">${data.error}</p>`);
          }else{
            $('#list-rooms').append(`<a id="${data.data.name}" href="/chat/${data.data.id_room}"><li class="room-item">${data.data.name}</li></a>`);
          }
        })

        socket.on('moveToRoom',function(data){
          var redirect = "http://localhost:1337/chat/"+data.data.id_room;
          window.location.href = redirect;
        })

        socket.on('getInvited',function(room,inviteMessage){
          var redirect = "http://localhost:1337/chat/"+room;
          $("#invited").append(`<div id="div1"><p>ai do da moi ban vao nhom</p>
          <p>${inviteMessage}</p>
          <button   onclick="window.location.href='${redirect}'">yes</button>
          <button   onclick="$('#invited').empty()">no</button>
          </div>`)
        })
var id_message=0;
var id_file=0;
        socket.on('leaveRoomMessage',function(id_room,message,id_user,date,type,name){
          if(localStorage.getItem('arr')){
            var arr = localStorage.getItem('arr').split(',');
            for(var i=0;i<arr.length;i++){
              if(arr[i]==id_room){
                $("#messageleaveRoom").empty();
                date  = (new Date(date)).toLocaleString();
                var idMessage = "message"+id_room+id_message;
                console.log(idMessage);
                if(type=="image/jpeg" || type=="image/jpg" || type=="image/png"){
                  $("#messageleaveRoom").append(`<div id="${idMessage}">
                                  <p>RoomID: ${id_room}</p>
                                  <p>UserID: ${id_user}</p>
                                  <p>date: ${date}</p>
                                  <img style="width:300px;"src="${message}" alt="${name}">
                                </div>`);
                }else if(type=="application/pdf" || type=="text/plain" || type=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                  var idFile = "file"+id_room+id_file;
                  $("#messageleaveRoom").append(`<div id="${idMessage}">
                                  <p>RoomID: ${id_room}</p>
                                  <p>UserID: ${id_user}</p>
                                  <p>date: ${date}</p>
                                  <a id="${idFile}"  style="color:red;" title="Download pdf document">${name}</a>
                                </div>`);

                  $("#file"+id_room+id_file).on("click",function(){
                    console.log(type);
                    download(message,name,type);
                    id_file++;
                  })
                }else{
                  $("#messageleaveRoom").append(`<div id="${idMessage}">
                                  <p>RoomID: ${id_room}</p>
                                  <p>UserID: ${id_user}</p>
                                  <p>date: ${date}</p>
                                  <p>message: ${message}</p>
                                </div>`);
                }

                  var x = document.getElementById("messageleaveRoom");
                  x.className = "show";
                  if(id_message>0){
                    $("#message"+id_room+(id_message-1)).empty();
                  }
                  id_message++;
                  setTimeout(function(){
                        x.className = x.className.replace("show", "");
                }, 5000);
                break;
              }
          }
        }
      })
      socket.on('UpdateLocalstorageLeave',function(id_room,user_ID){
        if(user_ID==id_user){
            if(localStorage.getItem('arr') === null || localStorage.getItem('arr') === undefined){
              localStorage.setItem('arr',id_room);
            }else{
              var arr = localStorage.getItem('arr').split(',');
              var j=0;
              for(var i=0;i<arr.length;i++){
                if(arr[i]==id_room){
                  j=1;break;
                }
              }
              if(j==0){
                arr.push(id_room);
                localStorage.setItem('arr',arr);
              }
            }

          }

      })

      })
    });
  },

  chat: function(id_room,id_user){

    $(document).ready(function(){

      var socket = io('/chatroom', { transports: ['websocket'] });
      socket.on('connect', function () {
        var id=0;
        var id_message=0;
        var id_file=0;
          socket.emit('joinRoom', id_room,id_user);

          setTimeout(function(){
            if (typeof(Storage) !== "undefined") {
              if(localStorage.getItem('arr')){
                var arr_room = localStorage.getItem('arr').split(',');
                for(var i=0;i<arr_room.length;i++){
                        if(arr_room[i]==id_room){
                          arr_room.splice(i,1);
                          break;
                        }
                      }
              localStorage.setItem('arr',arr_room);
              }

            } else {
              alert("trinh duyet khong ho tro");
            }
          }, 1000);


          socket.on('UpdateLocalstorageLeave',function(id_room,user_ID){
            if(user_ID == id_user){
              if(localStorage.getItem('arr') == null || localStorage.getItem('arr') == undefined){
                localStorage.setItem('arr',id_room);
              }else{
                var arr = localStorage.getItem('arr').split(',');
                var j=0;
                for(var i=0;i<arr.length;i++){
                  if(arr[i]==id_room){
                    j=1;break;
                  }
                }
                if(j==0){
                  arr.push(id_room);
                  localStorage.setItem('arr',arr);
                }

              }
            }
          })
          socket.on('leaveRoomMessage',function(id_room,message,id_user,date,type,name){
            if(localStorage.getItem('arr')){
              var arr = localStorage.getItem('arr').split(',');
              for(var i=0;i<arr.length;i++){
                if(arr[i]==id_room){
                  date  = (new Date(date)).toLocaleString();
                  var idMessage = "message"+id_room+id_message;
                  console.log(idMessage);
                  if(type=="image/jpeg" || type=="image/jpg" || type=="image/png"){
                    $("#messageleaveRoom").append(`<div id="${idMessage}">
                                    <p>RoomID: ${id_room}</p>
                                    <p>UserID: ${id_user}</p>
                                    <p>date: ${date}</p>
                                    <img style="width:300px;"src="${message}" alt="${name}">
                                  </div>`);
                  }else if(type=="application/pdf" || type=="text/plain" || type=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                    var idFile = "file"+id_room+id_file;
                    $("#messageleaveRoom").append(`<div id="${idMessage}">
                                    <p>RoomID: ${id_room}</p>
                                    <p>UserID: ${id_user}</p>
                                    <p>date: ${date}</p>
                                    <a id="${idFile}"  style="color:red;" title="Download pdf document">${name}</a>
                                  </div>`);

                    $("#file"+id_room+id_file).on("click",function(){
                      console.log(type);
                      download(message,name,type);
                      id_file++;
                    })
                  }else{
                    $("#messageleaveRoom").append(`<div id="${idMessage}">
                                    <p>RoomID: ${id_room}</p>
                                    <p>UserID: ${id_user}</p>
                                    <p>date: ${date}</p>
                                    <p>message: ${message}</p>
                                  </div>`);
                  }

                    var x = document.getElementById("messageleaveRoom");
                    x.className = "show";
                    if(id_message>0){
                      $("#message"+id_room+(id_message-1)).empty();
                    }
                    id_message++;
                    setTimeout(function(){
                          x.className = x.className.replace("show", "");
                  }, 5000);
                  break;
                }
            }
          }
        })
          socket.on('updateUserList',function(data){
            if(data.error){
              window.location.href = "http://localhost:1337/chat";
            $('.room-create').append(`<p class="message error">${data.error}</p>`);
            }else{
              if(data.data.facebook){
                var arr = data.data.facebook.split(";");
                $('#listUser').append(`<li class="clearfix" id="${data.data.id}">
                         <img src="${arr[3]}" alt="${arr[1]}" />
                         <div class="about">
                            <div class="name">${arr[1]}</div>
                            <div class="status"><i class="fa fa-circle online"></i> online</div>
                         </div></li>`);
              }else if(data.data.google){
                var arr = data.data.google.split(";");
                $('#listUser').append(`<li class="clearfix" id="${data.data.id}">
                         <img src="${arr[3]}" alt="${arr[1]}" />
                         <div class="about">
                            <div class="name">${arr[1]}</div>
                            <div class="status"><i class="fa fa-circle online"></i> online</div>
                         </div></li>`);
              }else{
                $('#listUser').append(`<li class="clearfix" id="${data.data.id}">
                         <img src="/img/user.jpg" alt="${data.data.id}" />
                         <div class="about">
                            <div class="name">${data.data.id}</div>
                            <div class="status"><i class="fa fa-circle online"></i> online</div>
                         </div></li>`);
              }

            }
          })
          socket.on('updateUserList3',function(data){
            if(data.error){
            $('.room-create').append(`<p class="message error">${data.error}</p>`);
            }else{
              if(data.data.facebook){
                var arr = data.data.facebook.split(";");
                $('#listUser').append(`<li class="clearfix" id="${data.data.id}">
                         <img src="${arr[3]}" alt="${arr[1]}" />
                         <div class="about">
                            <div class="name">${arr[1]}</div>
                            <div class="status"><i class="fa fa-circle offline"></i> offline</div>
                         </div></li>`);
              }else if(data.data.google){
                var arr = data.data.google.split(";");
                $('#listUser').append(`<li class="clearfix" id="${data.data.id}">
                         <img src="${arr[3]}" alt="${arr[1]}" />
                         <div class="about">
                            <div class="name">${arr[1]}</div>
                            <div class="status"><i class="fa fa-circle offline"></i> offline</div>
                         </div></li>`);
              }else{
                $('#listUser').append(`<li class="clearfix" id="${data.data.id}">
                         <img src="/img/user.jpg" alt="${data.data.id}" />
                         <div class="about">
                            <div class="name">${data.data.id}</div>
                            <div class="status"><i class="fa fa-circle offline"></i> offline</div>
                         </div></li>`);
              }

            }
          })
          $("#send").on('click', function() {
            console.log(123);
              var textareaEle = $("textarea[name='message']");
              var messageContent = textareaEle.val().trim();
              if(messageContent !== '') {
                var message1 = {
                  type:'text',
                  content: messageContent,
                  date: Date.now(),
                  room:id_room,
                  id:id_user,
                };
                socket.emit('newMessage',message1);
                textareaEle.val('');
              }
            });

            $("#uploadImage").on('click',function(){
              console.log(1);
              $("#fileSelector").click();
            })

            $("#fileSelector").change(function(){
              submitImg();
              $("#fileSelector").val('');
            });

            function submitImg(){
            var selector = document.getElementById("fileSelector").files;
            var name = selector[0].name;
            var reader = new FileReader();
                  reader.onload = function (e) {
                    var message=e.target.result;
                    var firstSlash = message.indexOf(":")
                    var firstSemicolon = message.indexOf(";");
                    var res = message.slice(firstSlash+1, firstSemicolon);
                    var message1 = {
                      name:name,
                      content: message,
                      date: Date.now(),
                      room:id_room,
                      id:id_user,
                    };
                    socket.emit('newMessage',message1);
                  }
           reader.readAsDataURL(selector[0]);

          }
            socket.on('addMessage', function(message,id_user,date,type,name) {
              date  = (new Date(date)).toLocaleString();
              if(type=="image/jpeg" || type=="image/jpg" || type=="image/png"){
                var html = `<li>
                              <div class="message-data">
                                <span class="message-data-name">${id_user}</span>
                                <span class="message-data-time">${date}</span>
                              </div>
                              <img id="abcd" style="width:300px;"src="${message}" alt="${name}">
                            </li>`;
                $(html).hide().appendTo('.chat-history ul').slideDown(200);
              }else if(type=="application/pdf" || type=="text/plain" || type=="application/vnd.openxmlformats-officedocument.wordprocessingml.document" || type=="application/gzip"){
                if(type=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                  console.log("test");

                }
                  var html =  `<li>
                                <div class="message-data">
                                  <span class="message-data-name">${id_user}</span>
                                  <span class="message-data-time">${date}</span>
                                </div>
                                <a id="${id}"  style="color:red;" title="Download pdf document">${name}</a>
                              </li>`;

                $(html).hide().appendTo('.chat-history ul').slideDown(200);
                $("#"+id).on("click",function(){
                  console.log(type);
                  download(message,name,type);
                  id++;
                })
              }else{
                var html = `<li>
                              <div class="message-data">
                                <span class="message-data-name">${id_user}</span>
                                <span class="message-data-time">${date}</span>
                              </div>
                              <div class="message my-message" dir="auto">${message}</div>
                            </li>`;
                $(html).hide().appendTo('.chat-history ul').slideDown(200);



              }
              $(".chat-history").animate({ scrollTop: $('.chat-history')[0].scrollHeight}, 1000);
            });

            socket.on('addMessageErr',function(data){
              alert(data.err);
            })

            socket.on('updateUserList1', function(id_user) {
              $('#'+id_user+ ' i').removeClass("fa fa-circle online");
              $('#'+id_user+ ' i').addClass("fa fa-circle offline");
              $('#'+id_user+ ' span').html('offline')
            });
            socket.on('updateUserList2', function(id_user,role) {
              console.log(123);
              if(role=='AddminOffline' || role=="admin"){
                var id1="inviteButton";
                var id2="findInput";
                var id3="inviteMessage";
                $('#divFind').append(`<button id="${id1}" onclick="" style="height:25px;margin:5px;">invite</button>
                  <input type="text"  id="${id2}" style="height:25px;margin:5px;"></br>
                   text:<input type="text" id="${id3}" style="height:25px;margin:5px;margin-left:35px;">`);

                   $("#inviteButton").on("click", function() {
                     var id_find = $("#findInput").val();
                     var inviteMessage = $("#inviteMessage").val();
                     socket.emit('invite',id_find,inviteMessage);
                     $("#findInput").val('');
                     $("#inviteMessage").val('');
                   })
              }
              $('#'+id_user+ ' i').removeClass("fa fa-circle offline");
              $('#'+id_user+ ' i').addClass("fa fa-circle online");
                $('#'+id_user+ ' span').html('online')
            });
            socket.on("findMessage",function(data){
              if(data==1){
                $("#findMessage").append(`<p>da xay ra loi</p>`);
              }else if(data==2){
                $("#findMessage").append(`<p>nguoi nay da co trong room</p>`);
              }else{
                $("#findMessage").append(`<p>khong tim thay</p>`);
              }
              var abc = setInterval(empty, 1500);
              function empty(){
                $("#findMessage").empty();
              }
            })

            socket.on('getInvited',function(id_room,inviteMessage){
              var id="yes";
              $("#invited").append(`<div id="div1"><p>ai do da moi ban vao nhom</p>
              <p>${inviteMessage}</p>
              <button id="${id}"  >yes</button>
              <button   onclick="$('#invited').empty()">no</button>
              </div>`)
              $("#yes").on('click',function(){
                $('#invited').empty();
                socket.emit("invitedJoinRoom",id_room,id_user);
              })

            })
        })


    });

},

  myFunc: function(content,name,type){
    console.log(type)
    download(content,name,type);
  }

}
