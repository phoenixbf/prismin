/*
    QPrism base class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const fs  = require('fs');


class QPrism {
    constructor(){
        // Main output folder
        this.outfolder = undefined;

        // Overlay policy function
        this.ovrfunction = undefined;
        }

    setOutFolder(dir){
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        this.outfolder = dir;
    }

    refract(args){
        console.log("Prism refract()");
        return this;
    }

    bake(){
        console.log("Prism bake()");
        return this;
    }

}


module.exports = QPrism;