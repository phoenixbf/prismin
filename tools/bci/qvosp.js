/*
    QVOSP - Quantized Voltage Session Prism (time-driven layout)

    This Prism produces a sequence of time-driven voltage atlases

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const QAtlas = require('../../core/qatlas');
const QPrism  = require('../../core/qprism');

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

        this._vRange  = [-0.0002,0.0002];
        this._vRangeD = 0.0004;

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
        this._vRange  = [min,max];
        this._vRangeD = (max-min);
    }

    quantizeInRange(v, range){
        let delta = range[1]-range[0];
        let e = (v - range[0])/delta;
        if (e < 0.0) e = 0.0;
        if (e > 1.0) e = 1.0;

        return parseInt(e * 255.0);
    }

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

        let R = this._vRangeD * 0.25;

        //d = Math.min(Math.max(d, -R), R);
        //v = Math.min(Math.max(v, this._vRange[0]), this._vRange[1]);

        if (d >= 0.0){
            col[1] = this.quantizeInRange(d, [0.0,R]);
        }
        else {
            col[0] = this.quantizeInRange(-d, [0.0,R]);
        }

        if (v){
            //let q = parseInt(((v + this._vRange[0]) / this._vRangeD) * 255.0);
            //q = Math.min(Math.max(q, 0), 255);
            col[2] = this.quantizeInRange(v, this._vRange);
        }

        return col;
    }

    encodeChannelValue(v, bbw){
        let col = new Uint8Array(4);
        col[0] = 0;
        col[1] = 0;
        col[2] = 0;
        col[3] = 255;

        if (v < this._vRange[0]) v = this._vRange[0];
        if (v > this._vRange[1]) v = this._vRange[1];

        if (bbw){
            //let q = parseInt(((v + this._vRange[0]) / this._vRangeD) * 255.0);
            let q = this.quantizeInRange(v, this._vRange);

            col[0] = q;
            col[1] = q;
            col[2] = q;
            }
        else {
            if (v < 0.0) 
                col[0] = this.quantizeInRange(-v, [0.0,this._vRangeD*0.5]);
            else 
                col[1] = this.quantizeInRange(v, [0.0,this._vRangeD*0.5]);
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
                        let wcut = parseInt(A.getDimensions().w * this._wCrop);
                        A.crop(wcut,0, A.getDimensions().w - (wcut*2.0),A.getDimensions().h);
                        }

                    A.bake();
                }
            }
        }

        return this;
        }

}

module.exports = QVOSP;