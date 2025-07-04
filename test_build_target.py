#!/usr/bin/env python3
"""
Test script for Build and Target functionality
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:5000/api"

def test_build_target_functionality():
    """Test the new Build and Target functionality"""
    
    print("🧪 Testing Build and Target Functionality")
    print("=" * 50)
    
    # Test 1: Get build options
    print("\n1. Testing Build Options API...")
    try:
        response = requests.get(f"{BASE_URL}/builds")
        if response.status_code == 200:
            builds = response.json()
            print(f"✅ Build options: {builds}")
        else:
            print(f"❌ Failed to get build options: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting build options: {e}")
    
    # Test 2: Get target options for different releases
    print("\n2. Testing Target Options API...")
    releases = ['251', '261', '231']
    for release in releases:
        try:
            response = requests.get(f"{BASE_URL}/targets/{release}")
            if response.status_code == 200:
                targets = response.json()
                print(f"✅ Targets for release {release}: {targets}")
            else:
                print(f"❌ Failed to get targets for release {release}: {response.status_code}")
        except Exception as e:
            print(f"❌ Error getting targets for release {release}: {e}")
    
    # Test 3: Create an issue with build and target
    print("\n3. Testing Issue Creation with Build and Target...")
    issue_data = {
        "testcase_title": "Test Build and Target Functionality",
        "testcase_path": "/lan/fed/etpv5/release/251/lnx86/etautotest/test/build_target",
        "severity": "Medium",
        "build": "Weekly",
        "target": "25.11-d065_1_Jun23",
        "description": "Testing the new build and target fields",
        "reporter_name": "Test User",
        "tags": "test,build,target"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/issues", json=issue_data)
        if response.status_code == 201:
            issue = response.json()
            print(f"✅ Issue created successfully with ID: {issue['id']}")
            print(f"   Build: {issue.get('build')}")
            print(f"   Target: {issue.get('target')}")
            print(f"   Release: {issue.get('release')}")
            print(f"   Platform: {issue.get('platform')}")
        else:
            print(f"❌ Failed to create issue: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error creating issue: {e}")
    
    # Test 4: Test filtering by build and target
    print("\n4. Testing Filtering by Build and Target...")
    try:
        # Filter by build
        response = requests.get(f"{BASE_URL}/issues?build=Weekly")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Issues with Weekly build: {len(data.get('issues', []))} found")
        
        # Filter by target
        response = requests.get(f"{BASE_URL}/issues?target=25.11-d065_1_Jun23")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Issues with target 25.11-d065_1_Jun23: {len(data.get('issues', []))} found")
            
    except Exception as e:
        print(f"❌ Error testing filters: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Build and Target functionality test completed!")

if __name__ == "__main__":
    test_build_target_functionality() 