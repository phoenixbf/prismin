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

const COVP     = require("./cov-prism");

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

            //console.log(sn);

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
/* Global
                    if (Dd < covPrism.pRangeDelta.min) covPrism.pRangeDelta.setMin(Dd);
                    if (Dc < covPrism.pRangeDelta.min) covPrism.pRangeDelta.setMin(Dc);
                    if (Dr < covPrism.pRangeDelta.min) covPrism.pRangeDelta.setMin(Dr);

                    if (Dd > covPrism.pRangeDelta.max) covPrism.pRangeDelta.setMax(Dd);
                    if (Dc > covPrism.pRangeDelta.max) covPrism.pRangeDelta.setMax(Dc);
                    if (Dr > covPrism.pRangeDelta.max) covPrism.pRangeDelta.setMax(Dr);
*/
                    if (Dd < covPrism.deltaDeaths.min) covPrism.deltaDeaths.setMin(Dd);
                    if (Dd > covPrism.deltaDeaths.max) covPrism.deltaDeaths.setMax(Dd);

                    if (Dc < covPrism.deltaConfirmed.min) covPrism.deltaConfirmed.setMin(Dc);
                    if (Dc > covPrism.deltaConfirmed.max) covPrism.deltaConfirmed.setMax(Dc);

                    if (Dr < covPrism.deltaRecovered.min) covPrism.deltaRecovered.setMin(Dr);
                    if (Dr > covPrism.deltaRecovered.max) covPrism.deltaRecovered.setMax(Dr);
                    }
/* Global
                if (d < covPrism.pRange.min) covPrism.pRange.setMin(d);
                if (c < covPrism.pRange.min) covPrism.pRange.setMin(c);
                if (r < covPrism.pRange.min) covPrism.pRange.setMin(r);

                if (d > covPrism.pRange.max) covPrism.pRange.setMax(d);
                if (c > covPrism.pRange.max) covPrism.pRange.setMax(c);
                if (r > covPrism.pRange.max) covPrism.pRange.setMax(r);
*/
                // Find min,max for c,d,r
                if (d<covPrism.rangeDeaths.min) covPrism.rangeDeaths.setMin(d);
                if (d>covPrism.rangeDeaths.max) covPrism.rangeDeaths.setMax(d);

                if (c<covPrism.rangeConfirmed.min) covPrism.rangeConfirmed.setMin(c);
                if (c>covPrism.rangeConfirmed.max) covPrism.rangeConfirmed.setMax(c);

                if (r<covPrism.rangeRecovered.min) covPrism.rangeRecovered.setMin(r);
                if (r>covPrism.rangeRecovered.max) covPrism.rangeRecovered.setMax(r);
                }
            }

        numStates++;
        }

    console.log("Range Confirmed: "+covPrism.rangeConfirmed);
    console.log("Range Deaths: "+covPrism.rangeDeaths);
    console.log("Range Recovered: "+covPrism.rangeRecovered);
    console.log("Num. days: "+numDays);

    if (bDelta){
        console.log("Delta confirmed: "+covPrism.deltaConfirmed);
        console.log("Delta deaths: "+covPrism.deltaDeaths);
        console.log("Delta recovered: "+covPrism.deltaRecovered);
        }
    
    // Resize COV-QSA
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



