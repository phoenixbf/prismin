/*
    Encoder class
    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const fs = require('fs');
const QVolume = require('./qvolume');


class QEncoder {
    constructor(){
        this.volumes = [];
        }

    addVolume(position, extents, name){
        let V = new QVolume();

        V.setOriginAndExtents(position, extents);
        if (name) V.setName(name);

        this.volumes.push(V);

        return this;
        }

    // Loads and parse a list of volumes form JSON file
    addVolumesFromJSON(filepath, onComplete){
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
        }

    refractAllVolumes(args){
        let numVolumes = this.volumes.length;
        for (let v = 0; v < numVolumes; v++) this.volumes[v].refract(args);
        return this;
        }

    bakeAllVolumes(){
        for (let v = 0; v < this.volumes.length; v++) {
            this.volumes[v].bake();
            }

        return this;
        }

}

module.exports = QEncoder;