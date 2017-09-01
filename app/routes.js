var dbconfig = require('../config/database')
var qb = require('node-querybuilder').QueryBuilder(dbconfig, 'mysql', 'single');
var room= require('./models/room')

module.exports = function(app,passport){

	app.get('/dangky', function(req, res){
		res.render('dangky', { message: req.flash('Message') });
	});
	app.post('/dangky', passport.authenticate('local-signup', {
		successRedirect : '/dangnhap',
		failureRedirect : '/dangky',
		failureFlash : true
	}));

	app.get('/dangnhap',isLogin,function(req, res){
		res.render('dangnhap', { message: req.flash('Message') });
	});

	app.post('/dangnhap',
	  passport.authenticate('local-login', {
			 failureRedirect:'/dangnhap',
			 failureFlash: true}),
	  function(req, res) {
	    res.redirect('/chat');
	  });

		app.use('/chat',function(req,res,next){
			if (req.isAuthenticated()){
				return next();
			}else{
				res.redirect('/dangnhap');
			}
		})

		app.get('/chat',function(req,res){
			room.findListRoom(function(data){
				if(data==1){
					res.redirect('dangnhap');
				}else{
					res.render('room',{ user: req.user,data:data});
				}
			})

		})
		app.get('/chat/:id',function(req,res){
			var id =req.params.id;
			room.findListUser(id,function(data){
				room.findListMessage(id,function(message){
					res.render('chatroom',{user: req.user,data:data,id:id,message:message});
				})

			})

		})
		app.get('/logout',logout,function(req,res){
			res.redirect('dangnhap');
		})
		app.get('/auth/facebook',passport.authenticate('facebook',{scope:['email']}));
		app.get('/auth/facebook/callback',
		       passport.authenticate('facebook', {
		           successRedirect : '/chat',
		           failureRedirect : '/dangnhap'
		       }));

		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
		app.get('/auth/google/callback',
			 		            passport.authenticate('google', {
			 		                    successRedirect : '/chat',
			 		                    failureRedirect : '/dangnhap'
			 		            }));
}
function logout(req,res,next){
	req.logout();
	next();
}
function isLogin(req,res,next){
	if (req.isAuthenticated()){
		res.redirect('/chat');
	}else{
		return next();
	}
}


// module.exports = router;
