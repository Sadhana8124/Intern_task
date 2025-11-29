
# app.py
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

import io
import base64
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans

#from waitress import serve
from flask import Flask, render_template, request, jsonify
from backend.basic import load_and_preprocess_data, perform_kmeans, generate_elbow_plot, generate_cluster_plot
template_dir = os.path.abspath(os.path.dirname(__file__))
template_dir = os.path.join(template_dir, 'templates')
app = Flask(__name__,template_folder='templates')

# Replace this with the path to your CSV file
data = pd.read_csv('C:/Users/SADHANA/Downloads/Mall_Customers.csv')
X = data[['Annual Income (k$)', 'Spending Score (1-100)']].values
kmeans = KMeans(n_clusters=5, random_state=42)
kmeans.fit(X)


@app.route('/test_plot')
def test_plot():
    plt.figure()
    plt.plot([1, 2, 3, 4])
    plt.title('Test Plot')
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    
    return f'<img src="data:image/png;base64,{plot_url}">'
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    n_clusters = int(request.form['n_clusters'])
    
    X = load_and_preprocess_data(data)
    kmeans, Y = perform_kmeans(X, n_clusters)
    
    elbow_plot = generate_elbow_plot(X)
    cluster_plot = generate_cluster_plot(X, Y, kmeans)
    print("Elbow plot generated:", elbow_plot[:50])  
    print("Cluster plot generated:", cluster_plot[:50])
    return jsonify({
        'elbow_plot': elbow_plot,
        'cluster_plot': cluster_plot
    })
@app.route('/predict', methods=['POST'])
def predict():
    try:
        annual_income = float(request.form['annual_income'])
        spending_score = float(request.form['spending_score'])
        
        # Predict cluster
        user_data = np.array([[annual_income, spending_score]])
        cluster = kmeans.predict(user_data)[0]
        cluster = cluster+1
        Y = kmeans.predict(X)
        # Generate plot
        plt.figure(figsize=(8,8))
        plt.scatter(X[Y==0, 0], X[Y==0, 1], s=50, c='green', label='Cluster 1')
        plt.scatter(X[Y==1, 0], X[Y==1, 1], s=50, c='red', label='Cluster 2')
        plt.scatter(X[Y==2, 0], X[Y==2, 1], s=50, c='yellow', label='Cluster 3')
        plt.scatter(X[Y==3, 0], X[Y==3, 1], s=50, c='violet', label='Cluster 4')
        plt.scatter(X[Y==4, 0], X[Y==4, 1], s=50, c='blue', label='Cluster 5')
        plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], s=100, c='cyan', label='Centroids')
        plt.scatter(annual_income, spending_score, s=200, c='black', marker='X', label='User Input')
        plt.title('CUSTOMER GROUPS')
        plt.xlabel('Annual income')
        plt.ylabel('Spending Score')
        plt.legend()
        img=io.BytesIO()
        plt.savefig(img,format='png')
        img.seek(0)
        plt.close()  # Close the figure to avoid memory leaks

        #img = open('user_cluster_plot.png', 'rb').read()
        img_base64 = base64.b64encode(img.getvalue()).decode()
        
        
        
        return f'''
            <h2>User belongs to Cluster {cluster}</h2>
            <img src="data:image/png;base64,{img_base64}">
        '''

    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
    