
var WebSocketBlockChainInfo = require('./info/webSocket_blockchainInfo').WebSocketBlockChainInfo;
var Method1 = require('./methods/method1').Method1;
var Method2 = require('./methods/method2').Method2;
var Method3 = require('./methods/method3').Method3;
var WebInterface = require('./web/webInterface').WebInterface;
var Charts = require('./web/charts').Charts;
var InfoCharts = require('./web/infoCharts').InfoCharts;
var IndexPage = require('./web/indexPage').IndexPage;

function Api(withWebInterface){
  this.info=new WebSocketBlockChainInfo();
  this.method1=new Method1(this.info.processor);
  this.method2=new Method2(this.info.processor);
  this.method3=new Method3(this.info.processor);

  if(withWebInterface)
    this._generateWebInterface();

  this.historicalEstimations=[];
  var inter1=setInterval((function() {
    var recommended={ Method1: this.method1.getRecommendedMinFee(),
            Method2: this.method2.getRecommendedMinFee(),
            Method3: this.method3.getRecommendedMinFee(),
            Api: this.getRecommendedFee(),
            TimeBlock: this.info.processor.timeBlock
          };
    this.historicalEstimations.push(recommended);
  }).bind(this),60*1000);

};

Api.prototype.getHistoricalEstimations = function () {
  var info=[];
  var firstIndex=0;
  for (var i = 0; i < this.historicalEstimations.length; i++) {
    info[i]={ Method1: this.historicalEstimations[i].Method1,
              Method2: this.historicalEstimations[i].Method2,
              Method3: this.historicalEstimations[i].Method3,
              Api: this.historicalEstimations[i].Api,
              TimeBlock: this.historicalEstimations[i].TimeBlock
    };
    if(info[i].TimeBlock!=info[firstIndex].TimeBlock){
      var length=i-firstIndex;
      for (var j = 0; j < length; j++) {
        info[firstIndex+j].TimeBlock=info[firstIndex+j].TimeBlock+(j/length);
      }
      firstIndex=i;
    }
  }
  var length=i-firstIndex;
  for (var j = 0; j < length; j++) {
    info[firstIndex+j].TimeBlock=info[firstIndex+j].TimeBlock+(j/length);
  }
  firstIndex=i;

  return info;
};

Api.prototype.getMinFee = function (blockTime) {
  return { Method1: this.method1.estimateMinFee(blockTime),
          Method2: this.method2.estimateMinFee(blockTime),
          Method3: this.method3.estimateMinFee(blockTime)
        };
};

Api.prototype.getRecommendedFee = function (blockTime) {
  var recommended={ Method1: this.method1.getRecommendedMinFee(blockTime),
          Method2: this.method2.getRecommendedMinFee(blockTime),
          Method3: this.method3.getRecommendedMinFee(blockTime)
        };
  if(blockTime===undefined){
    var array=[];
    var length=Math.max(recommended.Method1.length,recommended.Method2.length,recommended.Method3.length);

    for (var i = 0; i < length; i++) {
      array[i]=calculateRecommendedFee(recommended.Method1[i],recommended.Method2[i],recommended.Method3[i]);
    }

    return array;
  }

  return calculateRecommendedFee(recommended.Method1,recommended.Method2,recommended.Method3);
};

function calculateRecommendedFee(method1,method2,method3){
  if(method3!==undefined
     && ( (method1!==undefined && method3>method1)
           && (method2!==undefined && method3>method2)
           || (method1===undefined && method2===undefined)
         )
      )
    return method3;
  if(method2!==undefined
      && ( (method1!==undefined && method2>method1)
            || method1===undefined
         )
      )
    return method2;
  return method1;
}

Api.prototype.getAccuracy = function () {
  var txsByBlock=this.info.processor.getConfirmTxArraysByBlock();
  var minArray=getMinForBlocks(txsByBlock);
  var historicalEstimations=this.getHistoricalEstimations();

  var overpayment=0;
  var correct=0;
  var fail=0;
  for (var i = 0; i < historicalEstimations.length; i++) {
    var timeBlock=Math.floor(historicalEstimations[i].TimeBlock);
    for (var j = 0; j < historicalEstimations[i].Api.length; j++) {
      var estimatedFee=historicalEstimations[i].Api[j];
      var realFee=minArray[(timeBlock+1+j).toString()]; //timeBlock+1 for not consider current mining block.

      if(estimatedFee!==undefined && realFee!==undefined){
        if(estimatedFee>realFee){
          correct++;
          overpayment+=estimatedFee-realFee;
        }
        else {
          fail++;
        }
      }
    }
  }
  return {
      percentage: correct/(correct+fail),
      total: correct+fail,
      meanOverpaymentInSuccess: overpayment/correct
    };
};

function getMinForBlocks(txsByBlock){
  var minArray={};
  for (var i = 0; i < txsByBlock.length; i++) {
    var min=undefined;
    var confirmBlock=undefined;
    for (var j = 0; j < txsByBlock[i].length; j++) {
      if(min===undefined || txsByBlock[i][j].feeBySize<min){
        min=txsByBlock[i][j].feeBySize;
        confirmBlock=txsByBlock[i][j].confirmBlock;
      }
    }
    if(confirmBlock!==undefined)
      minArray[confirmBlock.toString()]=min;
  }
  return minArray;
}


Api.prototype.getStats=function(){
  var stats=this.info.processor.getStats();
  var ans={
      TotalNroTx: stats.TotalNroTx,
      CurrentNroUtx: stats.CurrentNroUtx,
      NroBlocks: stats.NroBlocks,
      NroTxConfirmed: stats.NroTxConfirmed,
      InitialBlockHeight: this.info.processor.initialTimeBlock,
      CurrentBlockHeight: this.info.processor.timeBlock
    };
  return ans;
};

Api.prototype._generateWebInterface = function () {
  this.web=new WebInterface();

  this.web.addGet("/",undefined,(function(){return IndexPage(this);}).bind(this));


  this.web.addGet("getMinFee",undefined,(function(){return JSON.stringify(this.getMinFee());}).bind(this));
  this.web.addGet("getMinFee","blockTime",(function(blockTime){return JSON.stringify(this.getMinFee(blockTime));}).bind(this));

  this.web.addGet("getRecommendedFee",undefined,(function(){return JSON.stringify(this.getRecommendedFee());}).bind(this));
  this.web.addGet("getRecommendedFee","blockTime",(function(blockTime){return JSON.stringify(this.getRecommendedFee(blockTime));}).bind(this));

  this.web.addGet("getAccuracy",undefined,(function(){return JSON.stringify(this.getAccuracy());}).bind(this));

  this.web.addGet("charts",undefined,(function(){return Charts(this._getInfoCharts());}).bind(this));


  this.web.listen();
};

Api.prototype._getInfoCharts = function () {
  return InfoCharts(this);
};

module.exports=Api;
