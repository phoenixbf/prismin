/*
    QVOSP - Quantized Voltage Session Prism (time-driven layout)

    This Prism produces a sequence of time-driven voltage atlases

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const QAtlas = require('../../core/qatlas');
const QPrism = require('../../core/qprism');
const QRange = require('../../core/qrange');

const QSA_STD_TIME_RES = 4096;
const QSA_STD_CHANNELS = 16;

class QVOSP extends QPrism {
    constructor(time_res, max_channels){
        super();

        this._qsaW = (time_res)? time_res : QSA_STD_TIME_RES;
        this._qsaH = (max_channels)? max_channels : QSA_STD_CHANNELS;

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

/*
    quantizeInRange(v, range){
        let delta = range[1]-range[0];
        let e = (v - range[0])/delta;
        if (e < 0.0) e = 0.0;
        if (e > 1.0) e = 1.0;

        return parseInt(e * 255.0);
    }
*/
    encodeChannelThreeBand(v){
        let col = new Uint8Array(4);
        col[0] = 0;
        col[1] = 0;
        col[2] = 0;
        col[3] = 0;

        let v0 = v;
        let v1 = v; //*0.1;
        let v2 = v; //*0.01;

        if (v < this._vRange[0]) v0 = this._vRange[0];
        if (v > this._vRange[1]) v0 = this._vRange[1];

        if (v < this._vRange[0]*0.1) v1 = this._vRange[0]*0.1;
        if (v > this._vRange[1]*0.1) v1 = this._vRange[1]*0.1;

        if (v < this._vRange[0]*0.01) v2 = this._vRange[0]*0.01;
        if (v > this._vRange[1]*0.01) v2 = this._vRange[1]*0.01;

        let q0 = parseInt(((v0 + (this._vRange[0])) / this._vRangeD) * 255.0);
        let q1 = parseInt(((v1 + (this._vRange[0]*0.1)) / (this._vRangeD*0.1)) * 255.0);
        let q2 = parseInt(((v2 + (this._vRange[0]*0.01)) / (this._vRangeD*0.01)) * 255.0);

        col[0] = q0;
        col[1] = q1;
        col[2] = q2;
        col[3] = 255;

        return col;
    }

    encodeChannelDelta(d, v){
        let col = new Uint8Array(4);
        col[0] = 0;
        col[1] = 0;
        col[2] = 0;
        col[3] = 255;

        if (d === undefined) return col;

        //let R = new QRange(0.0, this._vRange.delta*0.5);

        if (d >= 0.0){
            col[1] = this._vRangeHalfPos.quantize(d); //this.quantizeInRange(d, R);
        }
        else {
            col[0] = this._vRangeHalfPos.quantize(-d); //this.quantizeInRange(-d, R);
        }

        if (v){
            col[2] = this._vRange.quantize(v); //this.quantizeInRange(v, this._vRange);
        }

        return col;
    }

    encodeChannelValueRainbow(v){
        let col = this._vRange.colormapShort(v);
        return col;
    }

    encodeChannelValue(v, bbw){
        let col = new Uint8Array(4);
        col[0] = 0;
        col[1] = 0;
        col[2] = 0;
        col[3] = 255;

        if (bbw){
            let q = this._vRange.quantize(v);

            col[0] = q;
            col[1] = q;
            col[2] = q;
            }
        else {
            if (v < 0.0) col[0] = this._vRangeHalfPos.quantize(-v);
            else         col[1] = this._vRangeHalfPos.quantize(v);
            }

        return col;
        }

    getOrCreatePage(trialid, i){
        //if (this.pages[i]) return this.pages[i];

        if (!this.trials[trialid]){
            this.trials[trialid] = {};
            this.trials[trialid].pages = [];
            }

        let T = this.trials[trialid];
        if (T.pages[i]) return T.pages[i];

        let A = new QAtlas();
        A.setDimensions(this._qsaW,this._qsaH);
        A.clear(0x000000ff); // black

        A.imgoutfolder = this.outfolder;
        if (this.uid) A.imgbasename = "u"+this.uid + "-t"+trialid+"-qvs"+i;
        else A.imgbasename = "t"+trialid+"-qvs"+i;

        //A._lastUserMark = []; // Keep track of each user last refraction

        T.pages[i] = A;
        //this.pages[i] = A;
        return A;
        }

    refract(args){
        let u = (args.uid)? args.uid : 0;
        let t = (args.trial)? args.trial : 0;
        let i = args.tind % this._qsaW;
        let j = args.chanid;

        let p = parseInt( Math.floor(args.tind / this._qsaW) );

        let A = this.getOrCreatePage(t,p);
        A.setPixel([i,j], args.color, this.ovrfunction);

        //this._tind++;

        //A._lastUserMark[j] = i;

        return this;
        }

    bake(){
        for (const t in this.trials){
            let T = this.trials[t];
            for (const p in T.pages){
                if (T.pages[p]){
                    let A = T.pages[p];
                    console.log("Baking data for trial #"+t+" into QVS #"+p);

                    if (this._wResize > 0) A.resize(this._wResize, this._qsaH);

                    if (this._wCrop > 0.0){
                        let aw = A.getDimensions().w;
                        let ah = A.getDimensions().h;
                        let cutstart = parseInt(aw * this._wCrop);
                        let cutw = aw - (aw * this._wCrop * 2.0);

                        A.crop(cutstart,0, cutw,ah);
                        }

                    A.bake();
                }
            }
        }

        return this;
        }

}

module.exports = QVOSP;