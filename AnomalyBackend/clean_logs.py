import os

# === Configuration ===
folder = r"C:\Users\shazs\AnomalyProject\AnomalyBackend\training_data"

# Patterns of filenames to delete (customize as needed)
patterns_to_delete = [
    "synthetic",     # delete synthetic logs
    "Windows_2k",    # delete Windows_2k logs
    "new.log",       # delete temporary test logs
]

# === Deletion Process ===
deleted = []
for file in os.listdir(folder):
    for pattern in patterns_to_delete:
        if pattern in file:
            file_path = os.path.join(folder, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
                deleted.append(file)

# === Result ===
if deleted:
    print("Deleted files:")
    for f in deleted:
        print(f" - {f}")
else:
    print("No matching files found.")

