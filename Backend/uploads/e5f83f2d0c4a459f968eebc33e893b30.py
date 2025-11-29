# backend/clustering.py

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
import io
import base64

def load_and_preprocess_data(file_path):
    data = pd.read_csv(file_path)
    X = data.iloc[:, [3, 4]].values
    return X

def perform_kmeans(X, n_clusters=5):
    kmeans = KMeans(n_clusters=n_clusters, init='k-means++', random_state=42)
    Y = kmeans.fit_predict(X)
    return kmeans, Y

def generate_elbow_plot(X):
    wcss = []
    for i in range(1, 11):
        kmeans = KMeans(n_clusters=i, init='k-means++', random_state=42)
        kmeans.fit(X)
        wcss.append(kmeans.inertia_)
    
    plt.figure(figsize=(10, 6))
    sns.set()
    plt.plot(range(1, 11), wcss)
    plt.title('The Elbow Point Graph')
    plt.xlabel('Number of Clusters')
    plt.ylabel('WCSS')
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()
    
    return plot_url

def generate_cluster_plot(X, Y, kmeans):
    plt.figure(figsize=(10, 8))
    plt.scatter(X[Y==0, 0], X[Y==0, 1], s=50, c='green', label='Cluster 1')
    plt.scatter(X[Y==1, 0], X[Y==1, 1], s=50, c='red', label='Cluster 2')
    plt.scatter(X[Y==2, 0], X[Y==2, 1], s=50, c='yellow', label='Cluster 3')
    plt.scatter(X[Y==3, 0], X[Y==3, 1], s=50, c='violet', label='Cluster 4')
    plt.scatter(X[Y==4, 0], X[Y==4, 1], s=50, c='blue', label='Cluster 5')
    plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], s=100, c='cyan', label='Centroids')
    plt.title('Customer Groups')
    plt.xlabel('Annual Income (k$)')
    plt.ylabel('Spending Score (1-100)')
    plt.legend()
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()
    
    return plot_url