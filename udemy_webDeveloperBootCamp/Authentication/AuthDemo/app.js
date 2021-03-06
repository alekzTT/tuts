var express                  = require("express"), 
    mongoose                 = require("mongoose"), 
    passport                 = require("passport"), 
    bodyParser               = require("body-parser"),
    LocalStrategy            = require("passport-local"), 
    passportLocalMongoose    = require("passport-local-mongoose");
    
var User = require("./models/user");

mongoose.connect("mongodb://localhost/auth_demo_app");

var app = express();
app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//before password session...... 
app.use(require("express-session")({
    secret:"webDevCamp",
    resave: false,
    saveUninitialized: false
}));
//we need these two lines every time we are going to use passport

app.use(passport.initialize());
app.use(passport.session());



//responsible for reading and encode - decode the session
//from password-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ROUTES
//=======================

app.get("/", function(req, res){
    res.render("home");
});

//check if user is loged in by writing a middleware
app.get("/secret", isLoggedIn,  function(req, res){
    res.render("secret");
});

//AUTH ROUTES
//show register/sign up Form
app.get("/register", function(req, res){
    res.render("register");
});

//take the info and then redirect
app.post("/register", function(req, res){
    //data => body parser
    req.body.username;
    req.body.password;
    //create new User passing only the username. We dont save the password in the database
    //so we pass the pass ;) as the second parameter to hash it and returns the new user
    User.register(new User({username : req.body.username}), req.body.password, function(err, user){
        if (err) {
            console.log(err);
            return res.render('register');
        }
        //if there is not an error
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secret");
        })
    });
});

//LOGIN ROUTES
app.get("/login", function(req, res) {
    res.render("login");
});

//middle - ware  == code that runs before our final callback function
//between the beggining of the route and the End of the Route
app.post("/login", passport.authenticate("local" ,
{
    successRedirect: "/secret",
    failureRedirect: "/login"
}),function(req, res) {
    
});

app.get("/logout", function(req, res){
    //destroy user's data in the session
    req.logout();
    //res.send("Log You out.");
    res.redirect("/");
    
});



//======================
//END OF ROUTES

//MidleWare to check loged in functionality
//standard for middleware (req, res, next)
//express knows what function to call "next"
//can call more than one middleware by next, next, next
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
      console.log(req.body.username+"Authenticated");
      return next();
  } else {
    console.log("ERROR in authentication");  
    res.redirect("/login");  
  }
    
};


app.listen(process.env.PORT, process.env.IP,function(){
    console.log("Server Started.........");
});




