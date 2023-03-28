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

// Configutre passport
app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(new LocalStategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Connect to mongoose DB
mongoose.connect("mongodb://localhost:27017/userDB").catch((err)=>{
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

app.route("/secrects")
    .get(function(req, res){
        if (req.isAuthenticated()){
            res.render("secrects");
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
                res.redirect("/secrects");
            };
        }); 
    });

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })
    .post(passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), function(req, res){
        res.redirect("/secrects");
    });

app.listen(port, function(){
    console.log("Server is running on port " + port);
});