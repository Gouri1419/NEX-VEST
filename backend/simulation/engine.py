"""
Simulation Engine - Orchestrates the multi-agent simulation.
Runs funding rounds where all 4 agents interact dynamically.
"""
from agents.startup_agent import StartupAgent
from agents.investor_agent import InvestorAgent
from agents.risk_agent import RiskAgent
from agents.market_agent import MarketAgent
import random


class SimulationEngine:
    """Core engine that runs the multi-agent startup ecosystem simulation."""

    def __init__(self, config):
        self.config = config
        self.num_startups = config.get("num_startups", 5)
        self.num_investors = config.get("num_investors", 3)
        self.num_rounds = config.get("num_rounds", 5)
        self.market_condition = config.get("market_condition", "neutral")
        self.industry = config.get("industry", None)

        # Initialize agents
        self.startups = []
        self.investors = []
        self.risk_agent = RiskAgent()
        self.market_agent = MarketAgent(initial_condition=self.market_condition)

        # Results tracking
        self.rounds = []
        self.agent_logs = []
        self.status = "pending"

    def initialize_agents(self):
        """Create startup and investor agents with configured parameters."""
        # Create startup agents
        startup_configs = self.config.get("startups", [])
        for i in range(self.num_startups):
            if i < len(startup_configs):
                cfg = startup_configs[i]
                startup = StartupAgent(
                    name=cfg.get("name"),
                    industry=cfg.get("industry", self.industry),
                    idea_quality=cfg.get("idea_quality"),
                    team_strength=cfg.get("team_strength"),
                    market_demand=cfg.get("market_demand"),
                )
            else:
                startup = StartupAgent(industry=self.industry)
            self.startups.append(startup)

        # Create investor agents
        investor_configs = self.config.get("investors", [])
        for i in range(self.num_investors):
            if i < len(investor_configs):
                cfg = investor_configs[i]
                investor = InvestorAgent(
                    name=cfg.get("name"),
                    budget=cfg.get("budget"),
                    risk_tolerance=cfg.get("risk_tolerance"),
                    strategy=cfg.get("strategy"),
                    investor_type=cfg.get("investor_type"),
                    preferred_industry=cfg.get("preferred_industry"),
                )
            else:
                investor = InvestorAgent()
            self.investors.append(investor)

        self._log("system", None, "simulation_initialized", {
            "startups": len(self.startups),
            "investors": len(self.investors),
            "rounds": self.num_rounds,
            "market_condition": self.market_condition,
        })

    def run_simulation(self):
        """Run the complete simulation across all rounds."""
        self.status = "running"
        self.initialize_agents()

        for round_num in range(1, self.num_rounds + 1):
            round_result = self._run_round(round_num)
            self.rounds.append(round_result)

        self.status = "completed"
        return self._compile_results()

    def _run_round(self, round_number):
        """Execute a single funding round."""
        round_data = {
            "round_number": round_number,
            "market_event": None,
            "funding_decisions": [],
            "startup_states": [],
            "investor_states": [],
            "risk_assessments": [],
            "snapshot": {},
        }

        # Step 1: Market Agent generates event
        market_event = self.market_agent.generate_round_event(round_number)
        round_data["market_event"] = market_event
        self._log("market", None, "event_generated", market_event)

        # Step 2: Each startup evolves based on market conditions
        active_startups = [s for s in self.startups if s.status == "active"]
        for startup in active_startups:
            market_impact = self.market_agent.get_industry_impact(startup.industry)
            startup.evolve(market_impact=market_impact)
            self._log("startup", startup.name, "evolved", startup.to_dict())

        # Step 3: Risk agent evaluates each active startup
        risk_assessments = {}
        for startup in active_startups:
            if startup.status != "active":
                continue
            risk = self.risk_agent.evaluate_risk(
                startup.to_dict(),
                market_conditions=self.market_agent.condition,
            )
            risk_assessments[startup.name] = risk
            round_data["risk_assessments"].append({
                "startup": startup.name,
                **risk,
            })
            self._log("risk", startup.name, "risk_evaluated", risk)

        # Step 4: Each active startup pitches to investors
        for startup in active_startups:
            if startup.status != "active":
                continue

            pitch = startup.generate_pitch()
            risk_score = risk_assessments.get(startup.name, {}).get("overall_risk", 50)
            market_score = self.market_agent.get_market_score(startup.industry)

            # Each investor evaluates the pitch
            for investor in self.investors:
                if investor.remaining_budget < 10000:
                    continue

                evaluation = investor.evaluate_startup(pitch, risk_score, market_score)

                if evaluation["decision"] == "funded" and evaluation["amount"] > 0:
                    # Execute investment
                    investor.make_investment(evaluation["amount"], startup.name)
                    startup.receive_funding(evaluation["amount"])
                    self._log("investor", investor.name, "invested", {
                        "startup": startup.name,
                        "amount": evaluation["amount"],
                        "reasoning": evaluation["reasoning"],
                    })
                else:
                    self._log("investor", investor.name, "rejected", {
                        "startup": startup.name,
                        "reasoning": evaluation["reasoning"],
                    })

                round_data["funding_decisions"].append({
                    "investor": investor.name,
                    "startup": startup.name,
                    "round_number": round_number,
                    **evaluation,
                })

        # Collect end-of-round states
        round_data["startup_states"] = [s.to_dict() for s in self.startups]
        round_data["investor_states"] = [i.to_dict() for i in self.investors]

        # Snapshot
        active = [s for s in self.startups if s.status == "active"]
        failed = [s for s in self.startups if s.status == "failed"]
        round_data["snapshot"] = {
            "round_number": round_number,
            "active_startups": len(active),
            "failed_startups": len(failed),
            "total_funding_deployed": round(sum(i.total_invested for i in self.investors), 2),
            "avg_success_probability": round(
                sum(s.success_probability for s in active) / max(len(active), 1), 2
            ),
            "market_sentiment": self.market_agent.sentiment,
        }

        return round_data

    def _compile_results(self):
        """Compile final simulation results."""
        active = [s for s in self.startups if s.status == "active"]
        failed = [s for s in self.startups if s.status == "failed"]
        unicorns = [s for s in self.startups if s.status == "unicorn"]
        funded = [s for s in self.startups if s.funding_received > 0]

        # Calculate investor returns (simplified)
        for investor in self.investors:
            for startup in self.startups:
                if startup.name in investor.portfolio:
                    if startup.status in ("active", "unicorn"):
                        # Positive return
                        multiplier = startup.success_probability / 50
                        if startup.status == "unicorn":
                            multiplier *= 3
                        investor.total_returns += investor.total_invested / len(investor.portfolio) * multiplier
                    elif startup.status == "failed":
                        pass  # Lost investment

        # Rank startups
        startup_ranking = sorted(
            [s.to_dict() for s in self.startups],
            key=lambda x: x["success_probability"],
            reverse=True,
        )

        # Rank investors
        investor_ranking = sorted(
            [i.to_dict() for i in self.investors],
            key=lambda x: x["roi"],
            reverse=True,
        )

        return {
            "status": "completed",
            "summary": {
                "total_startups": len(self.startups),
                "active_startups": len(active),
                "failed_startups": len(failed),
                "unicorns": len(unicorns),
                "funded_startups": len(funded),
                "total_funding_deployed": round(sum(i.total_invested for i in self.investors), 2),
                "avg_success_rate": round(
                    sum(s.success_probability for s in self.startups) / max(len(self.startups), 1), 2
                ),
                "market_final_sentiment": round(self.market_agent.sentiment, 2),
                "market_final_condition": self.market_agent.condition,
            },
            "startup_ranking": startup_ranking,
            "investor_ranking": investor_ranking,
            "rounds": self.rounds,
            "market_trends": self.market_agent.get_trend_summary(),
            "risk_summary": self.risk_agent.get_risk_summary(),
            "agent_logs": self.agent_logs,
        }

    def _log(self, agent_type, agent_id, action, details):
        """Log an agent action."""
        self.agent_logs.append({
            "agent_type": agent_type,
            "agent_id": agent_id,
            "action": action,
            "details": details,
        })
