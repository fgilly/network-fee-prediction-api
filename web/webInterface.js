var express = require('express');

function WebInterface() {
  this.app = express();

}

WebInterface.prototype.listen = function () {
  this.server = this.app.listen(8081, (function () {

            var host = this.server.address().address;
            var port = this.server.address().port;
            console.log("API listening at http://%s:%s", host, port);

          }).bind(this));
};

WebInterface.prototype.addGet = function (method,param,resCallback) {
  var url='/'+method;
  if(param!==undefined)
    url+='/:'+param;

  this.app.get(url, function (req, res) {
     res.end(resCallback(req.params[param]));
  });

};


module.exports.WebInterface=WebInterface;
