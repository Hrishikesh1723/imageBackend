const { spawn } = require('child_process');
const express = require("express");
const axios = require('axios');
const router2 = express.Router();

function calculateImageSimilarity(base64String1, base64String2) {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = './python/pattern.py';

        const pythonProcess = spawn('python', [pythonScriptPath]);

        const inputData = {
            base64_string1: base64String1,
            base64_string2: base64String2
        };

        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data;
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data;
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(`Python script closed with an error: ${stderrData}`);
                return;
            }

            try {
                const result = JSON.parse(stdoutData);
                resolve(result);
            } catch (error) {
                reject(`Error parsing JSON: ${error}`);
            }
        });
    });
}


router2.post("/patternCompare", async (req, res) => {
    const {image_base64_1, image_base64_2} = req.body
    if (!image_base64_1 || !image_base64_2) {
        return res.status(422).json({ error: "Please enter full detail!" });
    }
    try {
        const imageBase64_1 = req.body.image_base64_1;
        const imageBase64_2 = req.body.image_base64_2;
        const img1 = imageBase64_1.split(",")
        const img2 = imageBase64_2.split(",")
        console.log(img2[1])
        calculateImageSimilarity(img1[1], img2[1])
            .then((result) => {
                console.log('Result:', result.result);
                console.log('Similarity Percentage:', result.similarity_percentage.toFixed(2) + '%');
                res.json(result) 
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    } catch (error) {
        console.log(error);
    }
})

module.exports = router2;

