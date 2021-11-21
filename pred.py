from sklearn.model_selection import cross_val_score
from sklearn.metrics import r2_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import sys
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
dataset = pd.read_csv('./data.csv')
testdata = pd.read_csv('./testdata.csv')
data = dataset[['ItemID', 'Month', 'Sales']]
X = data.iloc[:, :-1].values
y = data.iloc[:, -1].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=0)
regressor = RandomForestRegressor(n_estimators=10, random_state=0)
regressor.fit(X_train, y_train)
y_pred = regressor.predict([[sys.argv[1],sys.argv[2]]])
print(y_pred)

