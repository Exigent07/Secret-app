require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const encrypt = require('mongoose-encryption');

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRETS, encryptedFields: ["passwords"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home")
});

app.get("/login", function(req, res) {
    res.render("login")
});

app.get("/register", function(req, res) {
    res.render("register")
});

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save()
    .then(() => {
        res.render("secrets");
    }).catch((err) => {
        console.log(err);
    });
});

app.post("/login", function(req, res) {
    const userName = req.body.username;
    const password = req.body.password;

    User.findOne({
        email: userName
    })
    .then((found) => {
        if (found) {
            if (found.password === password) {
                res.render("secrets");
                console.log("logged in!");
            } else {
                res.send("Invalid password");
            }
        } else {
            res.send("User not found");
        }
    }).catch((err) => {
        console.log(err);
        res.send("An error occurred");
    });
});


app.listen(3000, function() {
    console.log("Server Started!");
});

