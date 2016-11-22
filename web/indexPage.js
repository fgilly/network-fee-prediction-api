

var linkInfoArray=[
  {name:"getMinFee",links:[{format:"/getMinFee",link:"/getMinFee",
    description:"Devuelve un JSON Array."
    +" Los elementos son los mínimos fee's en satoshis por byte para que una transacción se confirme en n bloques."
    +" El índice representa la cantidad n de bloques que se desea esperar para que la transacción se confirme."
    +" Cada elemento contiene como propiedades los valores devueltos por los diferentes métodos de cálculo."},
    {format:"/getMinFee/#n-blockTime", link:"/getMinFee/1",
     description:"Devuelve un JSON Object."
      +" El objeto representa el mínimo fee en satoshis por byte para que una transacción se confirme en #n-blockTime bloques."
      +" El objeto contiene como propiedades los valores devueltos por los diferentes métodos de cálculo."}]},
  {name:"getRecommendedFee",links:[{format:"/getRecommendedFee",link:"/getRecommendedFee",
    description:"Devuelve un JSON Array."
    +" Los elementos son los mínimos fee's en satoshis por byte para que una transacción se confirme en n bloques."
    +" El índice representa la cantidad n de bloques que se desea esperar para que la transacción se confirme."
    +" Cada elemento es el valor de fee que recomienda el api para que la transacción se confirme en n bloques."},
    {format:"/getRecommendedFee/#n-blockTime",link:"/getRecommendedFee/1",
    description:"Devuelve un Float."
     +" El valor representa el mínimo fee en satoshis por byte para que una transacción se confirme en #n-blockTime bloques."}]},
  {name:"getAccuracy",links:[{format:"/getAccuracy",link:"/getAccuracy",
    description:"Devuelve un JSON Object."
      +" El objeto representa la precisión de las últimas estimaciones recomendadas por el API medida en porcentaje de aciertos."
      +' La propiedad "percentage" contiene el porcentaje.'
      +' La propiedad "total" es el total sobre el que se basa el porcentaje.'
      +' La propiedad "meanOverpaymentInSuccess" es el promedio de lo que se pagó en exceso al utilizar las estimaciones correctas'
      +' del API.'}]},
  {name:"charts",links:[{format:"/charts",link:"/charts",
    description:"Devuelve un HTML."
      +" La página HTML contiene gráficos interesantes obtenidos con la información recabada para ofrecer el servicio."}]}

];


function IndexPage(api) {
  var head="<head>"+'<meta charset="UTF-8">'+"</head>";
  var body="<body>"+getBody(api)+"</body>";
  var html="<html>"+head+body+"</html>";

  return html;
}

function getBody(api) {
  var title="<h1>"+"Network Fee Prediction API"+"</h1>";
  var description=getDescriptionApi();
  var stats=api.getStats();
  var status=getStatus(stats);

  var methods=getMethods();

  return title+"<br><br>"+description+"<br><br>"+status+"<br><br>"+methods;
}

function getDescriptionApi() {
  function formatDescriptionMethod(methodName,methodDescription) {
    return "<h5>"+methodName+"</h5>"+"<p>"+methodDescription+"</p>";
  }
  var descriptionTitle="<h3>"+"Description"+"</h3>";
  var description="<p>"
      +"El API estima el mínimo fee que hay que pagar para que la transacción sea confirmada en n bloques."
      +" Para realizar esto, mira las transacciones y los bloques que circulan por la red de bitcoin."
      +" El API realiza el cálculo del mínimo fee utilizando tres métodos distintos."
      +"</p>";
  var methodDescription="";
  methodDescription+=formatDescriptionMethod("Method1",
    "Obtiene los mínimos fee's para cada bloque minado"
    +" y devuelve el máximo, el promedio y el mínimo, de entre los mínimos."
    +"<br>El objeto retornado contiene las propiedades:"
    +'<ul><li>"max" que contiene el máximo de los mínimos,</li>'
    +'<li>"mean" que contiene el promedio de los mínimos.</li>'
    +'<li>"count" que contiene la cantidad de mínimos sobre los que se realizó el cálculo.</li>'
    +'<li>"min" que contiene el mínimo de los mínimos.</li>'
    +"</ul>");
  methodDescription+=formatDescriptionMethod("Method2",
    "Obtiene los mínimos fee's con su probabilidad de confirmarse la transacción en n bloques."
    +"<br>Para realizar el cálculo genera intervalos de valores de fee, en los cuales cuenta la cantidad"
    +" de transacciones para que se confime en n bloques."
    +"<br>El objeto retornado es un array ordenado por probabilidad descendente y lurgo por fee ascendente."
    +"<br>Los elementos poseen las propiedades:"
    +'<ul><li>"feeClass" con el valor del fee.</li>'
    +'<li>"probability" con la probabilidad de que una transacción sea confirmada en n bloques utilizando ese fee.</li>'
    +"</ul>");
  methodDescription+=formatDescriptionMethod("Method3",
    "Obtiene los mínimos fee's para ubicar la transacción en una posición en la mempool tal que sea minada en n bloques."
    +"<br>Para realizar el cálculo considera la mempool ordenada por fee por byte,"
    +" y considera transacciones hasta 700KB como máximo para un bloque."
    +"<br>Retorna el mínimo fee del bloque n, el cual sería el mínimo para que la transacción se confirme en n bloques.");

    return descriptionTitle+description+methodDescription;
}


function getStatus(stats) {
  function formatStatus(name,value) {
    return "<p>"+"<b>"+name+": "+"</b>"+value+"</p>";
  }
  var statusTitle="<h2>"+"Status"+"</h2>";
  var statusInfo="";
  statusInfo+=formatStatus("Número total de Tx",stats.TotalNroTx);
  statusInfo+=formatStatus("Número actual de Tx sin confirmar",stats.CurrentNroUtx);
  statusInfo+=formatStatus("Número de Bloques",stats.NroBlocks);
  statusInfo+=formatStatus("Número actual de Tx confirmadas",stats.NroTxConfirmed);
  statusInfo+=formatStatus("Altura de bloque inicial",stats.InitialBlockHeight);
  statusInfo+=formatStatus("Altura de bloque actual",stats.CurrentBlockHeight);

  return statusTitle+"<div>"+statusInfo+"</div>";
}

function getMethods() {
  var methodsTitle="<h2>"+"Methods"+"</h2>";
  var ans="";
  for (var i = 0; i < linkInfoArray.length; i++) {
    ans+=getMethod(linkInfoArray[i])+"<br>";
  }
  return methodsTitle+ans;
}

function getMethod(linkInfo) {
  var title="<h3>"+linkInfo.name+"</h3>";
  var invocations="";
  for (var i = 0; i < linkInfo.links.length; i++) {
    var info=linkInfo.links[i];
    var format="<h5>"+"<b>"+"Format: "+"</b>"+info.format+"</h5>";
    var link="<h5>"+"<b>"+"Example: "+"</b>"+'<a href="'+info.link+'">'+info.link+"</a>"+"</h5>";
    var description="<h5>"+"<b>"+"Description: "+"</b>"+"</h5>"+"<p>"+info.description+"</p>";

    var invocation=format+link+description;
    invocations+=invocation;
  }
  var div="<div>"+title+invocations+"</div>";
  return div;
}



module.exports.IndexPage=IndexPage;
