
function Method2(processor){
  this._processor=processor;
  this.feeSizeClass=1;
};

Method2.prototype.getRecommendedMinFee = function (blockTime){
  var min=this._calculateMinFee();
  var array=[];
  for (var i = 0; i < min.length; i++) {
    if(min[i]===undefined)
      continue;

    array[i]=min[i][0].feeClass;
  }
  if(blockTime===undefined || blockTime===null){
    return array;
  }else {

    return array[blockTime];
  }
};


Method2.prototype.estimateMinFee = function (blockTime){
  if(blockTime===undefined || blockTime===null){
    return this._calculateMinFee();
  }else {
    var min=this._calculateMinFee();
    return min[blockTime];
  }
};

Method2.prototype._calculateMinFee = function (){
  var txsByBlock=this._processor.getConfirmTxArraysByBlock();
  var txs=[];
  for (var i = 0; i < txsByBlock.length; i++) {
    txs=txs.concat(txsByBlock[i]);
  }

  var minFee=getMinFee(txs,this.feeSizeClass);

  return minFee;
};

function getMinFee(txs,feeSizeClass) {
  var arrayOfFeeClasses=generateArrayOfFeeClasses(txs,feeSizeClass);

  var arrayElapsedTime=generateArrayElapsedTime(arrayOfFeeClasses,feeSizeClass);

  for (var i = 0; i < arrayElapsedTime.length; i++) {
    if(arrayElapsedTime[i]!==undefined){
      arrayElapsedTime[i].sort(compareItemProbabilityAndFee);

    }
  }

return arrayElapsedTime;
}

//Classify transactions by fee in fee classes.
function generateArrayOfFeeClasses(txs,feeSizeClass) {
  var array={};
  for (var i = 0; i < txs.length; i++) {
    var tx=txs[i];
    var feeClass=getFeeClass(tx.feeBySize,feeSizeClass);
    if(array[feeClass.toString()]===undefined){
      array[feeClass.toString()]=[];
    }
    if(array[feeClass.toString()][tx.elapsedTimeBlock]===undefined){
      array[feeClass.toString()][tx.elapsedTimeBlock]=0;
    }
    array[feeClass.toString()][tx.elapsedTimeBlock]++;
  }
  return array;
}

function getFeeClass(feeBySize,feeSizeClass) {
  return Math.ceil(feeBySize/feeSizeClass);
}

//Classify fee classes by elapsedTimeBlock
function generateArrayElapsedTime(arrayOfFeeClasses,feeSizeClass) {
  var arrayElapsedTime=[];
  var countForElapsedTime=[];
  for (var feeClass in arrayOfFeeClasses) {
    if (arrayOfFeeClasses.hasOwnProperty(feeClass) && arrayOfFeeClasses[feeClass]!==undefined) {
      var feeArray=arrayOfFeeClasses[feeClass];
      for (var elapsedTimeBlock = 0; elapsedTimeBlock < feeArray.length; elapsedTimeBlock++) {
        if(feeArray[elapsedTimeBlock]!==undefined){
          if(countForElapsedTime[elapsedTimeBlock]===undefined)
            countForElapsedTime[elapsedTimeBlock]=0;
          countForElapsedTime[elapsedTimeBlock]+=feeArray[elapsedTimeBlock];
        }
      }
    }
  }
  for (var feeClass in arrayOfFeeClasses) {
    if (arrayOfFeeClasses.hasOwnProperty(feeClass) && arrayOfFeeClasses[feeClass]!==undefined) {
      var feeArray=arrayOfFeeClasses[feeClass];
      var count=0;
      for (var elapsedTimeBlock = 0; elapsedTimeBlock < feeArray.length; elapsedTimeBlock++) {
        if(feeArray[elapsedTimeBlock]!==undefined)
          count+=feeArray[elapsedTimeBlock];
      }
      var feeClassFloat=parseFloat(feeClass);
      for (var elapsedTimeBlock = 0; elapsedTimeBlock < feeArray.length; elapsedTimeBlock++) {
        if(feeArray[elapsedTimeBlock]!==undefined){
          if(arrayElapsedTime[elapsedTimeBlock]===undefined)
            arrayElapsedTime[elapsedTimeBlock]=[];
          var item={};
          item.feeClass=feeClassFloat*feeSizeClass;
          //item.probabilityInBucket=feeArray[elapsedTimeBlock]/count;
          //item.probabilityInElapsedTime=feeArray[elapsedTimeBlock]/countForElapsedTime[elapsedTimeBlock];
          //item.probability=item.probabilityInElapsedTime;*item.probabilityInBucket;
          item.probability=feeArray[elapsedTimeBlock]/countForElapsedTime[elapsedTimeBlock];
          arrayElapsedTime[elapsedTimeBlock].push(item);
        }
      }

    }
  }
  return arrayElapsedTime;
}

//Sort first by probability descending and second by fee ascending.
function compareItemProbabilityAndFee(a,b){
  if(b.probability==a.probability){
    return a.feeClass-b.feeClass;
  }
  return b.probability-a.probability;
}

module.exports.Method2=Method2;
