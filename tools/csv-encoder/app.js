/*
    PRISMIN CSV Encoder
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/

const commandLineArgs = require('command-line-args');
const csv = require('csv-parser');
const fs = require('fs');
const glob = require("glob");

const QV = require("../../core/qvolume");


const optDefs = [
    { name: 'vol', type: String}, // json volumes list
    { name: 'attr', type: String}, // state attribute
    { name: 'csvdir', type: String, defaultOption: __dirname+"../../samples/volumes/" },
    { name: 'csv', type: String },
    { name: 'sync', type: Boolean}
];

const inargs = commandLineArgs(optDefs);

if (inargs.vol === undefined){
    console.log("No volume list provided. --vol <path/to/qv.json>");
    process.exit();
}

let inputCSVdata = [];
let numRecords = 0;
let numLoadingRecords = 0;

let loadCSV = function(filepath, onComplete){
    let R = [];

    console.log("Loading file "+filepath);
    numLoadingRecords++;

    fs.createReadStream( filepath )
        .pipe(csv())
        .on('data', (data) => R.push(data))
        .on('end', () => {

            //console.log("Loaded record #"+numRecords);
            inputCSVdata[numRecords] = R;
            
            numRecords++;
            numLoadingRecords--;
            if (numLoadingRecords <= 0) onAllRecordsLoaded();

            if (onComplete) onComplete();
            }); 
};

// Fired when all records loaded
let onAllRecordsLoaded = function(){
    console.log("ALL records loaded!");
    processAll();
};

// Process loaded records
let processAll = function(){
    for (let u = 0; u < numRecords; u++) {
        let U = inputCSVdata[u];

        for (let m = 0; m < U.length; m++) {
            let M = U[m];

            //console.log(M);
            let t = parseFloat(M.Time);
            let pos = [parseFloat(M.px),parseFloat(M.py),parseFloat(M.pz)];
            let foc = [parseFloat(M.fx),parseFloat(M.fy),parseFloat(M.fz)];
            
            }
        

        }
};

//=============================================================

// Load input CSVs
if (inargs.csv) loadCSV(inargs.csv);
if (inargs.csvdir){
    let files = glob.sync(inargs.csvdir+'*.csv');
    for (let f = 0; f < files.length; f++){
        //console.log(files[f]);
        loadCSV( files[f] );
        }
}
