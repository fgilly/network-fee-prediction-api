

var WebSocketClient=require('websocket').client;
var TransactionInfo=require('./transactionInfo').TransactionInfo;

function WebSocketBlockChainInfo(){
  this._ws=new WebSocketClient();
  this.processor=new Processor();
  this.initConnection(this.processor.initialMessages,(this.processor.processMessage).bind(this.processor));
};

WebSocketBlockChainInfo.prototype.initConnection=function (initialMessages,messageCallback){
  this._ws.on('connectFailed', function(error) {
    //  console.log('Connect Error: ' + error.toString());
  });
  this._ws.on('connect', function(connection) {
    //  console.log('WebSocket Client Connected');
      connection.on('error', function(error) {
      //    console.log("Connection Error: " + error.toString());
      });
      connection.on('close', function() {
    //      console.log('echo-protocol Connection Closed');
      });
      connection.on('message', function(message) {
          if (message.type === 'utf8') {
      //        console.log("Received: '" + message.utf8Data + "'");
              messageCallback(message.utf8Data);
          }
      });

      var sendMsg=function(msg){
        connection.sendUTF(msg);
      }
      initialMessages(sendMsg);
    });

  this._ws.connect('wss://ws.blockchain.info/inv');
};



function Processor(){
  this.arrayUTx={};
  this.arrayTxConfirmedByBlock=[];
  this.initialTimeBlock=null;
  this.timeBlock=null;
  this.stats={
    TotalNroTx: 0,
    CurrentNroUtx: 0,
    NroBlocks: 0,
    NroTxConfirmed: 0
  };
};

Processor.prototype.initialMessages = function (sendMsg) {
  sendMsg('{"op":"ping_block"}'); //get last  block;
  sendMsg('{"op":"unconfirmed_sub"}'); //subscribe for news transactions;
  sendMsg('{"op":"blocks_sub"}'); //subscribe for news blocks;

  var inter1=setInterval(function(){
    sendMsg('{"op":"ping"}'); // Keep alive connection;
  },25*1000);
};

Processor.prototype.processMessage=function(text){
  var message = JSON.parse(text);
  switch(message.op){
    case "utx":
      this.processTx(message.x);
      break;
    case "block":
      this.processBlock(message.x);
      break;
  }
};


Processor.prototype.processTx=function(message){
  /*
  message.tx_index;
  message.size;
  message.hash;
  message.inputs[].prev_out.value;
  message.out[].value;
  */
  if(this.timeBlock==null)
    return;

  var inputs=[];
  for(var i=0;i<message.inputs.length;i++){
    if(message.inputs[i]!==undefined)
      inputs.push(message.inputs[i].prev_out.value);
  }
  var outputs=[];
  for(var i=0;i<message.out.length;i++){
    if(message.out[i]!==undefined)
      outputs.push(message.out[i].value);
  }

  this.arrayUTx[message.tx_index.toString()]=new TransactionInfo(message.hash,
    message.size, inputs, outputs, this.timeBlock);
  this.arrayUTx[message.tx_index.toString()].transactionInfoComplete();

  this.stats.TotalNroTx++;
  this.stats.CurrentNroUtx++;
};

Processor.prototype.processBlock=function (message){
  /*
  message.height;
  message.hash;
  message.txIndexes[]; //array de valores.
  */
  if(this.initialTimeBlock===null)
    this.initialTimeBlock=message.height;
  this.timeBlock=message.height;

  this.stats.NroBlocks++;

  var arrayForBlock=[];
  for (var i=0;i<message.txIndexes.length;i++) {
    var txIndex=message.txIndexes[i];
    var tx=this.arrayUTx[txIndex.toString()];
    this.arrayUTx[txIndex.toString()]=undefined;
    if (tx!==undefined) {
      tx.transactionConfirm(message.height);
      arrayForBlock.push(tx);

      this.stats.NroTxConfirmed++;
      this.stats.CurrentNroUtx--;
    }
  }
  this.arrayTxConfirmedByBlock.push(arrayForBlock);


};

Processor.prototype.getUnconfirmTxArray=function (){
  var utxs2=[];
  for (var prop in this.arrayUTx) {
    if (this.arrayUTx.hasOwnProperty(prop) && this.arrayUTx[prop]!==undefined) {
      utxs2.push(this.arrayUTx[prop]);
    }
  }
  return utxs2;
};

Processor.prototype.getConfirmTxArraysByBlock=function (){
    return this.arrayTxConfirmedByBlock;
};

Processor.prototype.getStats=function(){
  return this.stats;
};

module.exports.WebSocketBlockChainInfo=WebSocketBlockChainInfo;
