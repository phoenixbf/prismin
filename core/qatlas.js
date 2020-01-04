/*
    Quantized Atlas class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const Jimp = require('jimp');

QAtlas = function(){
    this._resX = 64;
    this._resY = 64;
    this.img    = new Jimp(this._resX, this._resY, 0x00000000);
    this.outfile = undefined;

    this.adapter = function(args){ return [0,0]; };

    this._lastCoords = undefined;
};

QAtlas.prototype.setDimensions = function(X,Y){
    this._resX = X;
    this._resY = Y;
    this.img = new Jimp(this._resX, this._resY, 0x00000000);
    return this;
};

QAtlas.prototype.clear = function(){
    this.img = new Jimp(this._resX, this._resY, 0x00000000);
    return this;
};

QAtlas.prototype.setPixel = function(coords, color){
    this.img.setPixelColor(color, coords[0],coords[1]);
    this._lastCoords = coords;
    return this;
};


QAtlas.prototype.prism = function(args){
    this.setPixel( this.adapter(args), args.color );
    return this;
};

QAtlas.prototype.writeAtlasOnDisk = function(){
    this.img.write( this.outfile );
    return this;
};

// Pre-defined layouts
QAtlas.prototype.setLayoutQSA = function(dimensions){
    (dimensions)? this.setDimensions(dimensions[0],dimensions[1]) : this.setDimensions(1024,4096);
    
    this._qsaPage = 0;

    this.adapter = function(args){
        let i = parseInt(args.time / args.dt);
        let j = args.uid;
        return [i,j];
        };

    return this;
};

module.exports = QAtlas;