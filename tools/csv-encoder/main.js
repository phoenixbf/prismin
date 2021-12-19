/*
    PRISMIN CSV Encoder tool

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/

const commandLineArgs = require('command-line-args');
const csv = require('csv-parser');
const fs = require('fs');
const glob = require("glob");

const QEncoder = require("../../core/qencoder");
const QAtlas = require("../../core/qatlas");
const QASP = require("../../core/qasp");

const outFolder = __dirname+"/_OUT/";


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

let Encoder = new QEncoder();

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

// Process single user record
let processUserRecord = function(u){
    let U = inputCSVdata[u];
    if (!U) return;

    for (let m = 0; m < U.length; m++){
        let M = U[m];

        //console.log(M);
        let t   = parseFloat(M.Time);
        let pos = [parseFloat(M.px),parseFloat(M.py),parseFloat(M.pz)];
        let foc = [parseFloat(M.fx),parseFloat(M.fy),parseFloat(M.fz)];

        let args = {
            time: t,
            tm: 10.0,
            uid: u
        };

        Encoder.volumes.forEach(V => {
            args.color = V.encodeLocationToColor(pos);
            if (args.color) V.refract(args);
        });

    }
    console.log("Record "+u+" processed.");
};

// Process all loaded records
let processAll = function(){
    for (let u = 0; u < numRecords; u++) processUserRecord(u);

    Encoder.bakeAllBounded();
};

//=============================================================

// Load volumes and attach atlases
Encoder.addVolumesFromJSON(inargs.vol, ()=>{
    for (let v = 0; v < Encoder.volumes.length; v++) {
        let V = Encoder.volumes[v];

        let P = new QASP(4096,512);
        P.outfolder = outFolder;
        V.addPrism(P);
    }   
});

// Load input CSVs
if (inargs.csv) loadCSV(inargs.csv);

if (inargs.csvdir){
    let files = glob.sync(inargs.csvdir+'*.csv');
    for (let f = 0; f < files.length; f++){
        loadCSV( files[f] );
    }
}
