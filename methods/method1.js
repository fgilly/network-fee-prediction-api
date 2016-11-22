
function Method1(processor){
  this._processor=processor;
};

Method1.prototype.getRecommendedMinFee = function (blockTime){
  var min = this._calculateMinFee();
  var array=[];
  for (var i = 0; i < min.length; i++) {
    if(min[i]===undefined)
      continue;

    if((min[i].max-min[i].mean)>(min[i].mean-min[i].min)){
      array[i]=min[i].mean;
    }
    else {
      array[i]=min[i].max;
    }
  }

  if(blockTime===undefined || blockTime===null){
    return array;
  }else {
    return array[blockTime];
  }
};

Method1.prototype.estimateMinFee = function (blockTime){
  if(blockTime===undefined || blockTime===null){
    return this._calculateMinFee();
  }else {
    var min=this._calculateMinFee();
    return min[blockTime];
  }
};

Method1.prototype._calculateMinFee=function (){
  var txsByBlock=this._processor.getConfirmTxArraysByBlock();
  var minForBlocksTime=[]; //Array de stats para cada tiempo.
  for (var i = 0; i < txsByBlock.length; i++) {
    var minArray=this._getMinForBlocksTime(txsByBlock[i]);
    for (var j=0;j<minArray.length;j++){
      if(minArray[j]!==undefined){
        if(minForBlocksTime[j]===undefined){
          minForBlocksTime[j]={};
          minForBlocksTime[j].max=minArray[j];
          minForBlocksTime[j].mean=minArray[j];
          minForBlocksTime[j].count=1;
          minForBlocksTime[j].min=minArray[j];
        }else {
          minForBlocksTime[j].max=Math.max(minForBlocksTime[j].max,minArray[j]);
          minForBlocksTime[j].mean+=minArray[j];
          minForBlocksTime[j].count++;
          minForBlocksTime[j].min=Math.min(minForBlocksTime[j].min,minArray[j]);
        }
      }
    }
  }
  for(var i=0;i<minForBlocksTime.length;i++){
    if(minForBlocksTime[i]!==undefined)
      minForBlocksTime[i].mean=minForBlocksTime[i].mean/minForBlocksTime[i].count;
  }
  return minForBlocksTime;
};

Method1.prototype._getMinForBlocksTime=function (txsByBlock){
  var minArray=[];
  txsByBlock.sort(compareBlockTimeAndFee);
  var currentBlockTime=0;
  for(var i=0;i<txsByBlock.length;i++){
    var tx=txsByBlock[i];
    if(currentBlockTime<tx.elapsedTimeBlock){
      minArray[tx.elapsedTimeBlock]=tx.feeBySize;
      currentBlockTime=tx.elapsedTimeBlock;
    }
  }
  return minArray;

};

//Sort: first by time block ascending, second by fee per byte ascending
function compareBlockTimeAndFee(tx1,tx2){
  if(tx1.elapsedTimeBlock==tx2.elapsedTimeBlock){
    return tx1.feeBySize-tx2.feeBySize; //Asc by fee
  }
  else {
    return tx1.elapsedTimeBlock-tx2.elapsedTimeBlock; //Asc by time block
  }
};

module.exports.Method1=Method1;
