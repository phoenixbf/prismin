/*
    Prism base class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/

class Prism {
    constructor(){
        // Main output folder
        this.outfolder = undefined;

        // Overlay policy function
        this.ovrfunction = undefined;
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


module.exports = Prism;