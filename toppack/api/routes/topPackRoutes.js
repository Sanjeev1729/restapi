'use strict'
module.exports = function(app){
   var topPack = require('../controllers/topPackController')
    app.route('/repositories')
        .get(topPack.list_all_repositories);
    app.route('/downloadrepo')
        .get(topPack.download_repo);
    app.route('/getTopPackages')
        .get(topPack.topPackages)    
};