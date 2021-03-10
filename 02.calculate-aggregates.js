const HeikinAshi = require("heikinashi");
const mongoose = require('mongoose');
const { Schema } = mongoose;

const myCollection = mongoose.model('HistData', new Schema({}, { strict: false }));

const mongoConnection = mongoose.connect('mongodb://localhost/ib-bot', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log("MongoDb Connection is ready!");



    myCollection.find({}).sort({ time: 1 }).lean().then(d => {
        // calculate aggregates
        console.log("result from db:", d);
        let sample = d.map((e) => { e.OHLC = { time: e.time, open: e.open, high: e.high, low: e.low, close: e.close, volume: 11 }; return e })

        // // store results
        let result = HeikinAshi(sample);

        result = result.map((e) => { e.HA = { time: e.time, open: e.open, high: e.high, low: e.low, close: e.close, volume: 11 }; return e })

        for(let dp of result) {
            console.log("Updating datapoint", dp._id);
            myCollection.findByIdAndUpdate(dp._id, dp).exec();
        }
    })
});

