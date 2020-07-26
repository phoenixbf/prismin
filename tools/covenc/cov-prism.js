/*
    COV Prism to encode COVID data

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const QAtlas = require('../../core/qatlas');
const QPrism = require('../../core/qprism');
const QRange = require('../../core/qrange');

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

        this.rangeDeaths    = new QRange(0,1);
        this.rangeRecovered = new QRange(0,1);
        this.rangeConfirmed = new QRange(0,1);

        this.deltaDeaths    = new QRange(-1,1); //[-1,1];
        this.deltaRecovered = new QRange(-1,1); //[-1,1];
        this.deltaConfirmed = new QRange(-1,1); //[-1,1];

        this.pRange      = new QRange(0,1);
        this.pRangeDelta = new QRange(-1,1);
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
        let e = (d - range[0])/delta;
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
        if (bDelta) 
            col[0] = this.deltaDeaths.quantize(d);
            //col[0] = this.pRangeDelta.quantize(d);
        else 
            col[0] = this.rangeDeaths.quantize(d);
            //col[0] = this.pRange.quantize(d);
        
        // Recovered
        if (bDelta) 
            col[1] = this.deltaRecovered.quantize(r);
            //col[1] = this.pRangeDelta.quantize(r);
        else 
            col[1] = this.rangeRecovered.quantize(r);
            //col[1] = this.pRange.quantize(r);
        
        // Confirmed
        if (bDelta) 
            col[2] = this.deltaConfirmed.quantize(c);
            //col[2] = this.pRangeDelta.quantize(c);
        else 
            col[2] = this.rangeConfirmed.quantize(c);
            //col[2] = this.pRange.quantize(c);
        
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