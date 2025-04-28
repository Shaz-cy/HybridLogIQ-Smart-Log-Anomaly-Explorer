# === visualize.py (Updated Full Version) ===

import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
from matplotlib.cm import ScalarMappable
from matplotlib.colors import Normalize

# 🔥 Anomaly Heatmap
def generate_heatmap(errors):
    errors_array = np.array(errors).reshape(1, -1)
    fig, ax = plt.subplots(figsize=(12, 4))
    fig.patch.set_alpha(0.0)
    ax.set_facecolor("none")
    norm = Normalize(vmin=min(errors), vmax=max(errors))
    heatmap = ax.imshow(errors_array, cmap="hot", norm=norm, aspect="auto")
    ax.set_yticks([])
    ax.set_xticks(np.linspace(0, len(errors) - 1, min(len(errors), 12)).astype(int))
    ax.set_xlabel("Log Index")
    ax.set_title("Anomaly Heatmap")
    cbar = plt.colorbar(heatmap, ax=ax, orientation="vertical", fraction=0.02, pad=0.04)
    cbar.set_label("Reconstruction Error")
    plt.tight_layout()
    plt.savefig(os.path.join("results", "heatmap.png"), transparent=True)
    plt.close(fig)

# 🧠 SOM Cluster Visualization with Error Coloring
def visualize_som_2d(som, data, errors):
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.set_title("SOM Clusters with Anomaly Scores")
    ax.set_xlabel("SOM X")
    ax.set_ylabel("SOM Y")
    ax.grid(True, linestyle="--", alpha=0.3)
    norm = Normalize(vmin=min(errors), vmax=max(errors))
    cmap = plt.cm.get_cmap('Reds')
    sm = ScalarMappable(cmap=cmap, norm=norm)
    sm.set_array([])
    for i, x in enumerate(data):
        w = som.winner(x)
        color = cmap(norm(errors[i]))
        ax.scatter(w[0], w[1], c=[color], edgecolors="black", s=100)
    ax.set_xlim(-1, som._weights.shape[0])
    ax.set_ylim(-1, som._weights.shape[1])
    ax.invert_yaxis()
    plt.colorbar(sm, ax=ax, label="Reconstruction Error")
    plt.tight_layout()
    plt.savefig(os.path.join("results", "som_clusters.png"))
    plt.close(fig)

# 📊 Histogram of Errors
def generate_error_histogram(errors):
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.hist(errors, bins=30, color='steelblue', edgecolor='black')
    ax.set_title("Distribution of Reconstruction Errors")
    ax.set_xlabel("Reconstruction Error")
    ax.set_ylabel("Frequency")
    plt.tight_layout()
    plt.savefig(os.path.join("results", "error_distribution.png"))
    plt.close(fig)

# 🔬 Grid Search Heatmap
def generate_heatmap_grid(search_matrix, bottlenecks, learning_rates, save_path="results/heatmap_grid.png"):
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.heatmap(
        search_matrix,
        annot=True,
        xticklabels=learning_rates,
        yticklabels=bottlenecks,
        cmap="coolwarm",
        fmt=".4f",
        ax=ax
    )
    ax.set_xlabel("Learning Rate")
    ax.set_ylabel("Bottleneck Size")
    ax.set_title("Autoencoder Grid Search - Mean Reconstruction Error")
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close(fig)

# ✅ Final Fix: BMU Activation Map
def visualize_som_bmu_map(som, data, save_path="results/som_bmu_map.png"):
    bmu_map = np.zeros((som._weights.shape[1], som._weights.shape[0]))  # [Y][X]

    for vec in data:
        try:
            x, y = som.winner(vec)
            bmu_map[y][x] += 1
        except Exception as e:
            print("⚠️ SOM winner error:", e)

    total_hits = int(np.sum(bmu_map))
    print("✅ Total BMU Activations:", total_hits)
    print("📊 BMU Map (pre-log):\n", bmu_map)

    if total_hits == 0:
        bmu_map[0, 0] = 1

    bmu_map = np.log1p(bmu_map)  # log scale to compress large gaps
    if np.max(bmu_map) > 0:
        bmu_map = bmu_map / np.max(bmu_map)  # normalize to 0-1 for better color range

    fig, ax = plt.subplots(figsize=(8, 6))
    img = ax.imshow(bmu_map, cmap="plasma", interpolation="nearest", origin="lower")

    # 🔢 Optional: annotate cell values
    for y in range(bmu_map.shape[0]):
        for x in range(bmu_map.shape[1]):
            val = bmu_map[y, x]
            if val > 0:
                ax.text(x, y, f"{val:.2f}", ha="center", va="center", fontsize=8, color="white")

    # 🧠 Axis labels and ticks
    fig.colorbar(img, ax=ax, label="BMU Activation Count (log-normalized)")
    ax.set_title("SOM BMU Activation Map")
    ax.set_xlabel("Neuron X")
    ax.set_ylabel("Neuron Y")
    ax.set_xticks(np.arange(bmu_map.shape[1]))
    ax.set_yticks(np.arange(bmu_map.shape[0]))
    ax.grid(True, color='white', linewidth=0.5, linestyle="--", alpha=0.3)

    plt.tight_layout()
    print(f"🧠 Saving BMU map to: {save_path}")
    plt.savefig(save_path)
    plt.close(fig)
