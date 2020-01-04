/*
    Quantized Atlas class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const Jimp = require('jimp');

QA = function(){
    this._resX = 64;
    this._resY = 64;
    this.img    = new Jimp(this._resX, this._resY, 0x00000000);
    this.outfile = undefined;

    this.adapter = function(args){ return [0,0]; };

    this._lastCoords = undefined;
};

QA.prototype.setSize = function(X,Y){
    this._resX = X;
    this._resY = Y;
    this.img = new Jimp(this._resX, this._resY, 0x00000000);
};

QA.prototype.setPixel = function(coords, color){
    this.img.setPixelColor(color, coords[0],coords[1]);
    this._lastCoords = coords;
};

QA.prototype.writeAtlasOnDisk = function(){
    this.img.write( this.outfile );
};

// Pre-defined layouts
/*
QA.prototype.setLayoutQSA = function(){
    this.setSize(1024,4096);
    this.adapter = function(args){
        let u = args.uid;
        let t = args.time;

        };

};
*/

module.exports = QA;