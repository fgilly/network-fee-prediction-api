Network Fee Prediction API
==========================

#Description
API to estimate the minimum fee for the transaction to be confirmed in n blocks

#Install
```
git clone https://github.com/fgilly/network-fee-prediction-api.git
cd network-fee-prediction-api
npm install
```
##API
```
node
>var Api=require('./api');
>var api=new Api(); //without web interface
```
##API with web interface
```
node
>var Api=require('./api');
>var api=new Api(true); //with web interface
```
Default host: localhost:8081

#Examples
##Node
```
>api.getStats() //get count of Tx's and Blocks processed
>api.getAccuracy() //get accuracy of API estimations

>api.getMinFee() //get all estimations for block times
>api.getMinFee(2) //get all estimations for block 2

>api.getRecommendedFee() //get API recommendation for all block times
>api.getRecommendedFee(3) //get API recommendation for all block 3

>api.getHistoricalEstimations() //get previous estimations
```

##Web
Index html with explanations for web API.
```
/
```

getMinFee method get JSON result for the API method getMinFee.
```
/getMinFee
```
getMinFee method get JSON result for the API method getMinFee(#n-blockTime).
```
/getMinFee/#n-blockTime
```

getRecommendedFee method get JSON result for the API method getRecommendedFee.
```
/getRecommendedFee
```
getRecommendedFee method get JSON result for the API method getRecommendedFee(#n-blockTime).
```
/getRecommendedFee/#n-blockTime
```

getAccuracy method get JSON result for the API method getAccuracy.
```
/getAccuracy
```

Charts html with multiples charts using the data getted.
```
/charts
```
