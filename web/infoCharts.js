

var methodCharts=[
  meanFeeVsBlock,
  minFeeForElapsedTimeBlock,
  histogramFee,
  function (api) {return estimateFeeForElapsedTimeBlock(api,"Api");},
  function (api) {return estimateFeeForElapsedTimeBlock(api,"Method1");},
  function (api) {return estimateFeeForElapsedTimeBlock(api,"Method2");},
  function (api) {return estimateFeeForElapsedTimeBlock(api,"Method3");}
];

function InfoCharts(api) {
  var array=[];
  for (var i = 0; i < methodCharts.length; i++) {
    array[i]=methodCharts[i](api);
  }

  return array;
}

function histogramFee(api){
  var info=api.info;

  var feeSizeClass=1;

  var txsByBlock=info.processor.getConfirmTxArraysByBlock();
  var txsConfirmed=[];
  for (var i = 0; i < txsByBlock.length; i++) {
    txsConfirmed=txsConfirmed.concat(txsByBlock[i]);
  }
  if(txsConfirmed.length>=3)
    txsConfirmed=removeOutliers(txsConfirmed);

  var utxs=info.processor.getUnconfirmTxArray();
  if(utxs.length>=3)
    utxs=removeOutliers(utxs);

  var txsConfirmedFeeClasses=generateArrayOfFeeClasses(txsConfirmed,feeSizeClass);
  var utxsFeeClasses=generateArrayOfFeeClasses(utxs,feeSizeClass);

  var dataChart={};
  for (var feeClass in txsConfirmedFeeClasses) {
    if (txsConfirmedFeeClasses.hasOwnProperty(feeClass) && txsConfirmedFeeClasses[feeClass]!==undefined) {
        if(dataChart[feeClass]===undefined)
          dataChart[feeClass]={};
        dataChart[feeClass].txsConfirmed=txsConfirmedFeeClasses[feeClass];
    }
  }
  for (var feeClass in utxsFeeClasses) {
    if (utxsFeeClasses.hasOwnProperty(feeClass) && utxsFeeClasses[feeClass]!==undefined) {
        if(dataChart[feeClass]===undefined)
          dataChart[feeClass]={};
        dataChart[feeClass].utxs=utxsFeeClasses[feeClass];
    }
  }

  var infoChart={};
  infoChart.title="Fee Distribution";
  infoChart.description="Histograma realizado con intervalos de 1 satoshi/byte.";
  infoChart.id="histogramFee";
  infoChart.xlabel="fee by size [satoshis/byte]";
  infoChart.ylabel="count of transactions";

  infoChart.data={};
  infoChart.data.xserie="x";
  infoChart.data.series=[];

  for (var feeClass in dataChart) {
    if (dataChart.hasOwnProperty(feeClass)) {
      addSerieData(infoChart,0,"x",undefined,parseFloat(feeClass));
      addSerieData(infoChart,1,"txsConfirmed",undefined,dataChart[feeClass].txsConfirmed);
      addSerieData(infoChart,2,"utxs",undefined,dataChart[feeClass].utxs);
    }
  }

  infoChart.type={
    typeChart:"bar",
    groups:["txsConfirmed","utxs"]
  };


  return infoChart;
}

function removeOutliers(array) {
  array=array.sort(compareFee);

  var medianIndex=getMedianIndex(array.length);
  var medianIndexFloor=Math.floor(medianIndex);
  var q1Index=getMedianIndex(medianIndexFloor);
  var q3Index=getMedianIndex(array.length-(medianIndexFloor+1))+(medianIndexFloor+1);

  var q1=getElementArray(array,q1Index);
  var q3=getElementArray(array,q3Index);

  var iqr=q3-q1;
  var distance=1.5*iqr;
  for (var i = array.length-1; i >= 0 ; i--) {
    if(array[i].feeBySize < q1-distance || array[i].feeBySize > q3+distance)
      array.splice(i,1);
  }
  return array;
}
function getElementArray(array,index) {
  var indexFloor=Math.floor(index);
  if((index-indexFloor)<0.6 && (index-indexFloor)>0.4)
    return (array[indexFloor].feeBySize+array[indexFloor+1].feeBySize)/2;
  else{
    return array[index].feeBySize;
  }
}
function getMedianIndex(length) {
    return (length+1)/2-1;
}

function compareFee(a,b){
  return a.feeBySize-b.feeBySize;
}

//Classify transactions by fee in fee classes.
function generateArrayOfFeeClasses(txs,feeSizeClass) {
  var array={};
  for (var i = 0; i < txs.length; i++) {
    var tx=txs[i];
    var feeClass=getFeeClass(tx.feeBySize,feeSizeClass);
    if(array[feeClass.toString()]===undefined){
      array[feeClass.toString()]=0;
    }
    array[feeClass.toString()]++;
  }
  return array;
}

function getFeeClass(feeBySize,feeSizeClass) {
  return Math.ceil(feeBySize/feeSizeClass);
}



