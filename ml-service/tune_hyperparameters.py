"""Small grid search over ALS hyperparameters (factors, regularization) and the confidence
scaling factor (alpha), reusing the exact same time-based train/test split as evaluate_model.py
so results are directly comparable to the MVP baseline already measured there.
"""

import os

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

import sys

from evaluate_model import (
    _build_train_confidence,
    _load_events,
    _split_train_test,
    _test_ground_truth,
    evaluate_mf,
)

FACTORS_GRID = [16, 32, 64]
REGULARIZATION_GRID = [0.005, 0.01, 0.05]
ALPHA_GRID = [5, 15, 30]

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")

    events = _load_events()
    train_events, test_purchases, cutoff = _split_train_test(events)
    ground_truth = _test_ground_truth(test_purchases)
    print(f"Mốc cắt: {cutoff}, train events: {len(train_events)}, test purchases: {len(test_purchases)}")
    print(f"Đánh giá trên {len(ground_truth)} customer.\n")

    results = []
    for alpha in ALPHA_GRID:
        train_confidence_df = _build_train_confidence(train_events, alpha=alpha)
        for factors in FACTORS_GRID:
            for regularization in REGULARIZATION_GRID:
                precision = evaluate_mf(
                        train_confidence_df, ground_truth, factors=factors, regularization=regularization)
                results.append((alpha, factors, regularization, precision))
                print(f"alpha={alpha:>3}  factors={factors:>3}  regularization={regularization:<6}  "
                      f"precision@6={precision:.4f}")

    best = max(results, key=lambda r: r[3])
    print(f"\nCấu hình tốt nhất: alpha={best[0]}, factors={best[1]}, regularization={best[2]} "
          f"-> precision@6={best[3]:.4f}")
