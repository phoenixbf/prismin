/*
    PRISMIN COVID Data Encoder
    based on updated daily datasets from https://github.com/pomber/covid19

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/

const commandLineArgs = require('command-line-args');
const csv = require('csv-parser');
const fs = require('fs');
const glob = require("glob");
const getJSON = require('get-json');

const COVP = require("./cov-prism");

const outFolder = __dirname+"/_OUT/";
const inputdata = __dirname+"/_cov_series.json";
const COVID_URL = "https://pomber.github.io/covid19/timeseries.json";


const optDefs = [
    { name: 'states', type: String},   // filter selected states, comma-separated (e.g. "Italy, US")
    { name: 'delta', type: Boolean},    // encode positive deltas
    { name: 'day', type: Number},      // starting day
    { name: 'relative', type: Boolean} // relative ranges (selected states)
];
const inargs = commandLineArgs(optDefs);


let data = undefined;
let covPrism = new COVP();
covPrism.setOutFolder(outFolder);

let bUseGlobalRanges = true;
if (inargs.relative) bUseGlobalRanges = false;

let bDelta = false;
if (inargs.delta) bDelta = true;

let matchingStates = [];
if (inargs.states) matchingStates = inargs.states.split(',');


let run = function (){
    //if (!fs.existsSync(inputdata)) return;
    console.log("Processing local JSON data...");
    
    data = JSON.parse( fs.readFileSync(inputdata) );
    if (!data) return;

    if (inargs.delta && inargs.delta>0) covPrism.maxDelta = inargs.delta;

    let startDay = 0;
    if (inargs.day && inargs.day>0) startDay = inargs.day;

    let numDays = 1;
    let numStates = 0;

    // find ranges for c,d,r
    for (sn in data){
        let state = data[sn];

        if (bUseGlobalRanges || matchingStates.length<1 || matchingStates.indexOf(sn) > -1){
            numDays = state.length;

            // For each day
            for (let i = startDay; i < numDays; i++){
                const day = state[i];

                let d = parseInt(day.deaths);
                let c = parseInt(day.confirmed);
                let r = parseInt(day.recovered);

                // Find min,max deltas
                if (bDelta && i>0){
                    let Dd = parseInt(d - state[i-1].deaths);
                    let Dc = parseInt(c - state[i-1].confirmed);
                    let Dr = parseInt(r - state[i-1].recovered);

                    if (Dd < covPrism.deltaDeaths[0]) covPrism.deltaDeaths[0] = Dd;
                    if (Dd > covPrism.deltaDeaths[1]) covPrism.deltaDeaths[1] = Dd;

                    if (Dc < covPrism.deltaConfirmed[0]) covPrism.deltaConfirmed[0] = Dc;
                    if (Dc > covPrism.deltaConfirmed[1]) covPrism.deltaConfirmed[1] = Dc;

                    if (Dr < covPrism.deltaRecovered[0]) covPrism.deltaRecovered[0] = Dr;
                    if (Dr > covPrism.deltaRecovered[1]) covPrism.deltaRecovered[1] = Dr;
                    }

                if (!covPrism.rangeDeaths[0] || d<covPrism.rangeDeaths[0]) covPrism.rangeDeaths[0] = d;
                if (!covPrism.rangeDeaths[1] || d>covPrism.rangeDeaths[1]) covPrism.rangeDeaths[1] = d;

                if (!covPrism.rangeConfirmed[0] || c<covPrism.rangeConfirmed[0]) covPrism.rangeConfirmed[0] = c;
                if (!covPrism.rangeConfirmed[1] || c>covPrism.rangeConfirmed[1]) covPrism.rangeConfirmed[1] = c;

                if (!covPrism.rangeRecovered[0] || r<covPrism.rangeRecovered[0]) covPrism.rangeRecovered[0] = r;
                if (!covPrism.rangeRecovered[1] || r>covPrism.rangeRecovered[1]) covPrism.rangeRecovered[1] = r;
                }
            }

        numStates++;
        }

    console.log("Range Confirmed: "+covPrism.rangeConfirmed);
    console.log("Range Deaths: "+covPrism.rangeDeaths);
    console.log("Range Recovered: "+covPrism.rangeRecovered);
    console.log("Num. days: "+numDays);

/*
    if (Delta>0){
        covPrism.maxDeltaConfirmed = (covPrism.rangeConfirmed[1]-covPrism.rangeConfirmed[0]) * Delta;
        covPrism.maxDeltaDeaths    = (covPrism.rangeDeaths[1]-covPrism.rangeDeaths[0]) * Delta;
        covPrism.maxDeltaRecovered = (covPrism.rangeRecovered[1]-covPrism.rangeRecovered[0]) * Delta;
        }
*/
    console.log("Delta confirmed: "+covPrism.deltaConfirmed);
    console.log("Delta deaths: "+covPrism.deltaDeaths);
    console.log("Delta recovered: "+covPrism.deltaRecovered);

    covPrism.setDimensions(numDays,numStates);

    // Encode
    let sind = 0;
    for (sn in data){
        let state = data[sn];

        //if (!inargs.state) console.log(sn);

        if (matchingStates.length<1 || matchingStates.indexOf(sn) > -1){
            for (let i = startDay; i < numDays; i++){
                const day = state[i];
                let prevday;
                if (i===0) prevday = day;
                else prevday = state[i-1];

                let confirmed = parseInt(day.confirmed);
                let deaths    = parseInt(day.deaths);
                let recovered = parseInt(day.recovered);

                let dconfirmed = parseInt(day.confirmed - prevday.confirmed);
                let ddeaths    = parseInt(day.deaths - prevday.deaths);
                let drecovered = parseInt(day.recovered - prevday.recovered);

                //if (drecovered <0) console.log(drecovered);

                let c;
                if (bDelta) c = covPrism.encodeData( dconfirmed, ddeaths, drecovered, true);
                else c = covPrism.encodeData( confirmed, deaths, recovered, false);

                covPrism.refract({tind: i, color: c, sid: sind});
                }
            }

        sind++;
        }

    covPrism.bake();
};

if (!fs.existsSync(inputdata)){
    console.log("local JSON data not found. Requesting....");

    getJSON(COVID_URL, function(error, response){
        if (error){
            console.log(error);
            }
    
        fs.writeFileSync(inputdata, JSON.stringify(response));
        
        run();
        });
}
else run();



