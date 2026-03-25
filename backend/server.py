from fastapi import FastAPI, APIRouter, HTTPException
from starlette.middleware.cors import CORSMiddleware
import logging
import uuid
import json
import httpx
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from simulation.engine import SimulationEngine

app = FastAPI(title="AI Startup Ecosystem Simulator", version="1.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== IN-MEMORY STORAGE ====================
# No database needed! Everything stored in memory.
simulations_db = {}  # {id: simulation_data}
users_db = {}  # {email: user_data}
sessions_db = {}  # {token: user_email}
startups_db = {}  # {id: startup_data}  — registered by startup founders

# ==================== CORS ====================
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {"status": "ok"}


# ==================== PYDANTIC MODELS ====================
class SimulationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    num_startups: int = 5
    num_investors: int = 3
    num_rounds: int = 5
    market_condition: str = "neutral"
    industry: Optional[str] = "tech"
    startups: Optional[List[dict]] = []
    investors: Optional[List[dict]] = []


# ==================== AUTH MODELS ====================
class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str


# ==================== AUTH ENDPOINTS ====================
@api_router.post("/auth/signup")
async def signup(data: SignupRequest):
    """Register a new user."""
    if data.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    token = str(uuid.uuid4())
    users_db[data.email] = {
        "id": user_id,
        "full_name": data.full_name,
        "email": data.email,
        "password": data.password,  # In production, hash this!
        "role": None,  # Set after role selection
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    sessions_db[token] = data.email
    logger.info(f"User signed up: {data.email}")
    return {"token": token, "user": {"id": user_id, "full_name": data.full_name, "email": data.email, "role": None}}


@api_router.post("/auth/login")
async def login(data: LoginRequest):
    """Login an existing user."""
    user = users_db.get(data.email)
    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = str(uuid.uuid4())
    sessions_db[token] = data.email
    logger.info(f"User logged in: {data.email}")
    return {"token": token, "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"], "role": user["role"]}}


@api_router.post("/auth/role")
async def set_role(request: dict):
    """Set user role (startup_founder or investor)."""
    token = request.get("token")
    role = request.get("role")
    if token not in sessions_db:
        raise HTTPException(status_code=401, detail="Invalid session")
    if role not in ("startup_founder", "investor"):
        raise HTTPException(status_code=400, detail="Role must be 'startup_founder' or 'investor'")
    email = sessions_db[token]
    users_db[email]["role"] = role
    user = users_db[email]
    return {"user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"], "role": role}}


@api_router.get("/auth/me")
async def get_me(token: str = ""):
    """Get current user from token."""
    if token not in sessions_db:
        raise HTTPException(status_code=401, detail="Invalid session")
    email = sessions_db[token]
    user = users_db[email]
    return {"id": user["id"], "full_name": user["full_name"], "email": user["email"], "role": user["role"]}


# ==================== STARTUP REGISTRATION ====================
class StartupRegister(BaseModel):
    name: str
    industry: str = "tech"
    revenue_projection: float = 500000
    burn_rate: float = 80000
    runway_months: int = 12
    funding_ask: float = 2000000
    equity_offered: float = 15
    description: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None


