/*
    PRISMIN OpenBCI Encoder tool
    based on OpenBCI Node.js Cyton SDK (https://github.com/OpenBCI/OpenBCI_NodeJS_Cyton)

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const Cyton           = require("@openbci/cyton");
const Constants       = require("@openbci/utilities").constants;
const commandLineArgs = require('command-line-args');

const QVOSP = require("./../qvosp");

const outFolder = __dirname+"/_OUT/";

let vRange = [undefined,undefined];
let ti = 0;
let tWriteInterval = 4000; // millsec.
let port = Constants.OBCISimulatorPortName;


const optDefs = [
//  { name: 'channels', type: Number}, // no. channels
    { name: 'uid', type: Number}, // user ID
    { name: 'port', type: String},  // Port name 
//  { name: 'b', type: Boolean}   //
];
const inargs = commandLineArgs(optDefs);

const ourBoard = new Cyton({
    verbose: true,
    boardType: "daisy",
    hardSet: true,
    simulatorDaisyModuleAttached: true
});

// We instantiate our custom voltage prism
let vPrism = new QVOSP();
if (inargs.uid){
    console.log("User #"+inargs.uid);
    vPrism.setUserID( parseInt(inargs.uid) );
    }
vPrism.outfolder = outFolder;


// If port provided connect to port, else try autofind
if (inargs.port) port = inargs.port;
else {
    ourBoard.autoFindOpenBCIBoard()
        .then(portName => {
            if (portName){
                port = portName;
                }
            else {
                // Unable to auto find OpenBCI board
                }
            })
        .catch(err => {
            // Could not autofind
            console.log(err);
            });
}

// Connect to BCI board
ourBoard.connect(port)
    .then(boardSerial => {

        ourBoard.streamStart()
            .then(()=>{
                console.log("Stream started!");
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



// Write encoded data on disk
setInterval(()=>{
    //console.log("Tick");
    vPrism.bake();
}, tWriteInterval);