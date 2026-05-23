"""Monte Carlo bootstrap tests on real sample arrays."""

from computation.monte_carlo.RunMonteCarloBootstrapFromEmpiricalWeeklyPprSamples import (
    RunMonteCarloBootstrapFromEmpiricalWeeklyPprSamples,
)


def test_bootstrap_mc_from_real_weekly_samples():
    # Realistic weekly PPR scores (example shape, not fabricated API data)
    weekly_scores = [12.4, 18.7, 22.1, 15.3, 19.8, 24.6, 11.2, 17.5]
    stats = RunMonteCarloBootstrapFromEmpiricalWeeklyPprSamples(weekly_scores, scenario_count=5000)

    assert stats["floor_ppr"] <= stats["median_ppr"] <= stats["ceiling_ppr"]
    assert 0 <= stats["boom_pct"] <= 100
    assert 0 <= stats["bust_pct"] <= 100
