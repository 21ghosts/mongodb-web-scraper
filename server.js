const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

var path = require("path");
mongoose.Promise = require('bluebird');


var app = express();


app.use(express.static("public"));


var connection = require("./config/connection.js");
app.use(bodyParser.urlencoded({ extended: false }));


const Article = require("./models/article.js");
const User = require("./models/user.js");
const Comment = require("./models/comment.js");

app.get('/', function(req, res){
    res.sendFile('index.html')
});

// Routes
app.get("/scrape", (req, res) => {
    request("https://www.nytimes.com/", (error, response, html) => {
        var $ = cheerio.load(html);
        var enList = [];
        var i = 0;
        var p = Promise.resolve();
        $("article.story").each((i, element) => {
            
            p = p.then(function () {
                var result = {};
                result.headline = $(element).find("h1.story-heading").text().trim() ||
                    $(element).find("h2.story-heading").text().trim() ||
                    $(element).find("h3.story-heading").text().trim();
                result.summary = $(element).children("p.summary").text().trim() || ""
                result.url = $(element).find("a").attr("href") || $(element).children("a.story-link");
                var entry = new Article(result);
                // save to db
                return new Promise(function (resolve, reject) {
                    entry.save((err, doc) => {
                        if (err) {
                            if (err.code === 11000) {
                                Article.findOne({ "headline": result.headline })
                                    .populate("comments")
                                    .exec((err, doc) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            if (doc != null) {
                                                enList.push(doc);
                                            }
                                        }
                                        resolve();
                                    })
                            }
                            else {
                                console.log("ERROR SAVING ARTICLE: " + err)
                                resolve();
                            }
                        }
                     
                        else {
                            if (entry != null) {
                                enList.push(entry);
                            }
                            resolve();
                        }
                    });
                });
            });
        });
        p.then(() => res.send(enList)).catch((err) => console.log(err))
    
    });

});

app.post("/write", function (req, res) {
    console.log(req.body)
    var comment = new Comment(req.body);
    comment.save((err, commentDoc) => {
        if (err) {
            console.log(err)
            if (err.code === 11000) {
                res.send("Sorry, we couldn't submit your comment! Please make sure you've filled out both of the boxes before clicking the submit button.")
            }
            res.send("Sorry, something went wrong with submitting your comment! Please fill out the fields and try again.")
        }
        else {
            
            Article.findByIdAndUpdate(
                { "_id": req.body.article },
                { "$push": { "comments": commentDoc._id } },
                { "new": true },
                function (err, articleDoc) {
                    if (err) {
                        console.log(err);
                        res.send("Sorry, we can't seem to find that article! Please refresh and try commenting again.")
                    } else {
                        res.send(articleDoc);
                    }
                }
            )
        }
    })
});

app.get("/comments", function (req, res) {
    res.sendFile(path.join(__dirname, "./public/comments.html"));
});

app.get("/api/comments", function (req, res) {
    Comment.find({})
        .populate("article")
        .exec((err, doc) => {
            res.send(doc);
        });
});

//listen on port 3000
app.listen(process.env.PORT || 3000,() => console.log("App running!"));