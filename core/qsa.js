/*
    QSA
    Time-driven layout

    Author: Bruno Fanini (bruno.fanini__AT__gmail.com)

==========================================================================*/
const QAtlas   = require('./qatlas');

const QSA_STD_TIME_RES = 4096;
const QSA_STD_USERS    = 1024;

class QSA extends QAtlas {
    constructor(){
        super();

        this.setDimensions(QSA_STD_TIME_RES,QSA_STD_USERS);
        this.page = 0;

        this.adapter = function(args){
            let i = parseInt(args.time / args.dt);
            let j = args.uid;
            return [i,j];
            };
        }

}

module.exports = QSA;


