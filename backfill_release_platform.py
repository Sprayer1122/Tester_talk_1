#!/usr/bin/env python3
"""
Backfill script for release and platform columns in issues table
"""

import sys
import os
import re
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import app, db
from models import Issue

def parse_testcase_path(path):
    if not path:
        return None, None
    pattern = r'/lan/fed/etpv5/release/(\d+)/([^/]+)/etautotest/'
    match = re.match(pattern, path)
    if match:
        return match.group(1), match.group(2)
    return None, None

def backfill():
    with app.app_context():
        issues = Issue.query.all()
        updated = 0
        for issue in issues:
            release, platform = parse_testcase_path(issue.testcase_path)
            if release != issue.release or platform != issue.platform:
                issue.release = release
                issue.platform = platform
                updated += 1
        db.session.commit()
        print(f"Backfill complete. Updated {updated} issues.")

if __name__ == "__main__":
    print("Backfilling release and platform columns for issues...")
    backfill()
    print("Done.") 