async def _fetch_github_data(username: str):
    """Fetch GitHub profile + repos for trust scoring."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Fetch profile
            profile_res = await client.get(f"https://api.github.com/users/{username}")
            if profile_res.status_code != 200:
                return None
            profile = profile_res.json()

            # Fetch repos
            repos_res = await client.get(f"https://api.github.com/users/{username}/repos?per_page=100&sort=updated")
            repos = repos_res.json() if repos_res.status_code == 200 else []

            # Aggregate repo data
            total_stars = sum(r.get("stargazers_count", 0) for r in repos)
            total_forks = sum(r.get("forks_count", 0) for r in repos)
            languages = list(set(r.get("language") for r in repos if r.get("language")))
            recent_repos = [r for r in repos if r.get("pushed_at", "") >= (datetime.now(timezone.utc).isoformat()[:4])]

            return {
                "username": username,
                "name": profile.get("name") or username,
                "bio": profile.get("bio") or "",
                "avatar_url": profile.get("avatar_url", ""),
                "public_repos": profile.get("public_repos", 0),
                "followers": profile.get("followers", 0),
                "following": profile.get("following", 0),
                "account_created": profile.get("created_at", ""),
                "total_stars": total_stars,
                "total_forks": total_forks,
                "languages": languages[:10],
                "recent_repos_count": len(recent_repos),
                "top_repos": [
                    {
                        "name": r["name"],
                        "description": r.get("description", ""),
                        "stars": r.get("stargazers_count", 0),
                        "forks": r.get("forks_count", 0),
                        "language": r.get("language", ""),
                        "updated_at": r.get("pushed_at", ""),
                    }
                    for r in sorted(repos, key=lambda x: x.get("stargazers_count", 0), reverse=True)[:5]
                ],
            }
    except Exception as e:
        logger.error(f"GitHub fetch failed for {username}: {e}")
        return None


def _compute_trust_score(github_data):
    """Compute a Trust Score (0-100) from GitHub profile data."""
    if not github_data:
        return 0, "No GitHub data available"

    score = 0
    reasons = []

    # Account age (max 20 pts)
    try:
        created = datetime.fromisoformat(github_data["account_created"].replace("Z", "+00:00"))
        years = (datetime.now(timezone.utc) - created).days / 365
        age_pts = min(20, int(years * 5))
        score += age_pts
        if years >= 3:
            reasons.append(f"Established account ({years:.0f} years old)")
        elif years < 1:
            reasons.append(f"New account ({years:.1f} years old)")
    except:
        pass

    # Repos (max 20 pts)
    repos = github_data.get("public_repos", 0)
    repo_pts = min(20, repos * 2)
    score += repo_pts
    if repos >= 10:
        reasons.append(f"{repos} public repos — active builder")
    elif repos < 3:
        reasons.append(f"Only {repos} repos — limited portfolio")

    # Stars (max 20 pts)
    stars = github_data.get("total_stars", 0)
    star_pts = min(20, stars)
    score += star_pts
    if stars >= 10:
        reasons.append(f"{stars} total stars — community validation")

    # Followers (max 15 pts)
    followers = github_data.get("followers", 0)
    follower_pts = min(15, followers)
    score += follower_pts
    if followers >= 10:
        reasons.append(f"{followers} followers — developer reputation")

    # Recent activity (max 15 pts)
    recent = github_data.get("recent_repos_count", 0)
    recent_pts = min(15, recent * 3)
    score += recent_pts
    if recent >= 3:
        reasons.append(f"{recent} repos updated this year — actively coding")
    elif recent == 0:
        reasons.append("No recent activity — potentially inactive")

    # Tech diversity (max 10 pts)
    langs = len(github_data.get("languages", []))
    lang_pts = min(10, langs * 2)
    score += lang_pts
    if langs >= 3:
        reasons.append(f"Knows {langs} languages — versatile")

    score = min(100, score)
    level = "Highly Trusted" if score >= 75 else "Trusted" if score >= 50 else "Moderate" if score >= 25 else "Low Trust"
    reasons.insert(0, f"Trust Level: {level}")

    return score, reasons


def _compute_idea_quality(data):
    """AI Agent: score idea quality based on financials and market positioning."""
    import random
    score = 50
    # Revenue-to-burn ratio indicates viability of the idea
    if data.burn_rate > 0:
        ratio = data.revenue_projection / (data.burn_rate * 12)
        if ratio > 2: score += 20
        elif ratio > 1: score += 10
        elif ratio < 0.3: score -= 15
    # Large funding ask with low revenue = overvalued idea
    if data.funding_ask > 0 and data.revenue_projection > 0:
        valuation_ratio = data.funding_ask / data.revenue_projection
        if valuation_ratio > 10: score -= 10
        elif valuation_ratio < 3: score += 10
    # Industry bonus
    hot_industries = {"ai_ml": 10, "fintech": 5, "cybersecurity": 5, "healthtech": 8}
    score += hot_industries.get(data.industry, 0)
    # Competition penalty based on industry
    industry_comp = {"fintech": -5, "saas": -5, "ecommerce": -10, "ai_ml": 0,
                     "healthtech": 5, "edtech": 5, "cybersecurity": 0, "greentech": 5, "tech": -3}
    score += industry_comp.get(data.industry, 0)
    return max(10, min(95, score + random.randint(-5, 5)))


def _compute_market_demand(data):
    """AI Agent: score market demand based on industry trends and financials."""
    import random
    score = 50
    industry_demand = {
        "ai_ml": 85, "fintech": 70, "healthtech": 75, "cybersecurity": 65,
        "saas": 60, "edtech": 50, "ecommerce": 55, "greentech": 70, "tech": 55,
    }
    score = industry_demand.get(data.industry, 50)
    # High revenue projection = strong demand signal
    if data.revenue_projection > 1000000: score += 10
    elif data.revenue_projection < 100000: score -= 10
    # Crowded industries validate demand
    crowded = {"fintech", "saas", "ecommerce"}
    if data.industry in crowded: score += 5
    return max(10, min(95, score + random.randint(-5, 5)))


def _compute_team_strength(data):
    """AI Agent: infer team strength from execution signals in the data."""
    import random
    score = 50
    # Good runway management = strong team
    if data.runway_months >= 18: score += 15
    elif data.runway_months >= 12: score += 5
    elif data.runway_months < 6: score -= 15
    # Reasonable burn rate vs revenue = disciplined team
    if data.burn_rate > 0 and data.revenue_projection > 0:
        efficiency = data.revenue_projection / data.burn_rate
        if efficiency > 5: score += 15
        elif efficiency > 2: score += 8
        elif efficiency < 0.5: score -= 10
    # Reasonable equity offered = experienced founders
    if 10 <= data.equity_offered <= 20: score += 5
    elif data.equity_offered > 40: score -= 10
    return max(10, min(95, score + random.randint(-5, 5)))


def _compute_competition_level(data):
    """AI Agent: determine competition level based on industry saturation."""
    industry_competition = {
        "fintech": 80, "saas": 75, "ecommerce": 85, "ai_ml": 65,
        "healthtech": 50, "edtech": 45, "cybersecurity": 55, "greentech": 40, "tech": 60,
    }
    score = industry_competition.get(data.industry, 60)
    # Large funding ask in crowded market = more competition
    if data.funding_ask > 5000000: score += 5
    if score >= 70: return "high"
    elif score >= 45: return "medium"
    else: return "low"


@api_router.post("/startups/register")
async def register_startup(data: StartupRegister, token: str = ""):
    """Startup founder registers their startup. AI agents score idea, market, and team."""
    if token and token in sessions_db:
        email = sessions_db[token]
        founder = users_db.get(email, {})
    else:
        founder = {}

    # Fetch GitHub data if username provided
    github_data = None
    trust_score = 0
    trust_reasons = []
    if data.github_username:
        github_data = await _fetch_github_data(data.github_username)
        trust_score, trust_reasons = _compute_trust_score(github_data)

    # AI Agent scoring (boosted by GitHub trust score)
    idea_quality = _compute_idea_quality(data)
    market_demand = _compute_market_demand(data)
    team_strength = _compute_team_strength(data)
    competition_level = _compute_competition_level(data)

    # GitHub trust bonus: up to +15 pts on team_strength and +10 on idea_quality
    if trust_score > 0:
        team_strength = min(95, team_strength + int(trust_score * 0.15))
        idea_quality = min(95, idea_quality + int(trust_score * 0.10))

    startup_id = str(uuid.uuid4())
    startup = {
        "id": startup_id,
        "name": data.name,
        "industry": data.industry,
        "idea_quality": idea_quality,
        "market_demand": market_demand,
        "team_strength": team_strength,
        "revenue_projection": data.revenue_projection,
        "burn_rate": data.burn_rate,
        "runway_months": data.runway_months,
        "funding_ask": data.funding_ask,
        "equity_offered": data.equity_offered,
        "competition_level": competition_level,
        "description": data.description,
        "founder_name": founder.get("full_name", "Anonymous"),
        "founder_email": founder.get("email", ""),
        "github_username": data.github_username,
        "linkedin_url": data.linkedin_url,
        "github_data": github_data,
        "trust_score": trust_score,
        "trust_reasons": trust_reasons,
        "status": "seeking_funding",
        "funding_received": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    startups_db[startup_id] = startup
    logger.info(f"Startup registered: {data.name} ({startup_id})")
    return {"id": startup_id, "startup": startup}


@api_router.get("/startups")
async def list_startups():
    """List all registered startups (for investors to browse)."""
    startups = sorted(startups_db.values(), key=lambda x: x["created_at"], reverse=True)
    return startups


@api_router.get("/startups/{startup_id}")
async def get_startup(startup_id: str):
    """Get a single startup's details."""
    if startup_id not in startups_db:
        raise HTTPException(status_code=404, detail="Startup not found")
    return startups_db[startup_id]


