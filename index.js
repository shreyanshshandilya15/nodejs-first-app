// import http from "http";
// import lovepercent from "./features.js";
// import fs, { readFileSync } from "fs";

// const home=readFileSync("./index.html");
// console.log(home);
// console.log(lovepercent());
// const server=http.createServer((req,res)=>{
//     if(req.url=="/"){
//        res.end(home);
//     }else if(req.url=="/about"){
//         res.end(`<h1>Love is ${lovepercent()}</h1>`);
//     }else if(req.url=="/contact"){
//         res.end("<h1>contact page</h1>");
//     }else{
//         res.end("<h1>not found</h1>")
//     }
// })

// server.listen(5000,()=>{
//     console.log("server is running!");
// })

import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import  Jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://localhost:27017",{
         dbName:"Backend"
})
.then(()=>console.log("database connected !!"))
.catch((e)=>console.log(e));

const messageschema= new mongoose.Schema({
    name:String,
    email:String
});

const userschema=new mongoose.Schema({
    name:String,
    email:String,
    password:String
});

const User=mongoose.model("User",userschema);

const Message=mongoose.model("Message",messageschema);

const app=express();
const users=[];

app.use(express.static(path.join(path.resolve(),"public")));
//middleware to access data received from form.
app.use(express.urlencoded({extended:true}));

//middleware to access all the cookies
app.use(cookieParser());
//always needed to write
app.set("view engine","ejs");

// app.get("/success",(req,res)=>{
//     res.render("success");
// })

// app.get("/add",(req,res)=>{
//     Message.create({name:"shreyansh",email:"yours30@gmail.com"})
//     .then(()=>{
//         res.send("Nice");
//     })
// });

// app.get("/users",(req,res)=>{
//     res.json({
//         users,
//     })
// });


//use async await in place of tehn and catch in order to get the code clean
// app.post("/contact",async (req,res)=>{
//     // console.log(req.body.name);
    
//     // users.push({username:req.body.name,email:req.body.email});
//     const {name,email}=req.body;
//     await Message.create({name,email});
//     res.redirect("/success");
// });

const isAuthenticated=async (req,res,next)=>{
      const {token}=req.cookies;
      
      if(token){

        const decoded=Jwt.verify(token,"abcdefghijklmnopqrstuvwxyz");
        req.user=await User.findById(decoded._id);
        
        next();
      }else{
        res.redirect("/login");
      }
}
app.get("/",isAuthenticated,(req,res)=>{
       console.log(req.user);
       res.render("logout",{name:req.user.name});
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",async (req,res)=>{
    const {email,password}=req.body;

    let user = await User.findOne({email});
    if(!user){
        return res.redirect("/register");
    }  
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch) return res.render("login",{email,message:"Incorrect password !"});
    const token=Jwt.sign({_id:user._id},"abcdefghijklmnopqrstuvwxyz");

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/");
})

app.post("/register",async (req,res)=>{
    const {name,email,password}=req.body;
    
    let user=await User.findOne({email});
    if(user){
        return res.redirect("/login");
    }
    const hashedPassword=await bcrypt.hash(password,10);
    user= await User.create(
        {
            name:name,
            email:email,
            password:hashedPassword,
        });

    const token=Jwt.sign({_id:user._id},"abcdefghijklmnopqrstuvwxyz");

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/");
});

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now()),
    })
    res.redirect("/");
});

app.listen(5000,()=>{
    console.log("Server is running!");
})

// app.get("/",(req,res)=>{
//      res.sendFile("index.html");
//     // res.sendFile(path.resolve(),"index.html");
//     //  res.sendFile(path.resolve());
//     //  res.render("index",{name:"shreyansh"});
//     //  what if our app is also from nodejs ?
//     //  const pathlocation=path.resolve();
//     //  console.log(path.join(pathlocation,"nice"));
//     //  res.sendFile(path.join(pathlocation,"./index.html"));
//     // res.status(200).send("meri marzi");
    
//     //while using anything whose frontend framework is different
//     // res.json({
//     //     success:true,
//     //     products:[]
//     // })
// })

