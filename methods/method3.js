
function Method3(processor){
  this._processor=processor;
};

Method3.prototype.getRecommendedMinFee = function (blockTime){
  return this.estimateMinFee(blockTime);
};


Method3.prototype.estimateMinFee = function (blockTime){
  if(blockTime===undefined || blockTime===null){
    return this._calculateMinFee();
  }else {
    var min=this._calculateMinFee();
    return min[blockTime];
  }
};

Method3.prototype._calculateMinFee = function (){
  var utxs=this._processor.getUnconfirmTxArray();
  utxs.sort(compareFee);
  var minFee=getMinFeeForBlock(utxs);
  return minFee;
};

var MAX_SIZE_BLOCK=750000;
function getMinFeeForBlock(utxs){
  var minFee=[];
  var currentBlockSize=0;
  var index=1;
  var lastFee=0;
  for (var i = 0; i < utxs.length; i++) {
      var tx=utxs[i];
      if(currentBlockSize+tx.size>MAX_SIZE_BLOCK){
        minFee[index]=lastFee;
        index++;
        currentBlockSize=0;
      }
      currentBlockSize+=tx.size
      lastFee=tx.feeBySize;
  }
  minFee[index]=lastFee;

  return minFee;
}

//Sort: first by time block ascending, second by fee per byte descending
function compareFee(tx1,tx2){
    return tx2.feeBySize-tx1.feeBySize; //Desc by fee
};


module.exports.Method3=Method3;
