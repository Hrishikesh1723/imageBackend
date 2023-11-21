const { spawn } = require('child_process');
const express = require("express");
const axios = require('axios');
const router = express.Router();

// Function to run Python script with arguments
function calculateImageSimilarity(imageBase64_1, imageBase64_2) {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = './python/color.py';

        const pythonProcess = spawn('python', [pythonScriptPath]);

        const inputData = {
            image_base64_1: imageBase64_1,
            image_base64_2: imageBase64_2
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
                resolve({
                    similarityScore: result.similarity_score.toFixed(2),
                    similarityPercentage: result.similarity_percentage.toFixed(2) + '%'
                });
            } catch (error) {
                reject(`Error parsing JSON: ${error}`);
            }
        });
    });
}
   

router.post("/colorCompare", async (req, res) => {
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
                console.log('Similarity Score:', result.similarityScore);
                console.log('Similarity Percentage:', result.similarityPercentage);
                console.log(result)
                res.json(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    } catch (error) {
        console.log(error);
    }
})

module.exports = router;