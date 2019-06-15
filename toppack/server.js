var express = require('express');
var app = express();
var port = 3000;
var routes = require('./api/routes/topPackRoutes');
routes(app);
app.listen(port,function(){
      console.log("Connected to the server");   
})