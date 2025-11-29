{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": 2,
   "id": "2fa1e76e-f3db-4f32-9587-87a6d93c2f40",
   "metadata": {},
   "outputs": [],
   "source": [
    "import numpy as np\n",
    "import pandas as pd\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "from sklearn.cluster import KMeans"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 6,
   "id": "636146ad-bf34-4da5-a5ea-fae5f7a9aaea",
   "metadata": {},
   "outputs": [],
   "source": [
    "data=pd.read_csv('C:/Users/SADHANA/Downloads/Mall_Customers.csv')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 7,
   "id": "988a71b8-808d-4d53-b767-da0b0c6c0313",
   "metadata": {},
   "outputs": [
    {
     "data": {
      "text/html": [
       "<div>\n",
       "<style scoped>\n",
       "    .dataframe tbody tr th:only-of-type {\n",
       "        vertical-align: middle;\n",
       "    }\n",
       "\n",
       "    .dataframe tbody tr th {\n",
       "        vertical-align: top;\n",
       "    }\n",
       "\n",
       "    .dataframe thead th {\n",
       "        text-align: right;\n",
       "    }\n",
       "</style>\n",
       "<table border=\"1\" class=\"dataframe\">\n",
       "  <thead>\n",
       "    <tr style=\"text-align: right;\">\n",
       "      <th></th>\n",
       "      <th>CustomerID</th>\n",
       "      <th>Gender</th>\n",
       "      <th>Age</th>\n",
       "      <th>Annual Income (k$)</th>\n",
       "      <th>Spending Score (1-100)</th>\n",
       "    </tr>\n",
       "  </thead>\n",
       "  <tbody>\n",
       "    <tr>\n",
       "      <th>0</th>\n",
       "      <td>1</td>\n",
       "      <td>Male</td>\n",
       "      <td>19</td>\n",
       "      <td>15</td>\n",
       "      <td>39</td>\n",
       "    </tr>\n",
       "    <tr>\n",
       "      <th>1</th>\n",
       "      <td>2</td>\n",
       "      <td>Male</td>\n",
       "      <td>21</td>\n",
       "      <td>15</td>\n",
       "      <td>81</td>\n",
       "    </tr>\n",
       "    <tr>\n",
       "      <th>2</th>\n",
       "      <td>3</td>\n",
       "      <td>Female</td>\n",
       "      <td>20</td>\n",
       "      <td>16</td>\n",
       "      <td>6</td>\n",
       "    </tr>\n",
       "    <tr>\n",
       "      <th>3</th>\n",
       "      <td>4</td>\n",
       "      <td>Female</td>\n",
       "      <td>23</td>\n",
       "      <td>16</td>\n",
       "      <td>77</td>\n",
       "    </tr>\n",
       "    <tr>\n",
       "      <th>4</th>\n",
       "      <td>5</td>\n",
       "      <td>Female</td>\n",
       "      <td>31</td>\n",
       "      <td>17</td>\n",
       "      <td>40</td>\n",
       "    </tr>\n",
       "  </tbody>\n",
       "</table>\n",
       "</div>"
      ],
      "text/plain": [
       "   CustomerID  Gender  Age  Annual Income (k$)  Spending Score (1-100)\n",
       "0           1    Male   19                  15                      39\n",
       "1           2    Male   21                  15                      81\n",
       "2           3  Female   20                  16                       6\n",
       "3           4  Female   23                  16                      77\n",
       "4           5  Female   31                  17                      40"
      ]
     },
     "execution_count": 7,
     "metadata": {},
     "output_type": "execute_result"
    }
   ],
   "source": [
    "data.head()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 8,
   "id": "6f684df8-d481-4f58-846e-47d026f7a906",
   "metadata": {},
   "outputs": [
    {
     "data": {
      "text/plain": [
       "(200, 5)"
      ]
     },
     "execution_count": 8,
     "metadata": {},
     "output_type": "execute_result"
    }
   ],
   "source": [
    "data.shape"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 9,
   "id": "04a309f7-bb4c-4169-9895-669f80aa9638",
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "<class 'pandas.core.frame.DataFrame'>\n",
      "RangeIndex: 200 entries, 0 to 199\n",
      "Data columns (total 5 columns):\n",
      " #   Column                  Non-Null Count  Dtype \n",
      "---  ------                  --------------  ----- \n",
      " 0   CustomerID              200 non-null    int64 \n",
      " 1   Gender                  200 non-null    object\n",
      " 2   Age                     200 non-null    int64 \n",
      " 3   Annual Income (k$)      200 non-null    int64 \n",
      " 4   Spending Score (1-100)  200 non-null    int64 \n",
      "dtypes: int64(4), object(1)\n",
      "memory usage: 7.9+ KB\n"
     ]
    }
   ],
   "source": [
    "data.info()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 10,
   "id": "1379297f-4bea-4772-9d08-787e68ecf73f",
   "metadata": {},
   "outputs": [
    {
     "data": {
      "text/plain": [
       "CustomerID                0\n",
       "Gender                    0\n",
       "Age                       0\n",
       "Annual Income (k$)        0\n",
       "Spending Score (1-100)    0\n",
       "dtype: int64"
      ]
     },
     "execution_count": 10,
     "metadata": {},
     "output_type": "execute_result"
    }
   ],
   "source": [
    "data.isnull().sum()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 11,
   "id": "870243f6-6a58-4985-bd1a-54d746a43a6b",
   "metadata": {},
   "outputs": [],
   "source": [
    "X=data.iloc[:,[3,4]].values"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 12,
   "id": "b5db88ae-a000-4d55-b16d-58990745284f",
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "[[ 15  39]\n",
      " [ 15  81]\n",
      " [ 16   6]\n",
      " [ 16  77]\n",
      " [ 17  40]\n",
      " [ 17  76]\n",
      " [ 18   6]\n",
      " [ 18  94]\n",
      " [ 19   3]\n",
      " [ 19  72]\n",
      " [ 19  14]\n",
      " [ 19  99]\n",
      " [ 20  15]\n",
      " [ 20  77]\n",
      " [ 20  13]\n",
      " [ 20  79]\n",
      " [ 21  35]\n",
      " [ 21  66]\n",
      " [ 23  29]\n",
      " [ 23  98]\n",
      " [ 24  35]\n",
      " [ 24  73]\n",
      " [ 25   5]\n",
      " [ 25  73]\n",
      " [ 28  14]\n",
      " [ 28  82]\n",
      " [ 28  32]\n",
      " [ 28  61]\n",
      " [ 29  31]\n",
      " [ 29  87]\n",
      " [ 30   4]\n",
      " [ 30  73]\n",
      " [ 33   4]\n",
      " [ 33  92]\n",
      " [ 33  14]\n",
      " [ 33  81]\n",
      " [ 34  17]\n",
      " [ 34  73]\n",
      " [ 37  26]\n",
      " [ 37  75]\n",
      " [ 38  35]\n",
      " [ 38  92]\n",
      " [ 39  36]\n",
      " [ 39  61]\n",
      " [ 39  28]\n",
      " [ 39  65]\n",
      " [ 40  55]\n",
      " [ 40  47]\n",
      " [ 40  42]\n",
      " [ 40  42]\n",
      " [ 42  52]\n",
      " [ 42  60]\n",
      " [ 43  54]\n",
      " [ 43  60]\n",
      " [ 43  45]\n",
      " [ 43  41]\n",
      " [ 44  50]\n",
      " [ 44  46]\n",
      " [ 46  51]\n",
      " [ 46  46]\n",
      " [ 46  56]\n",
      " [ 46  55]\n",
      " [ 47  52]\n",
      " [ 47  59]\n",
      " [ 48  51]\n",
      " [ 48  59]\n",
      " [ 48  50]\n",
      " [ 48  48]\n",
      " [ 48  59]\n",
      " [ 48  47]\n",
      " [ 49  55]\n",
      " [ 49  42]\n",
      " [ 50  49]\n",
      " [ 50  56]\n",
      " [ 54  47]\n",
      " [ 54  54]\n",
      " [ 54  53]\n",
      " [ 54  48]\n",
      " [ 54  52]\n",
      " [ 54  42]\n",
      " [ 54  51]\n",
      " [ 54  55]\n",
      " [ 54  41]\n",
      " [ 54  44]\n",
      " [ 54  57]\n",
      " [ 54  46]\n",
      " [ 57  58]\n",
      " [ 57  55]\n",
      " [ 58  60]\n",
      " [ 58  46]\n",
      " [ 59  55]\n",
      " [ 59  41]\n",
      " [ 60  49]\n",
      " [ 60  40]\n",
      " [ 60  42]\n",
      " [ 60  52]\n",
      " [ 60  47]\n",
      " [ 60  50]\n",
      " [ 61  42]\n",
      " [ 61  49]\n",
      " [ 62  41]\n",
      " [ 62  48]\n",
      " [ 62  59]\n",
      " [ 62  55]\n",
      " [ 62  56]\n",
      " [ 62  42]\n",
      " [ 63  50]\n",
      " [ 63  46]\n",
      " [ 63  43]\n",
      " [ 63  48]\n",
      " [ 63  52]\n",
      " [ 63  54]\n",
      " [ 64  42]\n",
      " [ 64  46]\n",
      " [ 65  48]\n",
      " [ 65  50]\n",
      " [ 65  43]\n",
      " [ 65  59]\n",
      " [ 67  43]\n",
      " [ 67  57]\n",
      " [ 67  56]\n",
      " [ 67  40]\n",
      " [ 69  58]\n",
      " [ 69  91]\n",
      " [ 70  29]\n",
      " [ 70  77]\n",
      " [ 71  35]\n",
      " [ 71  95]\n",
      " [ 71  11]\n",
      " [ 71  75]\n",
      " [ 71   9]\n",
      " [ 71  75]\n",
      " [ 72  34]\n",
      " [ 72  71]\n",
      " [ 73   5]\n",
      " [ 73  88]\n",
      " [ 73   7]\n",
      " [ 73  73]\n",
      " [ 74  10]\n",
      " [ 74  72]\n",
      " [ 75   5]\n",
      " [ 75  93]\n",
      " [ 76  40]\n",
      " [ 76  87]\n",
      " [ 77  12]\n",
      " [ 77  97]\n",
      " [ 77  36]\n",
      " [ 77  74]\n",
      " [ 78  22]\n",
      " [ 78  90]\n",
      " [ 78  17]\n",
      " [ 78  88]\n",
      " [ 78  20]\n",
      " [ 78  76]\n",
      " [ 78  16]\n",
      " [ 78  89]\n",
      " [ 78   1]\n",
      " [ 78  78]\n",
      " [ 78   1]\n",
      " [ 78  73]\n",
      " [ 79  35]\n",
      " [ 79  83]\n",
      " [ 81   5]\n",
      " [ 81  93]\n",
      " [ 85  26]\n",
      " [ 85  75]\n",
      " [ 86  20]\n",
      " [ 86  95]\n",
      " [ 87  27]\n",
      " [ 87  63]\n",
      " [ 87  13]\n",
      " [ 87  75]\n",
      " [ 87  10]\n",
      " [ 87  92]\n",
      " [ 88  13]\n",
      " [ 88  86]\n",
      " [ 88  15]\n",
      " [ 88  69]\n",
      " [ 93  14]\n",
      " [ 93  90]\n",
      " [ 97  32]\n",
      " [ 97  86]\n",
      " [ 98  15]\n",
      " [ 98  88]\n",
      " [ 99  39]\n",
      " [ 99  97]\n",
      " [101  24]\n",
      " [101  68]\n",
      " [103  17]\n",
      " [103  85]\n",
      " [103  23]\n",
      " [103  69]\n",
      " [113   8]\n",
      " [113  91]\n",
      " [120  16]\n",
      " [120  79]\n",
      " [126  28]\n",
      " [126  74]\n",
      " [137  18]\n",
      " [137  83]]\n"
     ]
    }
   ],
   "source": [
    "print(X)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 14,
   "id": "6461f073-1504-4bc9-b235-fe575dbb092a",
   "metadata": {},
   "outputs": [],
   "source": [
    "wcss = []\n",
    "for i in range(1, 11):\n",
    "    kmeans = KMeans(n_clusters=i, init='k-means++', random_state=42)\n",
    "    kmeans.fit(X)\n",
    "    wcss.append(kmeans.inertia_)\n"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 15,
   "id": "17e70537-a281-4b46-afe3-9b1da42cbbc4",
   "metadata": {},
   "outputs": [
    {
     "data": {
      "image/png": "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FXaBP91f//pXpkyZwrJly874cU0i7shkP99NakRERESkUlqDJSIiIuJiClgiIiIiLqaAJSIiIuJiClgiIiIiLqaAJSIiIuJiClgiIiIiLqaAJSIiIuJi2mjUQHa7HZtN25Cdidls0uvjZjQm7kXj4V40Hu6lusbDbDZV+skDf6SAZSCbzU52dr7RZbgli8VMaKg/ubknKS21GV2OoDFxNxoP96LxcC/VOR5hYf54ePx5wNItQhEREREXU8ASERERcTEFLBEREREXU8ASERERcTEFLBEREREXU8ASERERcTEFLBEREREXU8ASERERcTEFLBEREREXU8ASERERcTEFLBEREREXU8ASERERcTEFLBEREREXU8C6xOzPOMGCVXspterT3EVERIxiMboAca2vVu0jZUcmHmYz/bvGGF2OiIhIraQZrEtM68ahAPyw4QA2m93gakRERGonBaxLTLfWUfj7WMg6XsjmPUeNLkdERKRWUsC6xHh7etCzbTQAi9enGVyNiIhI7aSAdQlK6lAfkwm27s3hUFa+0eWIiIjUOgpYl6C6Ib60a1oXgMUbDhhcjYiISO2jgHWJurJjAwBWbknnZGGpwdWIiIjULgpYl6iWjUKJrutPUYmVFVsOG12OiIhIraKAdYkymUxc2aE+UHab0GbXlg0iIiIXiwLWJSzh8ih8vS1k5hTwy2/ZRpcjIiJSayhgXcJ8vCwktqkHwCJt2SAiInLRKGBd4pI61scE/PJbNunZJ40uR0REpFZQwLrERYb60aZJHQB+WK8tG0RERC4GBaxa4KpTWzYs33KYgiJt2SAiIlLdFLBqgVaxYUSG+VFYbGXlL+lGlyMiInLJU8CqBcynbdnwg7ZsEBERqXYKWLVEjzb18Pby4PDRk2zbqy0bREREqpMCVi3h6/37lg2LU7TYXUREpDopYNUi5Z9PuHnPUTKPFRhcjYiIyKVLAasWiQrz4/LYMOxoywYREZHqpIBVy5TPYi3ffJiiYqvB1YiIiFyaFLBqmTZN6hAR4svJolJWbdWWDSIiItVBAauWMZtMJJ3asmHx+gPYtWWDiIiIyxkesI4dO8aTTz5Jr1696NChA7feeispKSmO88OHDycuLs7pa9iwYY7zRUVFPP300yQkJNC+fXsefvhhsrOdtyFYtWoVN9xwA/Hx8fTv358FCxY4nXdFHzVJYtt6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GUnbtm1ZsGABK1asYObMmUaXV+u0bduWjh078uijj/LUU08RFRXF/PnzWbVqFf/73/+MLq/WGzRoEO+88w7jxo1j5MiRbN68mZkzZ/L0009flMdXwBK38u2331JSUsL333/P999/73Tu+uuv1zYBUuuNHj0aX19fXn75ZTIyMmjSpAlTpkyha9euRpdW65jNZt544w1eeeUVHnvsMY4fP07z5s2ZOXNmhS0D5OKrU6cO77zzDpMmTeL6668nPDycMWPGONYvVjeT3W63X5RHEhEREakltMhdRERExMUUsERERERcTAFLRERExMUUsERERERcTAFLRERExMUUsERERERcTAFLRERExMUUsERExEFbI4q4hgKWiJy3YcOG0apVK7Zs2VLp+aSkJMaOHXtRahk7dixJSUkX5bHORWlpKWPHjqV9+/Z06NCB1atXn7FtUVERM2fOZNCgQXTs2JEuXbpwyy23MH/+fKfgM2XKFOLi4lxaZ3FxMc8++yxffvmlS/sVqa0UsETkglitVh577DGKi4uNLsUtLVu2jM8++4w77riDN998kzZt2lTaLisri5tvvpk33niDK664gpdffpkXXniBuLg4xo4dyxNPPFGts0uZmZnMmjWL0tLSansMkdpEn0UoIhckMDCQX3/9lddff50HH3zQ6HLczrFjxwC44YYbaNiw4RnbPfroo6SnpzNnzhwaN27sON6nTx+io6N56aWXuOKKK7jyyiuruWIRcQXNYInIBWnZsiV/+9vfeOedd/jll1/O2jYuLo4pU6Y4Hfvj7a6xY8cyYsQI5syZw1VXXUXbtm255ZZbSE1N5ccff+Taa68lPj6ewYMHs3379gqPMWfOHPr06UPbtm25/fbb2bZtm9P5Q4cO8dBDD9GlSxfi4+MrtDlw4ABxcXG899579O/fn/j4eJKTkyt9PlarlQ8//JBrr72Wtm3b0qdPHyZPnkxRUZHjuZTfIr3qqqsYNmxYpf1s376d5cuXM2LECKdwVe6OO+5gyJAh+Pn5VXp9Zbdi582bR1xcHAcOHACgsLCQCRMm0KtXLy6//HL69+/Pu+++63jO5cHtsccec7rVmpKSwtChQ4mPj6dLly48+uijZGdnOz1Oq1at+PTTT+nRowddunRh9+7d7N+/n3vuuYeuXbsSHx/PzTffzJIlSyqtX+RSpBksEblgjz/+OCtWrOCxxx4jOTkZLy+vC+pv48aNZGZmMnbsWIqKipgwYQJ33XUXJpOJBx54AF9fX5566ikeeeQRFixY4LguPT2dqVOn8vDDDxMQEMDUqVMZNmwYX375JdHR0WRnZ3PLLbfg6+vLE088ga+vL7NmzWLIkCHMnTuXJk2aOPqaMmUK48aNIyAggPj4+ErrfPLJJ/n888+588476dSpE9u2beP1119n+/btvPPOO4wePZqoqCjeeOMNpk6dSmxsbKX9LFu2DOCMa8i8vb158sknz/flBODZZ59l+fLlPProo9StW5elS5fywgsvEBISwrXXXsvUqVO57777GDVqFH379gVg3bp1DB8+nG7duvHKK69w/PhxXn31VW677Tbmzp2Lj48PUBY0Z8yYwaRJk8jJySE2NpZrrrmGiIgIXnjhBSwWC7Nnz2bUqFF88803NGrU6IKei0hNoIAlIhcsODiYZ555hlGjRrnkVmF+fj6vvPKKI/CsXbuWjz/+mJkzZ5KQkADAvn37eP7558nNzSUoKAgo+4f+9ddfp23btgDEx8dz1VVX8f777/Poo48ya9Ysjh07xv/+9z/q168PQK9evRgwYACvvvoqr732mqOGv/zlLwwaNOiMNe7evZu5c+fy8MMPc9dddwHQo0cPIiIiGDNmDEuXLqV3797ExMQAZTN9DRo0qLSvw4cPA5zxvCusXbuWHj16MHDgQAC6du2Kn58fderUwcvLi5YtWwIQExNDq1atAHjxxReJjY3lzTffxMPDAyh7TQcOHEhycjJDhgxx9H/PPffQp08fAI4cOcJvv/3G6NGj6d27NwBt27Zl6tSpWqsntYZuEYqISyQlJXHdddfxzjvvsHXr1gvqKzg42Gk2qW7dugBOM0khISEA5ObmOo41bNjQEa4AwsPDadeuHevWrQNg1apVtGzZksjISEpLSyktLcVsNtOrVy9WrlzpVEN54DiTtWvXAjgCS7mBAwfi4eHBmjVrqvp0HeHFarVW+Zpz1bVrVz755BPuvPNOPvjgA9LS0rj33nsdoeiPCgoK2LRpE71798Zutzter4YNG9KkSRNWrFjh1P7016tu3bo0bdqUJ554gkcffZQvv/wSm83GY489RrNmzartOYq4E81giYjLjB8/nlWrVjluFZ6vgICASo+faQ1SufIgdro6deo4ZoiOHTvGvn37aN26daXXFxQUVPmxjh8/DpSFuNNZLBZCQ0M5ceLEWa8/Xfls2qFDh2jatGmlbTIyMoiIiMBkMlW539ONGzeOqKgovvjiCyZOnMjEiRNp3749EyZMoEWLFhXa5+bmYrPZePvtt3n77bcrnPf29nb6+fTXy2QyMWPGDN544w2+//575s+fj6enJ1dddRVPP/00wcHB5/UcRGoSBSwRcZng4GAmTJjAvffey7Rp0ypt88dZmpMnT7rs8ctDz+mOHDlCWFgYUPaOxy5dujBmzJhKrz+XtWPlIeHIkSOOgARQUlJCTk4OoaGhVe4rMTERgCVLllQasEpLS/nrX/9Khw4dzvt19fLyYtSoUYwaNYpDhw7x448/Mm3aNB5++GGndWzl/P39MZlM3HHHHRVm6QB8fX3P+pwiIyOZMGECTz31FDt27GDhwoW8/fbbhIaG8tRTT531WpFLgW4RiohLXXXVVVxzzTW89dZbTu82g7KZqYyMDKdjGzZscNljp6amsn//fsfPhw8fZuPGjXTt2hWALl26kJqaSmxsLG3atHF8ff7558ydO9dxq64qunTpAlAhnCxYsACr1UrHjh2r3FezZs3o1asXb7/9NmlpaRXOv/nmm+Tk5HDddddVen1AQADp6elOx9avX+/4dWFhIf369WPGjBkAREdHM2TIEAYOHMihQ4cAKjz3gIAAWrVqxW+//eb0WjVr1owpU6ac9Rboxo0b6d69O5s3b8ZkMtGyZUsefPBBmjdv7ng8kUudZrBExOWeeOIJVq9eTVZWltPxPn36sGDBAuLj42nUqBHz5s1j3759Lntcb29vRo0axYMPPojVauXVV18lJCSE22+/HSjb7uDzzz/njjvu4B//+AehoaF8/fXXfPLJJzz22GPn9FhNmzbl+uuv57XXXqOgoIDOnTuzfft2pk6dSteuXenZs+c59ff0009z++23c9NNN3HbbbcRHx9Pfn4+CxcuZMGCBdxyyy3079+/0muvuOIK3nzzTd58803i4+P54YcfnHaM9/HxoXXr1kydOhVPT0/i4uJITU3ls88+o1+/fkDZ7B6UrVNr0qQJ8fHxPPTQQ9x11108/PDDXHfddY53C27atInRo0ef8bm0atUKHx8fxowZw/3330/dunVZuXIl27dv57bbbjun10WkplLAEhGXCwkJYcKECdx3331Oxx977DFKS0t5/vnnsVgsDBgwgIcffpjx48e75HFbtWpFv379mDBhAidOnCAhIYHHH3/ccYswMjKSjz/+mBdffJEJEyZQVFRE48aNmTRpEjfeeOM5P96kSZNo1KgRycnJvP3220RERHDbbbcxevRozOZzu0EQHR3NnDlzmDVrFl999RVvvfUWXl5eXHbZZbz44osMGDDgjNfefffdZGdn8+6771JSUkKfPn2YNGkSo0aNcrR55plneOWVV5gxYwZHjhyhTp063Hjjjfzzn/8Eymashg8fzpw5c1iyZAkrVqwgMTGRd999l6lTp/LAAw/g6elJ69atee+992jXrt0Z6/H29mbGjBm8+OKLTJo0idzcXBo3bswzzzzDDTfccE6vi0hNZbLrkz1FREREXEprsERERERcTAFLRERExMUUsERERERcTAFLRERExMUUsERERERcTAFLRERExMUUsERERERcTAFLRERExMUUsERERERcTAFLRERExMUUsERERERc7P8BOSsQrhzPxVEAAAAASUVORK5CYII=",
      "text/plain": [
       "<Figure size 640x480 with 1 Axes>"
      ]
     },
     "metadata": {},
     "output_type": "display_data"
    }
   ],
   "source": [
    "sns.set()\n",
    "plt.plot(range(1,11), wcss)\n",
    "plt.title('THE ELBOW POINT GRAPH')\n",
    "plt.xlabel('Number of Clusters')\n",
    "plt.ylabel('WCSS')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "4ac6ee26-9043-4bb0-80ea-efdb5e159017",
   "metadata": {},
   "outputs": [],
   "source": [
    "kmeans=KMeans(n_clusters=5, init='K-means++', random_state=0)\n"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3 (ipykernel)",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.11.9"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}
