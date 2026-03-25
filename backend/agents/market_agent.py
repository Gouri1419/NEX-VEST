"""
Market Trend Agent - Simulates market conditions and economic shifts.
Goal: Generate realistic market events that influence investor and startup behavior.
"""
import random
import math


class MarketAgent:
    """AI agent that simulates market trends and economic conditions."""

    MARKET_EVENTS = {
        "boom": {
            "descriptions": [
                "Tech sector experiences massive growth surge",
                "Record venture capital deployment in the ecosystem",
                "Consumer demand spikes across digital services",
                "IPO window opens with strong public market performance",
            ],
            "impact_range": (5, 20),
        },
        "crash": {
            "descriptions": [
                "Market correction hits growth-stage startups hard",
                "Funding winter begins as investors pull back",
                "Major tech layoffs signal industry downturn",
                "Economic recession fears reduce investment appetite",
            ],
            "impact_range": (-25, -8),
        },
        "regulation": {
            "descriptions": [
                "New data privacy regulations increase compliance costs",
                "Government introduces startup-friendly tax incentives",
                "Regulatory scrutiny increases in fintech sector",
                "New AI regulations create both challenges and opportunities",
            ],
            "impact_range": (-10, 5),
        },
        "innovation": {
            "descriptions": [
                "Breakthrough AI technology opens new market opportunities",
                "Cloud infrastructure costs drop significantly",
                "New platform shift creates opportunities for startups",
                "Open-source movement disrupts enterprise software",
            ],
            "impact_range": (3, 15),
        },
        "competition": {
            "descriptions": [
                "Big tech enters adjacent markets, increasing competition",
                "Wave of new startups increases market saturation",
                "Consolidation wave reduces number of competitors",
                "International competitors enter the market",
            ],
            "impact_range": (-12, -2),
        },
        "stable": {
            "descriptions": [
                "Market conditions remain steady with moderate growth",
                "Balanced supply and demand in the startup ecosystem",
                "Investor confidence holds at moderate levels",
            ],
            "impact_range": (-3, 3),
        },
    }

    INDUSTRY_TRENDS = {
        "fintech": {"growth_rate": 0.12, "volatility": 0.3},
        "healthtech": {"growth_rate": 0.15, "volatility": 0.2},
        "edtech": {"growth_rate": 0.08, "volatility": 0.15},
        "saas": {"growth_rate": 0.10, "volatility": 0.25},
        "ai_ml": {"growth_rate": 0.20, "volatility": 0.35},
        "ecommerce": {"growth_rate": 0.06, "volatility": 0.2},
        "cybersecurity": {"growth_rate": 0.14, "volatility": 0.2},
        "greentech": {"growth_rate": 0.18, "volatility": 0.25},
    }

    def __init__(self, initial_condition="neutral"):
        self.condition = initial_condition
        self.sentiment = 50  # 0=very bearish, 100=very bullish
        self.round_history = []
        self.current_trends = {}

        # Initialize sentiment based on condition
        condition_sentiment = {
            "bull": 70, "bear": 30, "neutral": 50, "volatile": 50,
        }
        self.sentiment = condition_sentiment.get(initial_condition, 50)

    def generate_round_event(self, round_number):
        """Generate a market event for the current round."""
        # Determine event type based on current sentiment and randomness
        event_type = self._determine_event_type()

        event_data = self.MARKET_EVENTS[event_type]
        description = random.choice(event_data["descriptions"])
        impact = round(random.uniform(*event_data["impact_range"]), 2)

        # Determine affected industries
        all_industries = list(self.INDUSTRY_TRENDS.keys())
        num_affected = random.randint(2, len(all_industries))
        affected = random.sample(all_industries, num_affected)

        # Update sentiment
        self.sentiment = max(5, min(95, self.sentiment + impact * 0.5))

        # Update market condition based on sentiment
        if self.sentiment > 65:
            self.condition = "bull"
        elif self.sentiment < 35:
            self.condition = "bear"
        elif abs(self.sentiment - 50) < 10:
            self.condition = "neutral"

        event = {
            "round_number": round_number,
            "event_type": event_type,
            "description": description,
            "impact_score": impact,
            "affected_industries": affected,
            "market_sentiment": round(self.sentiment, 2),
            "market_condition": self.condition,
        }

        self.round_history.append(event)
        return event

    def _determine_event_type(self):
        """Determine what type of market event occurs based on current state."""
        if self.sentiment > 70:
            # Bull market - more likely to see innovation or boom, but crash possible
            weights = {"boom": 0.30, "innovation": 0.25, "stable": 0.20,
                       "competition": 0.10, "regulation": 0.10, "crash": 0.05}
        elif self.sentiment < 30:
            # Bear market - more likely to crash further or stabilize
            weights = {"crash": 0.15, "stable": 0.25, "regulation": 0.15,
                       "competition": 0.15, "innovation": 0.15, "boom": 0.15}
        else:
            # Neutral - balanced probabilities
            weights = {"stable": 0.25, "innovation": 0.18, "boom": 0.15,
                       "competition": 0.15, "regulation": 0.12, "crash": 0.15}

        events = list(weights.keys())
        probs = list(weights.values())
        return random.choices(events, weights=probs, k=1)[0]

    def get_market_score(self, industry=None):
        """Get current market favorability score (0-100) for an industry."""
        base_score = self.sentiment

        if industry and industry in self.INDUSTRY_TRENDS:
            trend = self.INDUSTRY_TRENDS[industry]
            industry_boost = trend["growth_rate"] * 100
            volatility_penalty = trend["volatility"] * random.uniform(-20, 10)
            base_score += industry_boost + volatility_penalty

        return round(max(5, min(95, base_score)), 2)

    def get_industry_impact(self, industry):
        """Get the market impact modifier for a specific industry."""
        if not self.round_history:
            return 0

        latest_event = self.round_history[-1]
        if industry in latest_event.get("affected_industries", []):
            return latest_event["impact_score"]
        return latest_event["impact_score"] * 0.3  # Indirect impact

    def get_trend_summary(self):
        """Get summary of market trends across all rounds."""
        if not self.round_history:
            return {"rounds": 0, "current_condition": self.condition, "sentiment": self.sentiment}

        events_count = {}
        for event in self.round_history:
            t = event["event_type"]
            events_count[t] = events_count.get(t, 0) + 1

        sentiments = [e["market_sentiment"] for e in self.round_history]

        return {
            "rounds": len(self.round_history),
            "current_condition": self.condition,
            "current_sentiment": round(self.sentiment, 2),
            "avg_sentiment": round(sum(sentiments) / len(sentiments), 2),
            "events_breakdown": events_count,
            "trend_direction": "up" if len(sentiments) > 1 and sentiments[-1] > sentiments[0] else "down",
            "history": self.round_history,
        }
