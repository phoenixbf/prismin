/*
    Encoder class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const fs = require('fs');
const QVolume = require('./qvolume');


QEncoder = function(){
    this.volumes = [];
};

QEncoder.prototype.addVolume = function(position, extents, name){
    let V = new QVolume();

    V.setOriginAndExtents(position, extents);
    if (name) V.setName(name);

    return this;
};

QEncoder.prototype.addVolumesFromJSON = function(filepath, onComplete){
    let enc = this;

    fs.readFile(filepath, 'utf-8', (err, data) => {
        if (err) console.log("QV json not found!");
        else {
            var QVdata = JSON.parse(data);
            if (QVdata.list){
                for (let v = 0; v < QVdata.list.length; v++){
                    let V = QVdata.list[v];

                    enc.addVolume(V.position, V.extents, V.name);
                    }
                }
            }

        if (onComplete) onComplete();
        });

    return enc;
};

QEncoder.prototype.writeAllAtlases = function(){
    for (let v = 0; v < this.volumes.length; v++) {
        this.volumes[v].writeAllAtlasesOnDisk();
        }

};

module.exports = QEncoder;