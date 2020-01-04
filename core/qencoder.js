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

    prism(args){
        for (let v = 0; v < this.volumes.length; v++){
            this.volumes[v].prism(args);
            }

        return this;
        }

    writeAllAtlasesOnDisk(){
        for (let v = 0; v < this.volumes.length; v++) {
            this.volumes[v].writeAllAtlasesOnDisk();
            }

        return this;
        }

}

module.exports = QEncoder;