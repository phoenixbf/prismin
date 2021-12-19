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

        // Defaults to 8-bit
        this.bitdepth = 8;
        this._vmax    = 255.0;

        if (this.delta <= 0.0) console.log("WARN: invalid range");
    }

    setMin(a){
        this.min = a;
        this.delta = (this.max - a);

        return this;
    }

    setMax(b){
        this.max   = b;
        this.delta = (b - this.min);

        return this;
    }

    getDelta(){
        return this.delta;
    }

    stringify(){
        return "["+this.min+","+this.max+"]";
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

    // Set bit-depth (default = 8)
    setBitDepth(bitdepth){
        if (bitdepth === undefined) return this;
        if (bitdepth < 0) return this;

        this.bitdepth = bitdepth;
        this._vmax    = (1 << bitdepth) - 1;

        return this;
    }

    // Quantize a value depending on current bit-depth
    quantize(v){
        let e = this.getClampedNorm(v);

        return parseInt(e * this._vmax);
    }

    // adapted from https://www.particleincell.com/2014/colormap/
    // Red to Blue
    colormapShort(v){
        let col = new Uint8Array(4);
        col[0] = 0;
        col[1] = 0;
        col[2] = 0;
        col[3] = 255;

        let f = this.getClampedNorm(v);

        let a = f * 4.0;	//invert and group
        var X = Math.floor(a);	//this is the integer part
        var Y = Math.floor(255*(a-X)); //fractional part from 0 to 255
        
        switch(X){
            case 0:
                col[0]=255;
                col[1]=Y;
                col[2]=0;
                break;
            case 1: 
                col[0]=255-Y;
                col[1]=255;
                col[2]=0;
                break;
            case 2:
                col[0]=0;
                col[1]=255;
                col[2]=Y;
                break;
            case 3: 
                col[0]=0;
                col[1]=255-Y;
                col[2]=255;
                break;
            case 4: 
                col[0]=0;
                col[1]=0;
                col[2]=255;
                break;
        }

        return col;
    }

    // adapted from https://www.particleincell.com/2014/colormap/
    // Red to Purple
    colormapLong(v){
        let col = new Uint8Array(4);
        col[0] = 0;
        col[1] = 0;
        col[2] = 0;
        col[3] = 255;

        let f = this.getClampedNorm(v);

        var a = f * 5.0;
        var X = Math.floor(a);
        var Y = Math.floor(255*(a-X));
        switch(X){
            case 0:
                col[0]=255;
                col[1]=Y;
                col[2]=0;
                break;
            case 1:
                col[0]=255-Y;
                col[1]=255;
                col[2]=0;
                break;
            case 2: 
                col[0]=0;
                col[1]=255; 
                col[2]=Y;
                break;
            case 3: 
                col[0]=0; 
                col[1]=255-Y; 
                col[2]=255;
                break;
            case 4: 
                col[0]=Y; 
                col[1]=0; 
                col[2]=255;
                break;
            case 5: 
                col[0]=255; 
                col[1]=0; 
                col[2]=255;
                break;
        }

        return col;
    }
}


module.exports = QRange;