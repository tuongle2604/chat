var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 3000
var path = require('path');
var passport = require('passport');
var flash    = require('connect-flash');

var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);

require('./app/socket')(io,app);

require('./config/passport')(passport);


app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(session({secret:'learningpassport', resave: true, saveUnitialized: true}))
app.use(session({cookie: { maxAge: 60 * 1000 }}));

 app.use(passport.initialize());
 app.use(passport.session()); // persistent login sessions
 app.use(flash());
 // routes

require('./app/routes.js')(app, passport);
app.get("*",function(req,res){
  res.redirect('/dangnhap')
})

server.listen(port);
 // app.listen(port);
 console.log('The magic happens on port ' + port);
