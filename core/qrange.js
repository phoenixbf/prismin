/*
    PRISMIN base range class

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/

class QRange {
    constructor(a,b){
        if (a === undefined) console.log("WARN: undefined range min");
        if (b === undefined) console.log("WARN: undefined range max");

        this.min   = a;
        this.max   = b;
        this.delta = (b-a);

        if (this.delta <= 0.0) console.log("WARN: invalid range");
    }

    setMin(a){
        this.min = a;
        this.delta = (this.max - a);
    }

    setMax(b){
        this.max   = b;
        this.delta = (b - this.min);
    }

    // get normalized value (no bounds check)
    getNorm(v){
       let e = (v - this.min) / this.delta;
       return e; 
    }

    // get normalized value, clamped in [0.0,1.0]
    getClampedNorm(v){
        let e = (v - this.min) / this.delta;
        if (e < 0.0) return 0.0;
        if (e > 1.0) return 1.0;

        return e;
    }

    // 8bit quantization
    quantize(v){
        let e = this.getClampedNorm(v);

        return parseInt(e * 255.0);
    }
}


module.exports = QRange;