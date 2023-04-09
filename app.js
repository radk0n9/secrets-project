require("dotenv").config();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { compareSync } = require("bcrypt");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: "djsald190djsakldj190djsk@",
    resave: false,
    saveUninitialized: true
}));

// Configutre passport-local-strategy
app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(new LocalStategy(User.authenticate()));

// Configure passport-google-strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://localhost:3000/auth/google/secrets"
},
function(accessToken, refreshToken, profile, cb){
    User.findOrCreate({googleId: profile.id}, function(err, user){
        return cb(err, user);
    });
}
));

// Serializer and deserialize User
passport.serializeUser(function(user, cb){
    process.nextTick(function(){
        cb(null, {id: user.id, username: user.username, name: user.name});
    });
});
passport.deserializeUser(function(user, cb){
    process.nextTick(function(){
        cb(null, {id: user.id, username: user.username, name: user.name});
    });
});

// Connect to mongoose DB
mongoose.connect("mongodb://localhost:27019/userDB").catch((err)=>{
    if (err){
        console.log("Could not connect to mongodb on localhost.");
    };
});

// Routes for all ejs
app.route("/")
    .get(function(req, res){
        res.render("home");
    })
    .post(function(req, res){
        console.log(req.params);
    });

app.get("/auth/google", 
    passport.authenticate("google", {scope: ["profile"]})
);

app.get("/auth/google/secrets",
    passport.authenticate("google", {failureRedirect: "/login"}),
    function(req, res){
        res.render("secrets");
    }
);

app.route("/secrets")
    .get(function(req, res){
        if (req.isAuthenticated()){
            res.render("secrets");
        }else{
            res.redirect("login");
        }
    });

app.route("/register")
    .get(function(req, res){
        res.render("register")
    })
    .post(function(req, res){
        User.register(new User({username: req.body.username}), req.body.password, function(err){
            if (err){
                console.log("Error while user register!", err);
                res.redirect("register");
            }else{
                console.log("User registered");
                res.redirect("/secrets");
            };
        }); 
    });

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })
    .post(passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), function(req, res){
        console.log("Success login:", req.body.username);
        res.redirect("/secrets");
    });

app.get("/logout", function(req, res){
        req.logout(function(err){
            if (err){
                console.log(err);
            }else{
                res.redirect("/");
            };
        });
    });

app.listen(port, function(){
    console.log("Server is running on port " + port);
});