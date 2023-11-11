const { spawn } = require('child_process');
const express = require("express");
const axios = require('axios');
const router = express.Router();

// Function to run Python script with arguments
function calculateImageSimilarity(imageBase64_1, imageBase64_2, numColors) {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = './python/color.py';

        const pythonProcess = spawn('python', [pythonScriptPath]);

        const inputData = {
            image_base64_1: imageBase64_1,
            image_base64_2: imageBase64_2,
            num_colors: numColors
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
        const imageBase64_1 = image_base64_1;
        const imageBase64_2 = image_base64_2;
        const numColors = 5;
        console.log("nsiudn")
        calculateImageSimilarity(imageBase64_1, imageBase64_2, numColors)
            .then((result) => {
                console.log('Similarity Score:', result.similarityScore);
                console.log('Similarity Percentage:', result.similarityPercentage);
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