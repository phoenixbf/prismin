/*
    COV Prism to encode COVID data

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const QAtlas = require('../../core/qatlas');
const QPrism  = require('../../core/qprism');

const QSA_STD_TIME_RES = 128;
const QSA_STD_STATES   = 256;

class COVP extends QPrism {
    constructor(time_res, max_states){
        super();

        this._qsaW = (time_res)? time_res : QSA_STD_TIME_RES;
        this._qsaH = (max_states)? max_states : QSA_STD_STATES;

        this._qsa = new QAtlas();
        this._qsa.setDimensions(this._qsaW,this._qsaH);
        this._qsa.imgoutfolder = this.outfolder;
        this._qsa.imgbasename = "cov-qsa";

        this.rangeDeaths    = [0,1];
        this.rangeRecovered = [0,1];
        this.rangeConfirmed = [0,1];

        this.deltaDeaths    = [-1,1];
        this.deltaRecovered = [-1,1];
        this.deltaConfirmed = [-1,1];
        }

    setDimensions(w,h){
        this._qsaW = w;
        this._qsaH = h;
        this._qsa.setDimensions(this._qsaW,this._qsaH);
        }

    setOutFolder(outfolder){
        this.outfolder = outfolder;
        this._qsa.imgoutfolder = outfolder;
        }

    quantizeInRange(d, range){
        let delta = range[1]-range[0];
        let e = (d + range[0])/delta;
        if (e < 0.0) e = 0.0;
        if (e > 1.0) e = 1.0;

        return parseInt(e * 255.0);
        }

    encodeData(c,d,r, bDelta){
        var col = new Uint8Array(4);
        col[0] = 0;
        col[1] = 0;
        col[2] = 0;
        
        // Deaths
        if (bDelta) col[0] = this.quantizeInRange(d, this.deltaDeaths);
        else col[0] = this.quantizeInRange(d, this.rangeDeaths);
        
        // Recovered
        if (bDelta) col[1] = this.quantizeInRange(r, this.deltaRecovered);
        else col[1] = this.quantizeInRange(r, this.rangeRecovered);
        
        // Confirmed
        if (bDelta) col[2] = this.quantizeInRange(c, this.deltaConfirmed);
        else col[2] = this.quantizeInRange(c, this.rangeConfirmed);
        
        col[3] = 255;

        return col;
        }

    refract(args){
        let i = args.tind;
        let j = args.sid;

        if (j >= this._qsaH || i >= this._qsaW) return this;

        this._qsa.setPixel([i,j], args.color);
        }

    bake(){
        console.log("Encoding data into COV-QSA..");
        this._qsa.bake();
        }

}


module.exports = COVP;