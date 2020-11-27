/*
    QVOSP - Quantized Voltage Session Prism (time-driven layout)

    This Prism produces a sequence of time-driven voltage atlases

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const QAtlas = require('../../core/qatlas');
const QPrism = require('../../core/qprism');
const QRange = require('../../core/qrange');

const EEG_STD_AMPL     = 256;
const EEG_STD_CHANNELS = 64;

class QVOSP extends QPrism {
    constructor(max_amplitude, max_channels){
        super();

        this._qsaW = (max_amplitude)? max_amplitude : EEG_STD_AMPL;
        this._qsaH = (max_channels)? max_channels : EEG_STD_CHANNELS;

        this.uid = undefined;
        this.trials = [];
        //this.pages = [];

        //this._vRange  = [-0.0002,0.0002];
        //this._vRangeD = 0.0004;
        this._vRange = new QRange(-0.0002,0.0002);
        this._vRangeHalfPos = new QRange(0.0, this._vRange.delta*0.5);

        this._wResize = 0;
        this._wCrop   = 0.0;
        }

    setUserID(u){
        this.uid = u;
    }

    setOutputResize(w){
        this._wResize = w;
    }
    setOutputCropWidth(wp){
        this._wCrop = wp;
    }

    setVoltageRange(min,max){
        if (max <= min) return;

        this._vRange = new QRange(min,max);
        this._vRangeHalfPos = new QRange(0.0, this._vRange.delta*0.5);
    }

    getOrCreateEEGAtlas(trialid){
        let A = this.trials[trialid];

        if (A === undefined){
            A = new QAtlas();
            A.setDimensions(this._qsaW,this._qsaH);
            A.clear(0x000000ff); // black
            //A._v = Array(this._qsaH).fill().map(() => Array(this._qsaW).fill(0.0));

            A.imgoutfolder = this.outfolder;
            if (this.uid) A.imgbasename = "u"+this.uid + "-t"+trialid;
            else A.imgbasename = "t"+trialid;

            this.trials[trialid] = A;
            }

        return A;
    }

    refract(args){
        let t = (args.trial)? args.trial : 0;
        let j = args.chanid;
        let i = parseInt(this._vRange.getClampedNorm(args.value) * this._qsaW);

        let A = this.getOrCreateEEGAtlas(t);

        //A._v[i][j] += 0.5;

        let col = A.getPixel([i,j]);

/*
        if (col[0] < 255) col[0] += 1;
        else {
            if (col[1] < 255) col[1] += 1;
            else {
                if (col[2] < 255) col[2] += 1;
            }
        }
*/
        if (col[0] < 255){
            col[0] += 1;
            col[1] += 1;
            col[2] += 1;
        }

        A.setPixel([i,j], col);

        return this;
        }

    bake(){
        for (const t in this.trials){
            let A = this.trials[t];

            console.log("Baking data for trial #"+t);
            A.bake();
        }

        return this;
    }

}

module.exports = QVOSP;