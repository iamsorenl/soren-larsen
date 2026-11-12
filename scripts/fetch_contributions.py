"""Refresh src/data/contributions.json with Soren's real GitHub contribution calendar.

Run by hand (not in the build, so CI never needs a token):
    pip install git+https://github.com/iamsorenl/gh-graphql
    npm run sync:contributions
On any failure it exits 1 and leaves the existing JSON untouched.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from gh_graphql import query

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "contributions.json"
Q = """{ user(login: "iamsorenl") { contributionsCollection { contributionCalendar {
  totalContributions weeks { contributionDays { date contributionCount } } } } } }"""


def main():
    try:
        cal = query(Q)["user"]["contributionsCollection"]["contributionCalendar"]
        days = [{"date": d["date"], "count": d["contributionCount"]}
                for w in cal["weeks"] for d in w["contributionDays"]]
        if not days:
            raise ValueError("calendar came back empty")
    except Exception as e:  # keep the last good file
        print(f"fetch_contributions: {e}", file=sys.stderr)
        sys.exit(1)
    data = {"fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "total": cal["totalContributions"], "days": days}
    OUT.write_text(json.dumps(data, separators=(",", ":")) + "\n")
    print(f"wrote {OUT.name}: {data['total']} contributions over {len(days)} days")


if __name__ == "__main__":
    main()