@api_router.get("/startups/{startup_id}/analyze")
async def analyze_startup(startup_id: str):
    """Run AI agent analysis on a startup — Risk Agent + Market Agent + Investor Agent."""
    if startup_id not in startups_db:
        raise HTTPException(status_code=404, detail="Startup not found")

    from agents.risk_agent import RiskAgent
    from agents.market_agent import MarketAgent
    from agents.investor_agent import InvestorAgent

    startup = startups_db[startup_id]

    # Step 1: Market Agent — analyze market conditions
    market_agent = MarketAgent()
    market_event = market_agent.generate_round_event(1)
    market_score = market_agent.get_market_score(startup.get("industry", "tech"))

    # Step 2: Risk Agent — calculate risk scores
    risk_agent = RiskAgent()
    risk_result = risk_agent.evaluate_risk(startup, market_conditions="neutral")

    # Step 3: Investor Agent (3 different strategies) — evaluate the startup
    investor_evaluations = []
    for strategy in ["conservative", "balanced", "aggressive"]:
        investor = InvestorAgent(
            name=f"{strategy.capitalize()} AI Investor",
            strategy=strategy,
            budget=5000000,
        )
        pitch = {
            "idea_quality": startup["idea_quality"],
            "team_strength": startup["team_strength"],
            "market_demand": startup["market_demand"],
            "revenue_projection": startup["revenue_projection"],
            "funding_ask": startup["funding_ask"],
            "industry": startup["industry"],
        }
        evaluation = investor.evaluate_startup(pitch, risk_result["overall_risk"], market_score)
        evaluation["investor_name"] = investor.name
        evaluation["investor_strategy"] = strategy
        investor_evaluations.append(evaluation)

    # Compute overall verdict
    funded_count = sum(1 for e in investor_evaluations if e["decision"] == "funded")
    overall_verdict = "strong_invest" if funded_count == 3 else "invest" if funded_count >= 2 else "risky" if funded_count == 1 else "pass"

    return {
        "startup": startup,
        "market_analysis": {
            "market_event": market_event,
            "industry_score": market_score,
        },
        "risk_analysis": risk_result,
        "investor_evaluations": investor_evaluations,
        "verdict": overall_verdict,
        "funded_by": funded_count,
        "total_investors": 3,
    }


