/*
    Prism base class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/

class Prism {
    constructor(){

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