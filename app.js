const express = require('express')
const app = express()
app.use(express.json())
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
require('dotenv').config()
const port = process.env.PORT || 3000;

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

app.post('/updateStreamUrl', (req, res) => {
    let bucket = req.body?.bucket;
    let path = req.body?.path;
    let streamUrl = req.body?.streamUrl;

    if(!bucket || !path || !streamUrl) {
        res.status(400).send('Missing parameters');
        return;
    }
    var getParams = {
        Bucket: bucket,
        Key: path
    }

    try {
        s3.getObject(getParams, function (err, data) {
            if (err && err.code === 'NoSuchKey') {
                res.status(404).send('File not found');
                return;
            }
            let json  = JSON.parse(data.Body)
            json.stream.liveStreamUrl = streamUrl;
            s3.putObject({
                Bucket: bucket,
                Key: path,
                Body: JSON.stringify(json, null, 2),
                ContentType: 'application/json',
                ACL: 'public-read'
              }, function(){
                console.log("Successfully updated stream url");
                res.send(`Successfully updated stream url https://${bucket}.s3.amazonaws.com/${path}`);
              })
        });
    } catch (error) {
        console.log(error, 'catch error');
        res.status(500).send(error);
    }
})



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})