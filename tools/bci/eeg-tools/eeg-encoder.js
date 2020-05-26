/*
    PRISMIN EEG encoder

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/

const QVOSP = require("./../qvosp");

const commandLineArgs = require('command-line-args');
const csv = require('csv-parser');
const fs = require('fs');
const glob = require("glob");

const outFolder = __dirname+"/_OUT/";

const optDefs = [
    { name: 'csvdir', type: String},  // csv directory
    { name: 'uid', type: Number}, // user ID
    { name: 'patt', type: String },   // pattern
    { name: 'vrange', type: String },   // v range
];
const inargs = commandLineArgs(optDefs);

// We instantiate our custom voltage prism
let vPrism = new QVOSP(54000,64);
if (inargs.uid){
    console.log("User #"+inargs.uid);
    vPrism.setUserID( parseInt(inargs.uid) );
    }
vPrism.outfolder = outFolder;

vPrism.setVoltageRange(-200.0,200.0);
//vPrism.setVoltageRange(-10000.0,10000.0);

let vRange = [undefined,undefined];

let inputCSVdata = [];
let numRecords   = 0;
let numLoadingRecords = 0;

let loadCSV = function(filepath, onComplete){
    let R = [];

    console.log("Loading file "+filepath);
    numLoadingRecords++;

    fs.createReadStream( filepath )
        .pipe( csv({headers: false}) )
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

// Process single record
let processRecord = function(r){
    let R = inputCSVdata[r];
    if (!R) return;

    for (let ch = 0; ch < R.length; ch++){
        let F = R[ch];

        for (let t in F){
            let v = parseFloat(F[t]);
            //console.log(t);

            // Update volts range
            if (!vRange[0] || v < vRange[0]) vRange[0] = v;
            if (!vRange[1] || v > vRange[1]) vRange[1] = v;

            let c = vPrism.encodeChannelValue(v, false);
            //let c = vPrism.encodeChannelThreeBand(v);
            vPrism.refract({color: c, uid: 0, trial: r, chanid: ch, tind: t});
        }     
    }

    console.log("Record "+r+" processed.");
};

let processAll = function(){
    for (let r=0; r < numRecords; r++) processRecord(r);

    console.log("v RANGE: "+vRange);
    vPrism.bake();
};


if (!inargs.csvdir) return;

let ptt = (inargs.patt)? inargs.patt : "*.csv";
let files = glob.sync(inargs.csvdir + ptt);
//console.log(files);

if (inargs.vrange){
    let rangestr =inargs.vrange.split(',');
    if (rangestr.length>1){
        vPrism.setVoltageRange(parseFloat(rangestr[0]), parseFloat(rangestr[1]));
        console.log(vPrism._vRange);
    } 
}

for (let f = 0; f < files.length; f++){
    loadCSV( files[f] );
}