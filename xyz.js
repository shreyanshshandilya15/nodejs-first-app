const isAuthenticated=async (req,res,next)=>{
    const {token}=req.cookies;
    
    if(token){

      const decoded=Jwt.verify(token,"abcdefghijklmnopqrstuvwxyz");
      req.user=await User.findById(decoded._id);
      
      next();
    }else{
      res.render("login");
    }
}
app.get("/login",isAuthenticated,(req,res)=>{
     console.log(req.user);
     res.render("logout");
});

app.post("/login",async (req,res)=>{
  // const {name,email}=req.body;
  const user= await User.create({name:req.body.name,email:req.body.email});
  const token=Jwt.sign({_id:user._id},"abcdefghijklmnopqrstuvwxyz");

  res.cookie("token",token,{
      httpOnly:true,
      expires:new Date(Date.now()+60*1000)
  });
  res.render("logout");
});

app.get("/logout",(req,res)=>{
  res.cookie("token",null,{
      httpOnly:true,
      expires:new Date(Date.now()),
  })
  res.render("login");
})