function estimateFeeForElapsedTimeBlock(api,name){
  var info=api.getHistoricalEstimations();

  var times=[];

  for (var i = 0; i < info.length; i++) {
    times[i]=getElapsedBlockTimeByTime(info[i]);
  }

  var infoChart={};
  infoChart.title="Estimate Fee("+name+") For Elapsed Time Block";
  infoChart.description="Estimaciones realizadas al momento de cada bloque."
    + " El color indica la cantidad de bloques que se debe esperar a partir del momento de la estimación"
    + " para que se confirme la transacción.";
  infoChart.id="estimateFeeForElapsedBlockTime"+name;
  infoChart.xlabel="Time in Blocks";
  infoChart.ylabel="fee by size [satoshis/byte]";

  infoChart.data={};
  infoChart.data.xserie='x';
  infoChart.data.series=[];

  for (var i = 0; i < times.length; i++) {
    for (var j = 0; j < times[i].length; j++) {
      addSerieData(infoChart,0,"x",i,times[i][j].TimeBlock);
/*
      addSerieData(infoChart,4*j+1,"Api"+" - "+j.toString(),i,times[i][j].Api);
      addSerieData(infoChart,4*j+2,"Method1"+" - "+j.toString(),i,times[i][j].Method1);
      addSerieData(infoChart,4*j+3,"Method2"+" - "+j.toString(),i,times[i][j].Method2);
      addSerieData(infoChart,4*j+4,"Method3"+" - "+j.toString(),i,times[i][j].Method3);
      */
      addSerieData(infoChart,j,name+" - "+j.toString(),i,times[i][j][name]);
    }
  }

  return infoChart;
}

function getElapsedBlockTimeByTime(estimation) {
  var estimations=[];

  var length=Math.max(estimation.Api.length, estimation.Method1.length,
                estimation.Method2.length, estimation.Method3.length);
  for (var j = 0; j < length; j++) {
    estimations[j]={
      Method1: estimation.Method1[j],
      Method2: estimation.Method2[j],
      Method3: estimation.Method3[j],
      Api: estimation.Api[j],
      TimeBlock: estimation.TimeBlock
    };
  }

  return estimations;
}


function minFeeForElapsedTimeBlock(api){
  var info=api.info;

  var txsByBlock=info.processor.getConfirmTxArraysByBlock();
  var initialTimeBlock=info.processor.initialTimeBlock;
  var blocks=[];
  for (var i = 0; i < txsByBlock.length; i++) {
    blocks[i]=getElapsedBlockTimeByBlock(txsByBlock[i]);
  }

  var infoChart={};
  infoChart.title="Min Fee For Elapsed Time Block";
  infoChart.description="En cada bloque se buscan los mínimos fee de entre las"
    +" transacciones para cada tiempo de espera."
    +" Cada color representa un tiempo de espera en bloques.";
  infoChart.id="minFeeForElapsedBlockTime";
  infoChart.xlabel="Block";
  infoChart.ylabel="fee by size [satoshis/byte]";

  infoChart.data={};
  infoChart.data.xserie='x';
  infoChart.data.series=[];

  for (var i = 0; i < blocks.length; i++) {
    addSerieData(infoChart,0,"x",i,i+initialTimeBlock);
    for (var j = 0; j < blocks[i].length; j++) {
      addSerieData(infoChart,j+1,j.toString(),i,blocks[i][j]);
    }
  }

  return infoChart;
}

function getElapsedBlockTimeByBlock(blockInfo) {
  var minFee=[];
  for (var i = 0; i < blockInfo.length; i++) {
    var tx=blockInfo[i];
    if(minFee[tx.elapsedTimeBlock]===undefined || tx.feeBySize<minFee[tx.elapsedTimeBlock])
      minFee[tx.elapsedTimeBlock]=tx.feeBySize;
  }
  return minFee;
}


function meanFeeVsBlock(api) {
  var info=api.info;

  var txsByBlock=info.processor.getConfirmTxArraysByBlock();
  var initialTimeBlock=info.processor.initialTimeBlock;
  var array=[];
  for (var i = 0; i < txsByBlock.length; i++) {
    array[i]=getStatsByBlock(txsByBlock[i]);
  }

  var infoChart={};
  infoChart.title="Fee Vs Block";
  infoChart.description="Para cada bloque muestra el máximo, el promedio y el mínimo fee de entre sus transacciones.";
  infoChart.id="meanFeeVsBlock";
  infoChart.xlabel="Block";
  infoChart.ylabel="fee by size [satoshis/byte]";

  infoChart.data={};
  infoChart.data.xserie='x';
  infoChart.data.series=[];

  for (var i = 0; i < array.length; i++) {
    addSerieData(infoChart,0,"x",i,i+initialTimeBlock);
    addSerieData(infoChart,1,"min",i,array[i].min);
    addSerieData(infoChart,2,"mean",i,array[i].mean);
    addSerieData(infoChart,3,"max",i,array[i].max);
  }

  return infoChart;
}


function getStatsByBlock(blockInfo) {
  if(blockInfo.length==0)
    return {};

  var ans={
    min:undefined,
    mean:0,
    max:undefined
  };
  var count=0;

  for (var i = 0; i < blockInfo.length; i++) {
    var tx=blockInfo[i];
    if(ans.min===undefined || tx.feeBySize<ans.min)
      ans.min=tx.feeBySize;
    if(ans.max===undefined || tx.feeBySize>ans.max)
      ans.max=tx.feeBySize;
    ans.mean+=tx.feeBySize;
    count+=1;
  }
  if(count>0)
    ans.mean=ans.mean/count;


  return ans;
}

function addSerieData(infoChart,numSerie,name,index,value){
  if(infoChart.data.series[numSerie]===undefined){
    infoChart.data.series[numSerie]={
      name: name,
      data: []
    }
  }
  if(index===undefined){
    infoChart.data.series[numSerie].data.push(value);
  }else{
    infoChart.data.series[numSerie].data[index]=value;
  }
}

module.exports.InfoCharts=InfoCharts;
