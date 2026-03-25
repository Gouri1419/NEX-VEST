"""
Investor Agent - Represents a venture capitalist in the simulation.
Goal: Maximize return on investment by funding the best startups.
Uses scoring algorithms and strategy-based decision making.
"""
import random
import math


class InvestorAgent:
    """AI agent that simulates investor behavior and investment decisions."""

    INVESTOR_NAMES = [
        "Alpha Ventures", "Peak Capital", "Horizon Fund", "Nexus Partners",
        "Stellar VC", "Forge Capital", "Summit Invest", "Apex Fund",
        "Pinnacle VC", "Vanguard Seeds", "Titan Capital", "Atlas Ventures",
    ]

    def __init__(self, name=None, budget=None, risk_tolerance=None, strategy=None,
                 investor_type=None, preferred_industry=None):
        self.name = name or random.choice(self.INVESTOR_NAMES)
        self.investor_type = investor_type or random.choice(["angel", "vc", "pe", "accelerator"])
        self.budget = budget if budget is not None else self._default_budget()
        self.remaining_budget = self.budget
        self.risk_tolerance = risk_tolerance if risk_tolerance is not None else round(random.uniform(20, 85), 2)
        self.strategy = strategy or random.choice(["aggressive", "conservative", "balanced", "contrarian"])
        self.preferred_industry = preferred_industry
        self.total_invested = 0
        self.total_returns = 0
        self.portfolio = []  # List of startup names invested in

    def _default_budget(self):
        budgets = {
            "angel": random.uniform(50000, 300000),
            "vc": random.uniform(500000, 5000000),
            "pe": random.uniform(2000000, 20000000),
            "accelerator": random.uniform(100000, 500000),
        }
        return round(budgets.get(self.investor_type, 500000), 2)

    def evaluate_startup(self, pitch, risk_score, market_score):
        """
        Evaluate a startup pitch and decide whether to invest.
        Returns a decision dict with reasoning.
        """
        # Base attractiveness score
        attractiveness = (
            pitch["idea_quality"] * 0.20 +
            pitch["team_strength"] * 0.30 +
            pitch["market_demand"] * 0.25 +
            market_score * 0.15 +
            (100 - risk_score) * 0.10
        )

        # Strategy modifiers
        if self.strategy == "aggressive":
            # Aggressive investors favor high-growth, accept more risk
            attractiveness += pitch["market_demand"] * 0.1
            attractiveness -= (100 - risk_score) * 0.05  # Less risk-averse
            threshold = 45
        elif self.strategy == "conservative":
            # Conservative investors want low risk, strong teams
            attractiveness += pitch["team_strength"] * 0.1
            attractiveness += (100 - risk_score) * 0.15
            threshold = 65
        elif self.strategy == "contrarian":
            # Contrarian investors look for undervalued opportunities
            if pitch["market_demand"] < 40 and pitch["idea_quality"] > 60:
                attractiveness += 15  # Bonus for "hidden gems"
            threshold = 50
        else:  # balanced
            threshold = 55

        # Industry preference bonus
        if self.preferred_industry and pitch.get("industry") == self.preferred_industry:
            attractiveness += 8

        # Risk tolerance check
        if risk_score > self.risk_tolerance + 20:
            attractiveness -= 15  # Penalize if risk exceeds tolerance

        # Budget check
        funding_ask = pitch.get("funding_ask", 0)
        if funding_ask > self.remaining_budget * 0.4:
            attractiveness -= 10  # Don't put too many eggs in one basket

        # Make decision
        invest = attractiveness >= threshold and self.remaining_budget >= funding_ask * 0.5

        # Calculate investment amount
        if invest:
            # Invest proportional to attractiveness
            max_ticket = self.remaining_budget * 0.35
            invest_ratio = min(1.0, attractiveness / 100)
            amount = round(min(funding_ask, max_ticket) * invest_ratio, 2)
            amount = max(amount, 10000)  # Minimum investment
            equity = round(amount / max(pitch["revenue_projection"] * 5, 100000) * 100, 2)
            equity = min(equity, 25)  # Cap at 25%
        else:
            amount = 0
            equity = 0

        # Generate reasoning
        reasoning = self._generate_reasoning(pitch, risk_score, market_score, attractiveness, threshold, invest)

        return {
            "decision": "funded" if invest else "rejected",
            "amount": amount,
            "equity_percentage": equity,
            "attractiveness_score": round(attractiveness, 2),
            "threshold": threshold,
            "risk_score": risk_score,
            "market_score": market_score,
            "reasoning": reasoning,
        }

    def _generate_reasoning(self, pitch, risk_score, market_score, score, threshold, invest):
        """Generate natural language reasoning for the decision."""
        reasons = []

        if pitch["team_strength"] > 70:
            reasons.append(f"Strong team (score: {pitch['team_strength']})")
        elif pitch["team_strength"] < 40:
            reasons.append(f"Weak team concerns (score: {pitch['team_strength']})")

        if risk_score > 70:
            reasons.append(f"High risk level ({risk_score})")
        elif risk_score < 30:
            reasons.append(f"Low risk - favorable ({risk_score})")

        if market_score > 60:
            reasons.append(f"Positive market conditions ({market_score})")
        elif market_score < 40:
            reasons.append(f"Unfavorable market ({market_score})")

        if pitch["idea_quality"] > 75:
            reasons.append(f"Excellent idea quality ({pitch['idea_quality']})")

        if invest:
            return f"INVEST: Score {round(score, 1)} exceeded threshold {threshold}. {'; '.join(reasons)}"
        else:
            return f"REJECT: Score {round(score, 1)} below threshold {threshold}. {'; '.join(reasons)}"

    def make_investment(self, amount, startup_name):
        """Record an investment."""
        self.remaining_budget -= amount
        self.total_invested += amount
        self.portfolio.append(startup_name)
        return {
            "action": "invested",
            "amount": amount,
            "startup": startup_name,
            "remaining_budget": round(self.remaining_budget, 2),
        }

    def calculate_roi(self):
        """Calculate return on investment."""
        if self.total_invested == 0:
            return 0
        return round((self.total_returns - self.total_invested) / self.total_invested * 100, 2)

    def to_dict(self):
        return {
            "name": self.name,
            "investor_type": self.investor_type,
            "risk_tolerance": self.risk_tolerance,
            "budget": self.budget,
            "remaining_budget": round(self.remaining_budget, 2),
            "strategy": self.strategy,
            "preferred_industry": self.preferred_industry,
            "total_invested": round(self.total_invested, 2),
            "total_returns": round(self.total_returns, 2),
            "roi": self.calculate_roi(),
            "portfolio": self.portfolio,
        }
