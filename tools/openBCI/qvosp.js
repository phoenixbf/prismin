/*
    QVOSP - Quantized Voltage Session Prism (time-driven layout)

    This Prism produces a sequence of time-driven voltage atlases

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const QAtlas = require('../../core/qatlas');
const Prism  = require('../../core/prism');

const QSA_STD_TIME_RES = 4096;
const QSA_STD_CHANNELS = 16;

class QVOSP extends Prism {
    constructor(time_res, max_channels){
        super();

        this._qsaW = (time_res)? time_res : QSA_STD_TIME_RES;
        this._qsaH = (max_channels)? max_channels : QSA_STD_CHANNELS;

        this.pages = [];

        this._vRange = [-0.0002,0.0002];
        }

    setVoltageRange(min,max){
        if (max <= min) return;
        this._vRange = [min,max];
        }

    encodeChannelValue(v, bbw){
        var col = new Uint8Array(4);
        col[0] = 0;
        col[1] = 0;
        col[2] = 0;
        col[3] = 0;

        //if (v < this._vRange[0] || v > this._vRange[1]) return col;
        if (v < this._vRange[0]) v = this._vRange[0];
        if (v > this._vRange[1]) v = this._vRange[1];

        if (bbw){
            let R = this._vRange[1] - this._vRange[0];
            let q = parseInt(((v + this._vRange[0]) / R) * 255.0);

            col[0] = q;
            col[1] = q;
            col[2] = q;
            col[3] = 255;
            }
        else {
            let R = (this._vRange[1] - this._vRange[0])*0.5;
            let q = 0;
            if (v < 0.0){
                q = parseInt((-v/R)*255.0);
                col[0] = q;
                }
            else {
                q = parseInt((v/R)*255.0);
                col[1] = q;
                }

            col[3] = 255;
            }

        return col;
        }

    getOrCreatePage(i){
        if (this.pages[i]) return this.pages[i];

        let A = new QAtlas();
        A.setDimensions(this._qsaW,this._qsaH);

        A.imgoutfolder = this.outfolder;
        A.imgbasename = "qvs"+i;

        A._lastUserMark = []; // Kepp track of each user last refraction

        this.pages[i] = A;
        return A;
        }

    refract(args){  
        let i = args.tind % this._qsaW;
        let j = args.chanid;

        let p = parseInt( Math.floor(args.tind / this._qsaW) );

        let A = this.getOrCreatePage(p);
        A.setPixel([i,j], args.color, this.ovrfunction);

        this._tind++;

        A._lastUserMark[j] = i;

        return this;
        }

    bake(){
        for (const p in this.pages){
            if (this.pages[p]){
                console.log("Baking data into QVS #"+p);
                this.pages[p].bake();
                }
            }

        return this;
        }

}

module.exports = QVOSP;