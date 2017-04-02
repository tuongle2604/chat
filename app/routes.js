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
			console.log("zZZZz")
			if (req.body.remember) {
				console.log("remember");
				req.session.cookie.maxAge =  60 * 1000;
			} else {
				console.log("not remember");
				delete req.session.cookie.expires;
				delete req.session.cookie.maxAge;
				req.session.cookie.expires = new Date(0);
				req.session.cookie.maxAge = 0;
				console.log(req.session.cookie.expires);
				req.session.cookie.expires = false;
			}
	    res.redirect('/chat');
	  });

		app.get('/chat',isLoggedIn,function(req,res){
			room.findListRoom(function(data){
				if(data==1){
					res.redirect('dangnhap');
				}else{
					res.render('room',{ user: req.user,data:data});
				}
			})

		})
		app.get('/chat/:id',isLoggedIn,function(req,res){
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
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()){
		if (req.body.remember) {
			console.log(1);
			req.session.cookie.maxAge =   60 * 1000;
		} else {
			console.log(2);
			delete req.session.cookie.expires;
			delete req.session.cookie.maxAge;
			req.session.cookie.expires = new Date(0);
			req.session.cookie.maxAge = 0;
			console.log(req.session.cookie.expires);
			req.session.cookie.expires = false;
		}
		return next();
	}else{
		res.redirect('/dangnhap');
	}
}

// module.exports = router;
