import cv2
import numpy as np
from sklearn.cluster import KMeans
from scipy.stats import wasserstein_distance
import base64
import json
import sys

def downsample_image(image, factor):
    return cv2.resize(image, (0, 0), fx=factor, fy=factor)

def extract_colors_from_image(image, num_colors):
    pixels = cv2.cvtColor(image, cv2.COLOR_BGR2HSV).reshape(-1, 3)
    
    kmeans = KMeans(n_clusters=num_colors).fit(pixels)
    
    counts = np.bincount(kmeans.labels_)
    percentages = (counts / counts.sum()) * 100
    
    color_data = sorted(zip(percentages, kmeans.cluster_centers_), key=lambda x: x[0], reverse=True)
    
    return color_data

def calculate_color_similarity(image1, image2, num_colors):
    colors1 = extract_colors_from_image(image1, num_colors)
    colors2 = extract_colors_from_image(image2, num_colors)
    
    hist1 = [color[0] for color in colors1]
    hist2 = [color[0] for color in colors2]
    
    emd_distance = wasserstein_distance(hist1, hist2)
    
    return emd_distance

def calculate_similarity_percentage(emd_distance, max_distance):
    similarity_percentage = 100 * (1 - (emd_distance / max_distance))
    return similarity_percentage

if __name__ == "__main__":
    # Read the image data from standard input
    input_data = json.load(sys.stdin)
    image_base64_1 = input_data["image_base64_1"]
    image_base64_2 = input_data["image_base64_2"]
    num_colors = 5
    downsample_factor = 0.5
    max_possible_distance = 10.0

    image1 = cv2.imdecode(np.frombuffer(base64.b64decode(image_base64_1), np.uint8), cv2.IMREAD_COLOR)
    image2 = cv2.imdecode(np.frombuffer(base64.b64decode(image_base64_2), np.uint8), cv2.IMREAD_COLOR)

    downsampled_image1 = downsample_image(image1, downsample_factor)
    downsampled_image2 = downsample_image(image2, downsample_factor)

    similarity_score = calculate_color_similarity(downsampled_image1, downsampled_image2, num_colors)
    similarity_percentage = calculate_similarity_percentage(similarity_score, max_possible_distance)

    # Output the results as a JSON object
    result = {
        'similarity_score': similarity_score,
        'similarity_percentage': similarity_percentage
    }
    json.dumps(result)
    print(json.dumps(result))