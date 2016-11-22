

function Charts(infoArticles){
  return '<html>'+getHead()+getBody(infoArticles)+'</html>';
}

function getHead(){
  var charset='<meta charset="UTF-8">';
  var css='<link href="http://c3js.org/css/c3-b03125fa.css" rel="stylesheet" type="text/css">';
  //var d3='<script src="https://d3js.org/d3.v4.min.js"></script>';
  var d3='<script src="http://c3js.org/js/d3-3.5.6.min-77adef17.js" type="text/javascript"></script>';
  var c3='<script src="http://c3js.org/js/c3.min-4c5bef8f.js"></script>';

  var head='<head>'+charset+css+d3+c3+'</head>';
  return head;
}
function getBody(infoArticles){
  var sectionTitle="Charts"
  var body='<body>'+
    '<section>'+'<h1>'+sectionTitle+'</h1>'+
    getArticles(infoArticles) +
    '</section>'+
  '</body>';
  return body;
}
function getArticles(infoArticles) {
  var articles="";
  for (var i = 0; i < infoArticles.length; i++) {
    var info=infoArticles[i];
/*    var infoChart=getChart("nums","vals",{xserie:'x',series:[{name:"x",data:[1.4,2.3,4,5.8,9.2,0.5,0.3,6.0,10]},{name:"t1",data:[1,2,3,4,8,4,3,2,1]}]});
    articles+=getArticle("Chart1","chart1",infoChart);*/
    var infoChart=getChart(info.xlabel,info.ylabel,info.data,info.type);
      articles+=getArticle(info.title,info.description,info.id,infoChart);
  }
  return articles;
}

function getChart(xlabel,ylabel,data,type) {
    var infoChart={};

    infoChart.data={};
    infoChart.data.x=data.xserie;
    infoChart.data.columns=[];
    for (var i = 0; i < data.series.length; i++) {
      var serie=data.series[i];
      var array=[];
      array[0]=serie.name;
      array=array.concat(serie.data);

      infoChart.data.columns[i]=array;
    }
/*   columns: [
       ['data1', 30, 200, 100, 400, 150, 250],
       ['data2', 50, 20, 10, 40, 15, 25]
     ],*/

    infoChart.axis={};
    infoChart.axis.y={};
    infoChart.axis.y.label={};
    infoChart.axis.y.label.text=ylabel;
    infoChart.axis.y.label.position='outer-middle';

    infoChart.axis.x={};
    infoChart.axis.x.label={};
    infoChart.axis.x.label.text=xlabel;
    infoChart.axis.x.label.position='outer-center';

    if(type!==undefined){
      infoChart.data.type=type.typeChart;
      infoChart.data.groups=[];
      infoChart.data.groups.push(type.groups);
    }

    return infoChart;
}

function getArticle(title,description,figureId,infoChart) {
  infoChart.bindto="#"+figureId;
  var article='<article class="example">'+'<h1>'+title+'</h1>'+
  '<p>'+description+'</p>'+
  '<div id="'+figureId+'"></div>'+
  '<script>(function () {'+
  'var chart = c3.generate('+JSON.stringify(infoChart)+');'+
  '    }());</script>'+
  '</article>';
  return article;
}
module.exports.Charts=Charts;
