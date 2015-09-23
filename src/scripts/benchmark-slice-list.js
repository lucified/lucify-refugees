

//var SliceList = require('../js/slice-list.jsx');



var ForerunnerDB = require('forerunnerdb');


var fdb = new ForerunnerDB(),
    db = fdb.db('test'),
    names = ['Jim', 'Bob', 'Bill', 'Max', 'Jane', 'Kim', 'Sally', 'Sam'],
    collection = db.collection('test'),
    tempName,
    tempAge,
    i;


for (i = 0; i < 100000; i++) {
    var tempName = names[Math.ceil(Math.random() * names.length) - 1];
    var tempAge = Math.ceil(Math.random() * 100);

    collection.insert({
        name: tempName,
        age: tempAge
    });
}


collection.ensureIndex({
    //name: 1,
    age: 1
});

console.log(collection.explain({
    //name: 'Bill',
    age: 17

    //{
    //	'$gt': 17
    //}
}));