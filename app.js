require("dotenv").config();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
// const md5 = require("md5");
// const encrypt = require("mongoose-encryption");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET_KEY, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.route("/")
    .get(function(req, res){
        res.render("home");
    })
    .post(function(req, res){
        console.log(req.params);
    });

app.route("/register")
    .get(function(req, res){
        res.render("register")
    })
    .post(function(req, res){
        bcrypt.hash(req.body.password, saltRounds, function(err, hash){
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            newUser.save().then((message)=>{
                if (message){
                    res.render("secrects");
                };
            }).catch((error)=>{
                if (error){
                    console.log(error);
                };
            });
        })  
    });

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })
    .post(function(req, res){
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username}).then((foundUser)=>{
            if (foundUser){
                bcrypt.compare(password, foundUser.password, function(err, result){
                    if (result){
                        res.render("secrects");
                    }else{
                        res.redirect("login");
                    };
                })                    
            };
        }).catch((error)=>{
            if (error){
                console.log(error);
            };
        });
    });

app.route("/secrects")
    .get(function(req, res){
        res.render("secrects")
    });

app.listen(port, function(){
    console.log("Server is running on port " + port);
});