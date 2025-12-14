import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

# -----------------------------
# 1. Generate synthetic dataset
# -----------------------------

np.random.seed(42)

num_samples = 50

# Features related to your quantum circuit
num_qubits = np.random.randint(2, 6, size=num_samples)       # 2–5 qubits
num_gates  = np.random.randint(2, 15, size=num_samples)      # 2–14 gates
count_H    = np.random.randint(0, 6, size=num_samples)
count_X    = np.random.randint(0, 6, size=num_samples)
count_CX   = np.random.randint(0, 4, size=num_samples)
count_M    = np.random.randint(1, 4, size=num_samples)

# Simple rule-based target: "probability of measuring |000...0>"
# (Just a fake function so the model has a pattern to learn)
base = 0.5 \
       + 0.05 * count_H \
       - 0.03 * count_X \
       - 0.04 * count_CX \
       - 0.02 * (num_qubits - 2) \
       + np.random.normal(0, 0.03, size=num_samples)

prob_00 = np.clip(base, 0.0, 1.0)

df = pd.DataFrame({
    "num_qubits": num_qubits,
    "num_gates": num_gates,
    "count_H": count_H,
    "count_X": count_X,
    "count_CX": count_CX,
    "count_M": count_M,
    "prob_00": prob_00,
})

print("📊 Generated Dataset (first 5 rows):")
print(df.head(), "\\n")

# -----------------------------
# 2. Train-test split
# -----------------------------

X = df[["num_qubits", "num_gates", "count_H", "count_X", "count_CX", "count_M"]]
y = df["prob_00"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# 3. Train model
# -----------------------------

model = RandomForestRegressor(
    n_estimators=80,
    random_state=42,
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
score = r2_score(y_test, y_pred)

print(f"✅ Model trained on {len(X_train)} samples, tested on {len(X_test)} samples")
print(f"   R² score on test set: {score:.3f}\\n")

# -----------------------------
# 4. Show some example predictions
# -----------------------------

print("🔮 Example predictions (first 5 test samples):")
example = X_test.iloc[:5].copy()
example["true_prob_00"] = y_test.iloc[:5].values
example["pred_prob_00"] = model.predict(X_test.iloc[:5])

print(example.to_string(index=False))

# -----------------------------
# 5. Save dataset + model (optional)
# -----------------------------
df.to_csv("quantum_dataset_50.csv", index=False)
print("\\n💾 Saved dataset to quantum_dataset_50.csv")

try:
    import joblib
    joblib.dump(model, "quantum_model_50.joblib")
    print("💾 Saved model to quantum_model_50.joblib")
except ImportError:
    print("⚠️ joblib not installed, skipping model save. Run `python -m pip install joblib` if needed.")
