/*
    Quantized Atlas class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const Jimp = require('jimp');

class QAtlas {
    constructor(){
        this._resX = 64;
        this._resY = 64;
        this.img    = new Jimp(this._resX, this._resY, 0x00000000);
        this.outfile = undefined;

        this.adapter = function(args){ return [0,0]; };
        this.overlay = undefined; // overlay function

        this._lastCoords = undefined;
        }

    setDimensions(W,H){
        this._resX = W;
        this._resY = H;
        this.img = new Jimp(this._resX, this._resY, 0x00000000);
        return this;
        }

    setPixel(coords, color, ovrfun){
        let outcol = new Uint8Array(4);
        outcol[0] = color[0];
        outcol[1] = color[1];
        outcol[2] = color[2];
        outcol[3] = color[3];

        // We provided an overlay function
        if (ovrfun){
            let pxcol = Jimp.intToRGBA( this.img.getPixelColor(coords[0],coords[1]) );
            var prevCol = new Uint8Array(4);
            prevCol[0] = pxcol.r;
            prevCol[1] = pxcol.g;
            prevCol[2] = pxcol.b;
            prevCol[3] = pxcol.a;

            outcol = ovrfun(prevCol, outcol);
            }

        let C = Jimp.rgbaToInt(outcol[0],outcol[1],outcol[2], outcol[3]);
        this.img.setPixelColor(C, coords[0],coords[1]);

        this._lastCoords = coords;
        return this;
        }

    prism(args){
        this.setPixel( this.adapter(args), args.color, args.ovrfun );
        return this;
        }

    writeAtlasOnDisk(){
        this.img.write( this.outfile );
        console.log("Atlas "+this.outfile+" written.");
        return this;
        }
}

module.exports = QAtlas;