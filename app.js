const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

var mongojs = require('mongojs');
const { stringify } = require("querystring");
global.db = mongojs("mongodb+srv://Vinay:Vinay@sharktank.kodai7z.mongodb.net/DataBase");

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://Vinay:Vinay@sharktank.kodai7z.mongodb.net/DataBase", {
useNewUrlParser: true,
useUnifiedTopology: true
});

const loginDetailsSchema = {
    userid: String,
    password: String
};


const portfolioSchema = {
idea: String,
demoVideoLink:String,
ask: Number,
equity:Number,
evaluation:Number,
mobileNumber:Number,
email:String,
interestedList:[String]
};

const usersSchema = {
    userName :String,
    mobileNumber : Number,
    email: String,
    password: String,
    confirmPassword:String,
    ideas:[String]
}


const LoginDetails = mongoose.model("LoginDetails", loginDetailsSchema);

const portfolio = mongoose.model("portfolio", portfolioSchema);

const Users = mongoose.model("Users", usersSchema);

app.set("view engine", "ejs");
app.engine('ejs', require('ejs').__express);


app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname + '/public'));

app.get("/",(req,res)=>{
    res.render("index");
})

app.get("/login",function(req,res){
    res.render("logIn");
})

app.get("/signup",function(req,res){
    res.render("signUp");
})

app.get("/portfolio", function(req, res){
	res.render("portfolio");
});

app.get("/profile",function(req,res){
     LoginDetails.find({_id: "63ef4f18d150e17c83d9d373",}).exec(function(err,docs){
        d= docs;
        res.doc;
        console.log("d",d[0]);
        uid = docs[0].userid;
        console.log("uid",uid);
        Users.findOne({email: uid},function(err,details){
                portfolio.find({email:uid},function(err,ports){
                    details.port=ports;
                    console.log("details",details);
                    console.log("ports",details.port);
                    //console.log("ports",ports);
                    //var z= [].concat(details,ports);
                    //console.log("z",z);
                    res.render("profile",{
                    userDetails : details
                })

            });
            
        });  
        });
    });
    




app.get("/find", function(req,res){
        portfolio.find({},function(err,ports){
        console.log("entered app data");
        //console.log("ports : ",ports);
        res.render("find",{
            portfolioList :ports
        });
    });
});

app.put("/find:id", (req,res)=>{
    
    console.log(req.params.id);

    LoginDetails.find({_id: "63ef4f18d150e17c83d9d373"}, function(err,ports){
        console.log("ports",ports[0].userid);
        var uid = ports[0].userid;
        portfolio.findOneAndUpdate(
            { _id:String(req.params.id), },
            { $addToSet: { interestedList: uid, }  ,}
        ).then(()=>{
            console.log("added successfully");
        });    
    });
});

/*app.post("/login",function(req,res){
    const uid = req.body.email;
    const psw = req.body.psw;
    console.log(uid);
    console.log(psw);
    const x=db.users.find( { email: uid } );
    console.log("x",x);
    res.redirect("/find");
})*/

app.post("/login",async function(req,res){
    let p=req.body.psw;
    const uid = req.body.email;

    /*const loginUser = new LoginDetails({
        userid: uid,
        password: p,
         });
    console.log(loginUser);
    loginUser.save();*/

    await LoginDetails.findOneAndUpdate(
        { _id: "63ef4f18d150e17c83d9d373", },
        { $set: { userid: uid,password: p, } ,}
    );
        


    Users.findOne({email: uid}).then((result)=>{
        if(result==null){
            res.send("Oops! Something went wrong.");
        }
        else{
            let x=result;
            console.log(x);
            console.log(x.email);
            console.log("psw",p);
            if(result.password===p){
                res.redirect("/find");
            }
            else{
                res.send("Oops! Something went wrong.");
            }

            }
        
    }).catch((err)=>{
        console.log(err);
    });

    /*
    Users.findById('63ef0d615423deead6e806c3').then((result)=>{
        let x=result;
        console.log(x);
        console.log(x.email);
        console.log("psw",p);
        if(result.password===p){
            res.redirect("/find");
        }
        else{
            res.send("Oops! Something went wrong.");
        }
    }).catch((err)=>{
        console.log(err);
    })*/
});



app.post("/signUp", function (req, res) {
	console.log(req.body.userName);
    const user = new Users({
    userName: req.body.userName,
    mobileNumber: req.body.mobileNumber,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
     });  
    console.log(user);
    user.save();
    res.redirect("/find");
}); 

app.post("/portfolio", async function (req, res) {
	console.log(req.body.idea);
    const port = new portfolio({
    idea: req.body.idea,
    ask: req.body.ask,
    equity: req.body.equity,
    evaluation: req.body.ask/req.body.equity,
    mobileNumber: req.body.mobileNumber,
    email: req.body.email,
    demoVideoLink: req.body.demoVideoLink
     });
    console.log(port);
    
    port.save();
 
    uid = req.body.email;
    console.log("email",uid);

    let pid =port._id;
    console.log("pid",pid);
    await Users.findOneAndUpdate(
        { email: uid, },
        { $push: { ideas: pid, } ,}
     );

    res.redirect("/find");
});

app.listen(8000, function(){
	console.log("App is running on Port 8000");
});
