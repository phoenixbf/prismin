/*
    PRISMIN EEG encoder

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
//const QVOSP = require("./../qvosp2");
const QVOSP = require("./../qvosp");

const commandLineArgs = require('command-line-args');
const csv = require('csv-parser');
const fs = require('fs');
const glob = require("glob");
const path = require('path');

let outFolder = __dirname+"/_OUT/";

const optDefs = [
    { name: 'csvdir', type: String},  // csv directory
    { name: 'uid', type: Number}, // user ID
    { name: 'quant', type: String }, // quantization type: "grayscale", "delta" (defaults to short-rainbow)
    { name: 'exp', type: String }, // experiment
    { name: 'patt', type: String },   // pattern
    { name: 'vrange', type: String },   // v range
    { name: 'tsize', type: Number },
    { name: 'channels', type: Number },
    { name: 'crop', type: Number },
    { name: 'resize', type: Number },
];
const inargs = commandLineArgs(optDefs);

// We instantiate our custom voltage prism
let vPrism = new QVOSP(); //new QVOSP(54000,64);
if (inargs.tsize)    vPrism._qsaW = inargs.tsize;
if (inargs.channels) vPrism._qsaH = inargs.channels;

if (inargs.uid){
    console.log("User #"+inargs.uid);
    vPrism.setUserID( parseInt(inargs.uid) );
}

if (inargs.exp) outFolder += inargs.exp+"/";
vPrism.setOutFolder(outFolder);

vPrism.setVoltageRange(-200.0,200.0);
//vPrism.setVoltageRange(-10000.0,10000.0);

if (inargs.resize) vPrism.setOutputResize(inargs.resize);
if (inargs.crop)   vPrism.setOutputCropWidth(inargs.crop);


let vRangeStats = [undefined,undefined];

let inputCSVdata = [];
let numRecords   = 0;
let numLoadingRecords = 0;

let loadCSV = function(filepath, onComplete){
    let R = [];

    let IFile = path.parse(filepath);
    let basename = IFile.name;
    
    //let trialid = parseInt( basename.replace("djc_eeg", "") ); // expose trial string param
    let trialid = parseInt( basename.replace(/\D/g,'') ); 
    //console.log(trialid);

    console.log("Loading file "+filepath);
    numLoadingRecords++;

    fs.createReadStream( filepath )
        .pipe( csv({headers: false}) )
        .on('data', (data) => R.push(data))
        .on('end', () => {

            //console.log("Loaded record #"+numRecords);
            //inputCSVdata[numRecords] = R;
            inputCSVdata[trialid] = R;
            
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

        let vPrev = undefined;
        for (let t in F){
            let v = parseFloat(F[t]);
            //console.log(t);

            let vDelta = undefined;
            if (vPrev !== undefined) vDelta = (v - vPrev);

            //console.log(vDelta);

            // Update volts range (stats)
            if (!vRangeStats[0] || v < vRangeStats[0]) vRangeStats[0] = v;
            if (!vRangeStats[1] || v > vRangeStats[1]) vRangeStats[1] = v;

            let c;
            if (inargs.quant === undefined)   c = vPrism.encodeChannelValueRainbow(v);
            if (inargs.quant === "grayscale") c = vPrism.encodeChannelValue(v, true);
            if (inargs.quant === "delta")     c = vPrism.encodeChannelDelta(vDelta, undefined/*, v*/);
            //c = vPrism.encodeChannelThreeBand(v);

            vPrism.refract({color: c, uid: 0, trial: r, chanid: ch, tind: t});

            //vPrism.refract({value: v, trial: r, chanid: ch});

            vPrev = v;
        }     
    }

    console.log("Record "+r+" processed.");
};

let processAll = function(){
    for (let r in inputCSVdata) processRecord(r);

    console.log("v RANGE: "+vRangeStats);
    vPrism.bake();
};


if (!inargs.csvdir) return;

let ptt = (inargs.patt)? inargs.patt : "*.csv";
let files = glob.sync(inargs.csvdir + ptt);
console.log(files);

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