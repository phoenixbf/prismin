/*
    PRISMIN OpenBCI/Cyton Encoder tool

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const Cyton           = require("@openbci/cyton");
const Constants       = require("@openbci/utilities").constants;
const commandLineArgs = require('command-line-args');

const QVOSP = require("./qvosp");

const outFolder = __dirname+"/_OUT/";
const APP_WRITE_INTERVAL = 4000; // millsec.

let vRange = [undefined,undefined];
let ti = 0;
let port = Constants.OBCISimulatorPortName;


const optDefs = [
    { name: 'channels', type: Number}, // no. channels
    { name: 'port', type: String},  // Port name 
//  { name: 'sim', type: Boolean}   // Simulate
];
const inargs = commandLineArgs(optDefs);

const ourBoard = new Cyton({
    verbose: true,
    boardType: "daisy",
    hardSet: true
});

let vPrism = new QVOSP();
vPrism.outfolder = outFolder;

// If port provided connect to port, else try autofind
if (inargs.port) port = inargs.port;
else {
    ourBoard.autoFindOpenBCIBoard().then(portName => {
        if (portName){
            port = portName;
            }
        else {
            // Unable to auto find OpenBCI board
            }
        });
}

// Connect to BCI board
ourBoard.connect(port)
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

                // Update volts range
                if (!vRange[0] || v < vRange[0]) vRange[0] = v;
                if (!vRange[1] || v > vRange[1]) vRange[1] = v;
                
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