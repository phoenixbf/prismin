/*
    Quantized Atlas class

    This is used to encode user interaction states in a single image

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const Jimp = require('jimp');

class QAtlas {
    constructor(){
        this._resX = 64;
        this._resY = 64;
        this.img    = new Jimp(this._resX, this._resY, 0x00000000);

        this.imgext       = ".png";
        this.imgbasename  = "atlas";
        this.imgoutfolder = __dirname+"/";

        this._lastCoords = undefined;
    }

    setDimensions(W,H){
        this._resX = W;
        this._resY = H;
        this.img = new Jimp(this._resX, this._resY, 0x00000000);
        return this;
    }
    getDimensions(){
        return { w: this._resX, h: this._resY };
    }

    getPixel(coords){
        let pxcol = Jimp.intToRGBA( this.img.getPixelColor(coords[0],coords[1]) );
        let color8 = new Uint8Array(4);
        color8[0] = pxcol.r;
        color8[1] = pxcol.g;
        color8[2] = pxcol.b;
        color8[3] = pxcol.a;

        return color8;
    }

    setPixel(coords, color, ovrfun){
        let outcol = new Uint8Array(4);
        outcol[0] = color[0];
        outcol[1] = color[1];
        outcol[2] = color[2];
        outcol[3] = color[3];

        // If we provided an overlay policy function
        if (ovrfun){
            let prevCol = this.getPixel(coords);
            outcol = ovrfun(prevCol, outcol);
        }

        let C = Jimp.rgbaToInt(outcol[0],outcol[1],outcol[2], outcol[3]);
        this.img.setPixelColor(C, coords[0],coords[1]);

        this._lastCoords = coords;
        return this;
    }

    resize(w,h, bNearest){
        if (bNearest) this.img.resize(w, h, Jimp.RESIZE_NEAREST_NEIGHBOR);
        else this.img.resize(w, h, Jimp.RESIZE_BILINEAR);

        this._resX = w;
        this._resY = h;
    }
    crop(x, y, w, h){
        this.img.crop(x, y, w, h);
    }

    // Writes the atlas on disk
    bake(){
        let outimgpath = this.imgoutfolder + this.imgbasename + this.imgext;
        this.img.write( outimgpath );
        console.log("Atlas "+outimgpath+" written.");
        return this;
    }
}

module.exports = QAtlas;