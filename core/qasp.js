/*
    QASP - Quantized Attribute Session Prism (time-driven layout)

    This Prism produces a sequence of time-driven atlases (QSAs)

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const QAtlas = require('./qatlas');
const Prism  = require('./prism');

const QSA_STD_TIME_RES = 4096;
const QSA_STD_USERS    = 1024;


class QASP extends Prism {
    constructor(){
        super();

        this.pages = []; // list of QSAs
        this.outfolder = undefined;
        this.ovrfunction = undefined;
        }

    getOrCreatePage(i){
        if (this.pages[i]) return this.pages[i];

        let A = new QAtlas();
        A.setDimensions(QSA_STD_TIME_RES,QSA_STD_USERS);

        A.imgoutfolder = this.outfolder;
        A.imgbasename = "qsa"+i;

        A._lastUserMark = []; // Kepp track of each user last refraction

        this.pages[i] = A;
        return A;
        }

    refract(args){
        let x = parseInt(args.time * args.tm);
        
        let i = x % QSA_STD_TIME_RES;
        let j = args.uid;
        let p = parseInt( Math.floor(x / QSA_STD_TIME_RES) );

        let A = this.getOrCreatePage(p);
        A.setPixel([i,j], args.color, this.ovrfunction);

        // Fill empty gaps
        if (A._lastUserMark[j]){
            let iprev = A._lastUserMark[j];
            let C = A.getPixel([iprev,j]);

            let di = (i-iprev);
            if (di <= 1) return this;

            for (let k = iprev; k < i; k++) A.setPixel([k,j], C, this.ovrfunction);
            }

        A._lastUserMark[j] = i;

        return this;
        }

    bake(){
        for (const p in this.pages){
            if (this.pages[p]){
                console.log("Baking QSA #"+p);
                this.pages[p].bake();
                }
            }

        return this;
        }
}

module.exports = QASP;


