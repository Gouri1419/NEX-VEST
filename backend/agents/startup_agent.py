"""
Startup Agent - Represents a startup company in the simulation.
Goal: Maximize funding received and survival probability.
"""
import random
import math


class StartupAgent:
    """AI agent that simulates startup behavior and decision-making."""

    STARTUP_NAMES = [
        "NeuralPay", "CloudVault", "DataPulse", "QuantumLeap", "ByteForge",
        "SyncFlow", "PixelMind", "AutoScale", "DeepRoute", "CyberNest",
        "FluxAI", "VoltEdge", "StreamCore", "NanoGrid", "HyperLink",
        "CodeSphere", "MetaWave", "InfraBot", "LogicLayer", "PrimeStack",
    ]

    INDUSTRIES = ["fintech", "healthtech", "edtech", "saas", "ai_ml", "ecommerce", "cybersecurity", "greentech"]

    def __init__(self, name=None, industry=None, idea_quality=None, team_strength=None, market_demand=None):
        self.name = name or random.choice(self.STARTUP_NAMES) + f"-{random.randint(100,999)}"
        self.industry = industry or random.choice(self.INDUSTRIES)
        self.idea_quality = idea_quality if idea_quality is not None else round(random.uniform(20, 95), 2)
        self.team_strength = team_strength if team_strength is not None else round(random.uniform(20, 95), 2)
        self.market_demand = market_demand if market_demand is not None else round(random.uniform(15, 90), 2)
        self.revenue_projection = self._calculate_revenue_projection()
        self.burn_rate = round(random.uniform(5000, 80000), 2)
        self.funding_received = 0
        self.runway_months = 12.0
        self.status = "active"
        self.success_probability = self._calculate_success_probability()

    def _calculate_revenue_projection(self):
        """Project revenue based on idea quality, team, and market demand."""
        base = (self.idea_quality * 0.3 + self.team_strength * 0.3 + self.market_demand * 0.4)
        multiplier = random.uniform(800, 5000)
        return round(base * multiplier, 2)

    def _calculate_success_probability(self):
        """Calculate probability of success (0-100) using weighted factors."""
        score = (
            self.idea_quality * 0.25 +
            self.team_strength * 0.35 +
            self.market_demand * 0.25 +
            min(self.runway_months * 2, 15) * 1.0
        )
        # Add some randomness to simulate real-world uncertainty
        noise = random.uniform(-8, 8)
        return round(max(5, min(95, score + noise)), 2)

    def receive_funding(self, amount):
        """Process received funding."""
        self.funding_received += amount
        self.runway_months = round(self.funding_received / max(self.burn_rate, 1), 1)
        self.success_probability = self._calculate_success_probability()
        return {
            "action": "funding_received",
            "amount": amount,
            "new_runway": self.runway_months,
            "new_success_prob": self.success_probability,
        }

    def evolve(self, market_impact=0):
        """Simulate one round of startup evolution."""
        # Burn cash
        if self.funding_received > 0:
            self.funding_received = max(0, self.funding_received - self.burn_rate)
            self.runway_months = round(self.funding_received / max(self.burn_rate, 1), 1)

        # Market impact affects demand
        self.market_demand = round(max(5, min(95, self.market_demand + market_impact)), 2)

        # Team and idea improve slightly over time (learning)
        self.team_strength = round(min(98, self.team_strength + random.uniform(-1, 2.5)), 2)
        self.idea_quality = round(min(98, self.idea_quality + random.uniform(-2, 1.5)), 2)

        # Recalculate
        self.revenue_projection = self._calculate_revenue_projection()
        self.success_probability = self._calculate_success_probability()

        # Check for failure
        if self.runway_months <= 0 and self.funding_received <= 0:
            if random.random() > self.success_probability / 100:
                self.status = "failed"

        # Check for unicorn status
        if self.success_probability > 90 and self.funding_received > 500000:
            if random.random() > 0.85:
                self.status = "unicorn"

        return self.to_dict()

    def generate_pitch(self):
        """Generate a funding pitch (what the startup presents to investors)."""
        return {
            "startup_name": self.name,
            "industry": self.industry,
            "idea_quality": self.idea_quality,
            "team_strength": self.team_strength,
            "market_demand": self.market_demand,
            "revenue_projection": self.revenue_projection,
            "burn_rate": self.burn_rate,
            "funding_ask": round(self.burn_rate * 18, 2),  # Ask for 18 months runway
            "current_runway": self.runway_months,
        }

    def to_dict(self):
        return {
            "name": self.name,
            "industry": self.industry,
            "idea_quality": self.idea_quality,
            "team_strength": self.team_strength,
            "market_demand": self.market_demand,
            "revenue_projection": self.revenue_projection,
            "burn_rate": self.burn_rate,
            "funding_received": self.funding_received,
            "runway_months": self.runway_months,
            "success_probability": self.success_probability,
            "status": self.status,
        }