# ==================== HEALTH ====================
@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Startup Ecosystem Simulator"}


@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# ==================== PROFILE (simple, no auth) ====================
@api_router.get("/profile")
async def get_profile():
    return {"id": "local-user", "email": "demo@simulator.local", "full_name": "Demo User"}


# ==================== SIMULATIONS ====================
@api_router.post("/simulations")
async def create_simulation(data: SimulationCreate):
    """Create and run a new simulation."""
    sim_id = str(uuid.uuid4())

    config = {
        "num_startups": data.num_startups,
        "num_investors": data.num_investors,
        "num_rounds": data.num_rounds,
        "market_condition": data.market_condition,
        "industry": data.industry,
        "startups": data.startups or [],
        "investors": data.investors or [],
    }

    try:
        engine = SimulationEngine(config)
        results = engine.run_simulation()

        sim_record = {
            "id": sim_id,
            "name": data.name,
            "description": data.description,
            "num_startups": data.num_startups,
            "num_investors": data.num_investors,
            "num_rounds": data.num_rounds,
            "market_condition": data.market_condition,
            "industry": data.industry,
            "status": "completed",
            "results": results,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        simulations_db[sim_id] = sim_record
        logger.info(f"Simulation '{data.name}' completed: {sim_id}")

        return {"id": sim_id, "status": "completed", "results": results}

    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@api_router.get("/simulations")
async def list_simulations():
    """List all simulations."""
    sims = sorted(simulations_db.values(), key=lambda x: x["created_at"], reverse=True)
    # Return without full results (lighter response)
    return [{
        "id": s["id"],
        "name": s["name"],
        "description": s["description"],
        "num_startups": s["num_startups"],
        "num_investors": s["num_investors"],
        "num_rounds": s["num_rounds"],
        "market_condition": s["market_condition"],
        "industry": s["industry"],
        "status": s["status"],
        "created_at": s["created_at"],
    } for s in sims]


@api_router.get("/simulations/{sim_id}")
async def get_simulation(sim_id: str):
    """Get full simulation results."""
    if sim_id not in simulations_db:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return simulations_db[sim_id]


@api_router.delete("/simulations/{sim_id}")
async def delete_simulation(sim_id: str):
    """Delete a simulation."""
    if sim_id in simulations_db:
        del simulations_db[sim_id]
    return {"status": "deleted"}


# ==================== QUICK SIMULATE ====================
@api_router.post("/simulate/quick")
async def quick_simulate(data: SimulationCreate):
    """Run a quick simulation without saving."""
    config = {
        "num_startups": data.num_startups,
        "num_investors": data.num_investors,
        "num_rounds": data.num_rounds,
        "market_condition": data.market_condition,
        "industry": data.industry,
        "startups": data.startups or [],
        "investors": data.investors or [],
    }

    engine = SimulationEngine(config)
    results = engine.run_simulation()
    return results


# Mount router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
