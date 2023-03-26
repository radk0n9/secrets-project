const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

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

const secret = "Thisismysecretcode";
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

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
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
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
                if (foundUser.password === password){
                    res.render("secrects");
                }else{
                    res.redirect("login");
                }
            };
        }).catch((error)=>{
            if (error){
                console.log(error);
            }
        })
    })

app.route("/secrects")
    .get(function(req, res){
        res.render("secrects")
    })

app.listen(port, function(){
    console.log("Server is running on port " + port);
});