import cv2
import numpy as np
import base64
import json
import sys

def decode_base64_image(base64_string):
    base64_bytes = base64.b64decode(base64_string)
    image = np.frombuffer(base64_bytes, dtype=np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    return image



def calculate_image_similarity(base64_string1, base64_string2):
    image1 = decode_base64_image(base64_string1)
    image2 = decode_base64_image(base64_string2)

    
    max_height = 1080
    scaling_factor = max_height / max(image1.shape[0], image2.shape[0])
    image1 = cv2.resize(image1, (0, 0), fx=scaling_factor, fy=scaling_factor)
    image2 = cv2.resize(image2, (0, 0), fx=scaling_factor, fy=scaling_factor)

    sift = cv2.SIFT_create()

    keypoints1, descriptors1 = sift.detectAndCompute(cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY), None)
    keypoints2, descriptors2 = sift.detectAndCompute(cv2.cvtColor(image2, cv2.COLOR_BGR2GRAY), None)

    bf = cv2.BFMatcher()

    matches = bf.knnMatch(descriptors1, descriptors2, k=2)

    good_matches = []
    for m, n in matches:
        if m.distance < 0.75 * n.distance:
            good_matches.append(m)

    if len(good_matches) > 4:
        src_pts = np.float32([keypoints1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([keypoints2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

        homography, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        inlier_percentage = (np.sum(mask) / len(good_matches)) * 100

        similarity_threshold = 30.0

        if inlier_percentage >= similarity_threshold:
            return {"result": "Images are similar", "similarity_percentage": inlier_percentage}
        else:
            return {"result": "Images are not similar", "similarity_percentage": inlier_percentage}
    else:
        return {"result": "Not enough matches to determine similarity", "similarity_percentage": 0.0}

if __name__ == "__main__":
    # Read the base64 image data from standard input
    input_data = json.load(sys.stdin)
    base64_string1 = input_data["base64_string1"]
    base64_string2 = input_data["base64_string2"]

    result = calculate_image_similarity(base64_string1, base64_string2)

    # Output the results as a JSON object
    print(json.dumps(result))