"""
Risk Evaluation Agent - Analyzes financial risk, market uncertainty, and competition.
Goal: Calculate accurate failure probability for each startup.
"""
import random
import math


class RiskAgent:
    """AI agent that evaluates risk for startups in the simulation."""

    def __init__(self):
        self.risk_history = []

    def evaluate_risk(self, startup_data, market_conditions="neutral"):
        """
        Calculate comprehensive risk score for a startup.
        Returns risk breakdown and overall score (0-100, higher = riskier).
        """
        # Financial Risk (0-100)
        financial_risk = self._calculate_financial_risk(startup_data)

        # Market Risk (0-100)
        market_risk = self._calculate_market_risk(startup_data, market_conditions)

        # Team Risk (0-100)
        team_risk = self._calculate_team_risk(startup_data)

        # Competition Risk (0-100)
        competition_risk = self._calculate_competition_risk(startup_data)

        # Execution Risk (0-100)
        execution_risk = self._calculate_execution_risk(startup_data)

        # Weighted overall risk score
        overall_risk = (
            financial_risk * 0.30 +
            market_risk * 0.25 +
            team_risk * 0.20 +
            competition_risk * 0.15 +
            execution_risk * 0.10
        )

        # Add noise for realism
        overall_risk = max(5, min(95, overall_risk + random.uniform(-3, 3)))

        # Failure probability based on risk
        failure_probability = self._risk_to_failure_probability(overall_risk)

        result = {
            "overall_risk": round(overall_risk, 2),
            "failure_probability": round(failure_probability, 2),
            "risk_level": self._risk_level_label(overall_risk),
            "breakdown": {
                "financial_risk": round(financial_risk, 2),
                "market_risk": round(market_risk, 2),
                "team_risk": round(team_risk, 2),
                "competition_risk": round(competition_risk, 2),
                "execution_risk": round(execution_risk, 2),
            },
            "recommendations": self._generate_recommendations(
                financial_risk, market_risk, team_risk, competition_risk
            ),
        }

        self.risk_history.append({
            "startup": startup_data.get("name", "Unknown"),
            "overall_risk": result["overall_risk"],
        })

        return result

    def _calculate_financial_risk(self, data):
        """Assess financial health risk."""
        risk = 50  # Base risk

        runway = data.get("runway_months", 12)
        if runway < 3:
            risk += 30
        elif runway < 6:
            risk += 15
        elif runway > 18:
            risk -= 15

        burn_rate = data.get("burn_rate", 0)
        revenue = data.get("revenue_projection", 0)
        if burn_rate > 0 and revenue > 0:
            ratio = revenue / (burn_rate * 12)
            if ratio < 0.5:
                risk += 20
            elif ratio > 2:
                risk -= 20

        funding = data.get("funding_received", 0)
        if funding > 200000:
            risk -= 10
        elif funding == 0:
            risk += 15

        return max(5, min(95, risk))

    def _calculate_market_risk(self, data, market_conditions):
        """Assess market-related risk."""
        risk = 50

        market_demand = data.get("market_demand", 50)
        risk -= (market_demand - 50) * 0.5

        condition_modifiers = {
            "bull": -15,
            "bear": 20,
            "neutral": 0,
            "volatile": 10,
        }
        risk += condition_modifiers.get(market_conditions, 0)

        return max(5, min(95, risk))

    def _calculate_team_risk(self, data):
        """Assess team-related risk."""
        team_strength = data.get("team_strength", 50)
        risk = 100 - team_strength  # Inverse of team strength
        risk += random.uniform(-5, 5)
        return max(5, min(95, risk))

    def _calculate_competition_risk(self, data):
        """Assess competition risk based on industry."""
        industry_competition = {
            "fintech": 70, "saas": 65, "ecommerce": 75, "ai_ml": 60,
            "healthtech": 50, "edtech": 45, "cybersecurity": 55, "greentech": 40,
        }
        base_risk = industry_competition.get(data.get("industry", ""), 55)

        # Higher idea quality = better differentiation = lower competition risk
        idea_quality = data.get("idea_quality", 50)
        base_risk -= (idea_quality - 50) * 0.3

        return max(5, min(95, base_risk + random.uniform(-5, 5)))

    def _calculate_execution_risk(self, data):
        """Assess execution risk."""
        team = data.get("team_strength", 50)
        idea = data.get("idea_quality", 50)
        # Execution risk is about turning ideas into reality
        risk = 100 - (team * 0.6 + idea * 0.4)
        return max(5, min(95, risk + random.uniform(-5, 5)))

    def _risk_to_failure_probability(self, risk_score):
        """Convert risk score to failure probability using sigmoid-like function."""
        # Sigmoid centered at risk=50
        x = (risk_score - 50) / 15
        probability = 100 / (1 + math.exp(-x))
        return max(2, min(98, probability))

    def _risk_level_label(self, risk_score):
        """Convert risk score to human-readable label."""
        if risk_score < 25:
            return "low"
        elif risk_score < 45:
            return "moderate"
        elif risk_score < 65:
            return "high"
        elif risk_score < 80:
            return "very_high"
        else:
            return "critical"

    def _generate_recommendations(self, financial, market, team, competition):
        """Generate risk mitigation recommendations."""
        recs = []
        if financial > 60:
            recs.append("Reduce burn rate or seek emergency funding")
        if market > 60:
            recs.append("Diversify market approach or pivot to adjacent markets")
        if team > 60:
            recs.append("Strengthen team with key hires")
        if competition > 60:
            recs.append("Increase differentiation and build competitive moat")
        if not recs:
            recs.append("Risk profile is healthy - maintain current trajectory")
        return recs

    def get_risk_summary(self):
        """Get summary of all risk evaluations."""
        if not self.risk_history:
            return {"count": 0, "avg_risk": 0, "highest_risk": None, "lowest_risk": None}

        risks = [r["overall_risk"] for r in self.risk_history]
        return {
            "count": len(risks),
            "avg_risk": round(sum(risks) / len(risks), 2),
            "highest_risk": max(self.risk_history, key=lambda x: x["overall_risk"]),
            "lowest_risk": min(self.risk_history, key=lambda x: x["overall_risk"]),
        }
