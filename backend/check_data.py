import numpy as np

p7_train = np.load('data/train/P-7.npy')[:, 0]
a7_train = np.load('data/train/A-7.npy')[:, 0]

p7_test = np.load('data/test/P-7.npy')[:, 0]
a7_test = np.load('data/test/A-7.npy')[:, 0]

print("=== P-7 (SCH proxy) ===")
print(f"Train shape: {p7_train.shape}")
print(f"Test shape:  {p7_test.shape}")
print(f"Train mean:  {p7_train.mean():.4f}")
print(f"Train std:   {p7_train.std():.4f}")

print("\n=== A-7 (HS proxy) ===")
print(f"Train shape: {a7_train.shape}")
print(f"Test shape:  {a7_test.shape}")
print(f"Train mean:  {a7_train.mean():.4f}")
print(f"Train std:   {a7_train.std():.4f}")