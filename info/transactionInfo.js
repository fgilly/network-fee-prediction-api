

function TransactionInfo(hash, size, inputs, outputs, timeBlock){
  this.txId=hash;
  this.txInputs=inputs;
  this.txOutputs=outputs;
  this.size=size;
  this.fee=undefined;
  this.generatedTimeBlock=timeBlock;
  this.confirmBlock=undefined;
  this.elapsedTimeBlock=undefined;
  this.feeBySize=undefined;
};


TransactionInfo.prototype.transactionInfoComplete = function(){
  var amount=0;
  for(var i=0;i<this.txInputs.length;i++){
    amount+=this.txInputs[i];
  }
  this.inputsAmount=amount;
  amount=0;
  for(var i=0;i<this.txOutputs.length;i++){
    amount+=this.txOutputs[i];
  }
  this.outputsAmount=amount;
  this.fee=this.inputsAmount - this.outputsAmount;

  this.feeBySize=this.fee/this.size;
};

TransactionInfo.prototype.transactionConfirm = function(confirmBlock){
  this.confirmBlock=confirmBlock;
  this.elapsedTimeBlock=this.confirmBlock-this.generatedTimeBlock;
};

module.exports.TransactionInfo=TransactionInfo;
