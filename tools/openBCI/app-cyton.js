/*
    PRISMIN Cyton Encoder tool

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const Cyton = require("@openbci/cyton");
const Constants = require("@openbci/utilities").constants;
const commandLineArgs = require('command-line-args');

const QVOSP = require("./qvosp");

const outFolder = __dirname+"/_OUT/";
const APP_WRITE_INTERVAL = 4000; // millsec.

let vmin = undefined;
let vmax = undefined;
let ti = 0;


const optDefs = [
    { name: 'channels', type: Number}, // no. channels
//  { name: 'xxx', type: String}, // 
    { name: 'sim', type: Boolean}   // Simulate
];
const inargs = commandLineArgs(optDefs);

const ourBoard = new Cyton({
    verbose: true,
    boardType: "daisy",
    hardSet: true
});

let vPrism = new QVOSP();
vPrism.outfolder = outFolder;


ourBoard.connect(Constants.OBCISimulatorPortName) // This will set `simulate` to true
    .then(boardSerial => {

        ourBoard.streamStart()
            .then(()=>{
                console.log("Stream START");
                })
            .catch(err => {
                console.log(`Stream start ERROR: ${err}`);
                });

        // if we have a real board
        ourBoard.on("ready", ()=>{
            console.log("READY");
            });

        // Work with incoming sample
        ourBoard.on("sample", (sample)=>{
            for (let i = 0; i < ourBoard.numberOfChannels(); i++){
                let v = sample.channelData[i];
                if (!vmin || v < vmin) vmin = v;
                if (!vmax || v > vmax) vmax = v;
                //console.log(vmin*1000,vmax*1000); [-0.2, 0.2]
                
                //console.log("Channel " + (i + 1) + ": " + v.toFixed(8) + " Volts.");
                let c = vPrism.encodeChannelValue(v);
                vPrism.refract({color: c, chanid: i, tind: ti});
                }

            ti++;
            });
    })
    .catch(err => {
        /** Handle connection errors */
        console.log(err);
});

setInterval(()=>{
    console.log("Tick");
    vPrism.bake();
}, APP_WRITE_INTERVAL);