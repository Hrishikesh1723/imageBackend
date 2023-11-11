import cv2
import numpy as np
from sklearn.cluster import KMeans
from scipy.stats import wasserstein_distance
import base64
import json
import sys

def extract_colors_from_image_base64(image_base64, num_colors):
    # Decode the base64 image data
    image_data = base64.b64decode(image_base64)
    image_np = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    
    # Convert the image to HSV color space
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Reshape the image to be a list of pixels
    pixels = hsv_image.reshape(-1, 3)
    
    # Use K-Means clustering to group similar colors
    kmeans = KMeans(n_clusters=num_colors)
    kmeans.fit(pixels)
    
    # Calculate the percentage of each color cluster in the image
    cluster_centers = kmeans.cluster_centers_
    labels = kmeans.labels_
    
    # Count the number of pixels in each cluster
    counts = np.bincount(labels)
    
    # Get the percentage of each color
    percentages = (counts / counts.sum()) * 100
    
    # Sort the colors by percentage
    color_data = [(percent, color) for percent, color in zip(percentages, cluster_centers)]
    color_data.sort(reverse=True)
    
    return color_data

def calculate_color_similarity_from_base64(image_base641, image_base642, num_colors):
    colors1 = extract_colors_from_image_base64(image_base641, num_colors)
    colors2 = extract_colors_from_image_base64(image_base642, num_colors)
    
    # Extract color histograms
    hist1 = [color[0] for color in colors1]
    hist2 = [color[0] for color in colors2]
    
    # Calculate Earth Mover's Distance (EMD) between the histograms
    emd_distance = wasserstein_distance(hist1, hist2)
    
    # The smaller the EMD distance, the more similar the images are
    return emd_distance

def calculate_similarity_percentage(emd_distance, max_distance):
    # Calculate the similarity percentage
    similarity_percentage = 100 * (1 - (emd_distance / max_distance))
    return similarity_percentage

if __name__ == "__main__":
    # Read the image data from standard input
    input_data = json.load(sys.stdin)
    image_base64_1 = input_data["image_base64_1"]
    image_base64_2 = input_data["image_base64_2"]
    num_colors = int(input_data["num_colors"])

    max_possible_distance = 10.0

    similarity_score = calculate_color_similarity_from_base64(image_base64_1, image_base64_2, num_colors)
    similarity_percentage = calculate_similarity_percentage(similarity_score, max_possible_distance)

    # Output the results as a JSON object
    result = {
        'similarity_score': similarity_score,
        'similarity_percentage': similarity_percentage,
        'dkfk9ff0':500
    }
    json.dumps(result)
    print(json.dumps(result))