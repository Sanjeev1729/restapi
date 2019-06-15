//'use export'
var axios = require('axios');
var keyword = "library";
var language = "javascript";
exports.list_all_repositories = function(req,res){
  var rawData;
  var url = "mongodb://localhost:27017/repo";
  var MongoClient = require('mongodb').MongoClient;
  const options = {
    method:"get",
    url:"https://api.github.com/search/repositories?q=language:javascript&topic=$keyword&sort=stars&order=desc",
}
console.log(options);
axios(options).then(function (response) {
   console.log('statusCode:', response.data); 
   rawData =  response.data.items;
   var obj = [];
   rawData.forEach(function(item){
      console.log("Repo Name "+item.full_name+" "+"Number of Forks"+item.forks+" "+"No of stars"+item.stargazers_count);
      obj.push({
        "Repo Name ":item.full_name,
        "Number of Forks" : item.forks,
        "No of stars" : item.stargazers_count,
        "url" : item.html_url
      })
   });
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log(err);
    db.collection("projects").insertOne({obj}, function(err, res) {
        if (err) throw err;
        console.log("Document inserted");
        db.close();
    });
});
}).catch(function (error) {
    console.log("An error occurred"+error);
});
return rawData;
};

exports.download_repo = function(){
  var Dburl = "mongodb://localhost:27017/dependency";
  var MongoClient = require('mongodb').MongoClient;
  var url = "https://api.github.com/repos/Sanjeev1729/surveyCenter";
  var newurl = url+"/contents/package.json";
  console.log(newurl);
  const options = {
    method:"get",
    url: newurl,
  }
axios(options).then(function (response) {
   var buff = new Buffer(response.data.content, 'base64');  
   var text = JSON.parse(buff.toString('ascii'));
   var dependency = text.dependencies;
   //console.log(dependency);
   var devDependency = text.devDependencies;
   //console.log(devDependency);
   var depArray = [
     "@angular/animations",
     "@angular/cdk",
     "@angular/common",
     "@angular/compiler",
     "tslint",
   //  "protractor",
   //  "ts-node",
  ]
   depArray.forEach(function(item){
    var self = this; 
    var q = item;
     if(dependency[item]!=""||devDependency[item]!=""){
   MongoClient.connect(Dburl, function(err, db) {
    if (err) throw err;
       //console.log(err);
    console.log(q);
    var query = q;
    db.collection("dependent").findOne({'type':query},function(err,succ){
      console.log(succ);
       if(!succ){
        var newquery = {
          type : query,
          count : 1
        } 
        console.log(q);
        db.collection("dependent").insertOne(newquery, function(err, res) {
          if (err) throw err;
          console.log("Document inserted");
          db.close();
      }); 
       }else{ 
        var myquery = { type: query };
        var newVal = JSON.parse(Number(succ.count))+1; 
        console.log(query+" "+newVal);
        var newvalues = { $set: {count:newVal} };
        db.collection("dependent").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        }); 
       }
    })
  }); 
}
   })
}).catch(function (error) {
    console.log("Package.json file not found"+error);
});
}

exports.topPackages = function(){
  var Dburl = "mongodb://localhost:27017/dependency";
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(Dburl, function(err, db) {
    if (err) throw err;
    else{
      db.collection("dependent").find().toArray(function(err,succ){
         //console.log(succ);
         var sorted = [];
         sorted = succ.sort(function(a, b) {
           return (a.count > b.count) ? 1 : ((b.count > a.count) ? -1 : 0)
         });
         console.log(sorted);
    });
  }
  });
}