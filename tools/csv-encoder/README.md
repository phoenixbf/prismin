# CSV Encoder

To test out the CSV encoder, you can try the following, from current folder:
```
node app.js --csv ../../sample-data/vest/csv/vest-U0.csv --vol ../../sample-data/vest/volumes.json
```
that will encode a sample CSV user session (vest-U0.csv) in different volumes defined in "volumes.json", generating several QSAs into the output folder ("_OUT/").

The following will encode the entire CSV folder (multiple CSV sessions):
```
node app.js --csvdir ../../sample-data/vest/csv/ --vol ../../sample-data/vest/volumes.json
```
