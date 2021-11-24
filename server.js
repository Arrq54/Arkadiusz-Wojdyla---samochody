var express = require("express")
var app = express()
var PORT = process.env.PORT || 3000;
const Datastore = require('nedb')
var hbs = require('express-handlebars');
var path = require("path")
const coll1 = new Datastore({
    filename: 'samochody.db',
    autoload: true
});
let context = {}
app.get('/', function (req, res) {
    coll1.find({}, function (err, docs) {
        context.items = docs
        res.render('index02.hbs', context);
    });
})
app.get('/addCar', function (req, res) {
    let obj = {
        edit: false,
        ubezpieczony: req.query.ubezpieczony == "on" ? "TAK" : "NIE",
        benzyna: req.query.benzyna == "on" ? "TAK" : "NIE",
        uszkodzony: req.query.uszkodzony == "on" ? "TAK" : "NIE",
        naped4x4: req.query.naped4x4 == "on" ? "TAK" : "NIE",
    }
    coll1.insert(obj, function (err, newDoc) { });
    coll1.find({}, function (err, docs) {
        context.items = docs
        res.render('index02.hbs', context);
    });
})
app.get('/deleteCar',function(req,res){
    coll1.remove({ _id:req.query.id }, { multi: true }, function (err, numRemoved) {
        coll1.find({}, function (err, docs) {
            context.items = docs
            res.render('index02.hbs', context);
        });
    });
})

app.get('/editCar', function(req,res){
    coll1.findOne({ _id: req.query.id }, function (err, doc) {
        doc.edit = true;
        coll1.find({}, function (err, docs) {
            for(let i=0;i<docs.length;i++){
                docs[i].edit = false;
                coll1.update({_id: docs[i]._id},{$set: docs[i]},{},function(err,numReplaced){});
            }
        });
       
        coll1.update({ _id: req.query.id }, { $set: doc }, {}, function (err, numUpdated) {});
        coll1.find({}, function (err, docs) {
            context.items = docs
            res.render('index02.hbs', context);
        });
    });
})

app.get('/updateCar',function(req,res){
    let newObj = {
        edit: false,
        ubezpieczony: req.query.ubezpieczony,
        benzyna: req.query.benzyna,
        uszkodzony: req.query.uszkodzony,
        naped4x4: req.query.naped4x4,
    }
    coll1.update({ _id: req.query.update }, { $set: newObj }, {}, function (err, numUpdated) {
        coll1.find({}, function (err, docs) {
            context.items = docs
            res.render('index02.hbs', context);
    })});
    
})
app.get('/cancelCar',function(req,res){
    coll1.find({}, function (err, docs) {
        context.items = docs
        res.render('index02.hbs', context);
})
})


app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
}));
app.set('view engine', 'hbs');



app.use(express.static('static'))
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})