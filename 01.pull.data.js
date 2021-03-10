const HeikinAshi = require("heikinashi");
const mongoose = require('mongoose');
const { Schema } = mongoose;

const myCollection = mongoose.model('HistData', new Schema({time: {required: true, type: Number}}, { strict: false }));

const mongoConnection = mongoose.connect('mongodb://localhost/ib-bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
    console.log("Mongo ist da! ");
    myCollection.deleteMany({}).then((d) => console.log("Datenbank sauber", d));
});




let runningRequests = [];
function generateTickerForRequest(requestedContract) {
    let randomTickerId = Math.floor(Math.random() * 1000000);
    runningRequests.push({tickerId: randomTickerId, requestedContract})
    return randomTickerId;
}







var ib = new (require('ib'))({
    port: 4001
}).on('error', function (err) {
    console.error('error --- %s', err.message);
}).on('historicalData', function (reqId, date, open, high, low, close, volume, barCount, WAP, hasGaps) {
    console.log(reqId, date, open, high, low, close, volume);
    let symbol = runningRequests.find(e => e.tickerId == reqId);
    myCollection.create({symbol, reqId, time: parseInt(date), open, high, low, close, heikinAshi: {}, datetime: new Date(parseInt(date) * 1000), volume , barCount, WAP, hasGaps});
}).on('contractDetails', function (reqId, contract) {
    console.log(contract);
})


ib.connect();
ib.reqHistoricalData(generateTickerForRequest("IBUST100"), ib.contract.cfd("IBUST100"), "", "1 Y", "4 hours", "MIDPOINT", 0, 2, false)





// Search contract details
// ib.reqContractDetails(1, ib.contract.cfd('IBUST100'));
// ib.reqContractDetails(1, ib.contract.cfd('IBDE30', undefined,'EUR'));
// ib.reqContractDetails(2, ib.contract.cfd('IBHK50'));















