
const mongoose = require('mongoose');
const { Schema } = mongoose;

const historicalDataCollection = mongoose.model('HistData', new Schema({}, { strict: false }));
const trendDataCollection = mongoose.model('TrendData', new Schema({}, { strict: false }));

const mongoConnection = mongoose.connect('mongodb://localhost/ib-bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
    console.log("Mongo ist da! ");
});

const fibScale = [0, 0.318, .5, .682, 1, 1.618];



// analyse results look like this

result = {
    type: 'TREND', // possible TREND or CORRECTION
    direction: "UP", // UP, DOWN or Null
    dateRange: {start: undefined, end: undefined},
    valueRange: {start: 111000, end: 120000},
    haCandleMethod: "CLOSE",
    fibunacci: 31.8,
}




// 1. pick a random starting point to follow a trend
// 2. iterate from candle by candle to detect a trend direction
// 3. compare new min/max with prev min/max, if trend continues -> continue with next candle
// 3a. if trend is breaking, assume there is a potential correction
// 3b. if correction continues, check for 31.8% threshold
// 3c. if correction breaks, ignore and continue with general trend... 
// 4a. if correction overturns trend, assume trend in opposite direction. 
// 4b.  


// this is our explorer
let estimatedDirection = undefined; // Up Down Null
let confirmedDirection = undefined; // Up Down Null
let currentValue = undefined;
let currentMovementPct = 0;
let iteration = 0;
let pointsOfInterests = [];
let intermediatePoi = {};
let lastDataPoint = undefined;



historicalDataCollection.find({}).sort({time: 1}).lean().then(dataPoints => { 
    let lastDp = dataPoints.pop();
    let vnIndex = [];
    let lastDirection = undefined;
    for(let dp of dataPoints) {
        if(dp.HA.close > lastDp.HA.close && lastDirection == undefined) {
            vnIndex.push(1);
            lastDp.vnIndex = 1;
            lastDirection = 1;
        }
        else if(dp.HA.close < lastDp.HA.close && lastDirection == undefined) {
            vnIndex.push(-1);
            lastDp.vnIndex = -1;
            lastDirection = -1;
        }

        else if(dp.HA.close > lastDp.HA.close && lastDirection == 1) {
            vnIndex.push(0);
            lastDp.vnIndex = 0;
        }
        else if(dp.HA.close > lastDp.HA.close && lastDirection == -1) {
            vnIndex.push(+1);
            lastDirection = 1;
            lastDp.vnIndex = 1;
        }

        else if(dp.HA.close < lastDp.HA.close && lastDirection == 1) {
            vnIndex.push(-1);
            lastDirection = -1;
            lastDp.vnIndex = -1;
        }
        else if(dp.HA.close < lastDp.HA.close && lastDirection == -1) {
            vnIndex.push(0);
            lastDp.vnIndex = 0;
        }

        lastDp = dp;
    }

    console.log("VNIndex", vnIndex);
    let filteredDatapoints = dataPoints.filter(e => e.vnIndex != 0);
    console.log("Filtered VNIndex", filteredDatapoints);

    let lastFdp = filteredDatapoints.pop();
    // iterate through all dp, calculate deviation in pct
    for(let fdp of filteredDatapoints){
        fdp.deviation = fdp.HA.close - lastFdp.HA.close;
        lastFdp = fdp;
    }

    console.log("FDP with Deviations", filteredDatapoints);    

});



// historicalDataCollection.find({}).sort({time: 1}).lean().then(dataPoints => {

//     for(let dp of dataPoints) {

//         if(currentValue == undefined) {
//             // this is our first value
//             currentValue = dp.HA.close;
//             pointsOfInterests.push(
//             {
//                 iteration: iteration++,
//                 value: currentValue,
//                 time: dp.time
//             });
//         } else {
//             currentValue = dp.HA.close;
//         }

//         const lastPoi = pointsOfInterests[iteration];


//         if(estimatedDirection == undefined && currentValue > lastPoi.value) {
//             // this is our first value
//             estimatedDirection = "U"
//         }
//         else if(estimatedDirection == undefined && currentValue < lastPoi.value) {
//             // this is our first value
//             estimatedDirection = "D"
//         }


//         if(estimatedDirection == "D" && currentValue > lastDataPoint.HA.close) {
//             // check consiquences
//             intermediatePoi = {
//                 iteration: iteration++,
//                 value: lastDataPoint.HA.close,
//                 time: lastDataPoint.time
//             };

//             console.log("Intermediate POI created", intermediatePoi);



//             if() // uber 0% und unter 31.8... ignorrieres
//             else if() // uber 100%

//             estimatedDirection = "U"
//         }
//         else if(currentDirection == "U" && currentValue < lastPoi.value) {
//             // this is our first value
//             estimatedDirection = "D"
//         }


//         lastDataPoint = dp;
        
//     }
// })



