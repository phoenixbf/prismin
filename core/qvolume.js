/*
    Quantized Volume class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const distance = require('euclidean-distance');
const aabb     = require('aabb-3d');
const clamp    = require('clamp');

const QA       = require('./qatlas');


QV = function(){
    this.name = undefined;
    this.vol = aabb([-1.0, -1.0, -1.0], [1.0, 1.0, 1.0]);
};

QV.prototype.setName = function(name){
    this.name = name;
    return this;
};

QV.prototype.setOriginAndExtents = function(origin,ext){
    this.vol = aabb(origin, ext);
    return this;
};

QV.prototype.getNormLocationInVolume = function(loc){
    var px = (loc[0] - this.vol.x0()) / this.vol.width();
    var py = (loc[1] - this.vol.y0()) / this.vol.height();
    var pz = (loc[2] - this.vol.z0()) / this.vol.depth();

    return [px,py,pz];
};

QV.prototype.encodeLocationToColor = function(loc){
    var P = this.getNormLocationInVolume(loc);

    var col = new Uint8Array(4);
    col[0] = 0;
    col[1] = 0;
    col[2] = 0;
    col[3] = 0;

    if (P[0] > 1.0 || P[0] < 0.0) return undefined;
    if (P[1] > 1.0 || P[1] < 0.0) return undefined;
    if (P[2] > 1.0 || P[2] < 0.0) return undefined;

    col[0] = parseInt(P[0] * 255.0);
    col[1] = parseInt(P[1] * 255.0);
    col[2] = parseInt(P[2] * 255.0);
    col[3] = 255;

    return col;
};

QV.prototype.decodeColorToLocation = function(col){
    // TODO:
};

module.exports = QV;