const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const myCollection = mongoose.model('HistData', new Schema({}, { strict: false }));
const mongoConnection = mongoose.connect('mongodb://localhost/ib-bot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
    console.log("Mongo ist da! ");
});


const app = express();
const port = 3000;

app.use('/ui', express.static(__dirname + '/public'));

app.get('/getChart/:symbol', async (req, res) => {
    const sym = req.params.symbol;
    const result = await myCollection.find({"symbol.requestedContract" : sym}).sort({time: 1}).lean();

    res.status(200).json(result);
});



app.listen(port, () => {
    return console.log(`server is listening on ${port}`)
});
