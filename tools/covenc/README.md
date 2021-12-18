# PRISMIN COVID-19 data encoder

To test out the encoder, you can try the following, from PRISMIN root folder:
```
node ./tools/covenc/main.js
```
that will encode public daily updated COVID dataset (entire world) into a QSA.
You can also specify comma-separated states:
```
node ./tools/covenc/main.js --states Italy,US
```
also specify a time-frame starting from a specific day to current day (world-wide):
```
node ./tools/covenc/main.js --day 612
```