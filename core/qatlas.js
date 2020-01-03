/*
    Quantized Atlas class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const Jimp = require('jimp');

const QA_LAYOUT_T_QSA    = 0
const QA_LAYOUT_S_STRIP  = 1;
const QA_LAYOUT_S_SQUARE = 2;

QA = function(){
    this.img    = new Jimp(64, 64, 0x00000000);
    this.outfile = undefined;
    
    this.layout = QA_LAYOUT_T_QSA;
};

QA.prototype.setLayout = function(L){
    this.layout = L;
    return this;
};

QA.prototype.setPixel = function(i,j, color){
    this.img.setPixelColor(color, i,j);
};

QA.prototype.writeAtlas = function(){
    this.img.write( this.outfile );
};



module.exports = QA;