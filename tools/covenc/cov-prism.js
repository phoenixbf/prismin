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

        //this.maxDelta = 1000;
/*
        this.maxDeltaDeaths    = 1;
        this.maxDeltaRecovered = 1;
        this.maxDeltaConfirmed = 1;
*/
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
        if (bDelta) col[0] = this.quantizeInRange(d, this.deltaDeaths); //Math.min( parseInt((d / this.maxDelta) * 255.0), 255);
        else col[0] = this.quantizeInRange(d, this.rangeDeaths); //Math.min( parseInt((d / this.maxDeaths) * 255.0), 255);
        
        // Recovered
        if (bDelta) col[1] = this.quantizeInRange(r, this.deltaRecovered); //Math.min( parseInt((r / this.maxDelta) * 255.0), 255);
        else col[1] = this.quantizeInRange(r, this.rangeRecovered); //Math.min( parseInt((r / this.maxRecovered) * 255.0), 255);
        
        // Confirmed
        if (bDelta) col[2] = this.quantizeInRange(c, this.deltaConfirmed); //Math.min( parseInt((c / this.maxDelta) * 255.0), 255);
        else col[2] = this.quantizeInRange(c, this.rangeConfirmed); //Math.min( parseInt((c / this.maxConfirmed) * 255.0), 255);
        
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