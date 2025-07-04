#!/usr/bin/env python3
"""
Test script to verify all API endpoints are working correctly
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5000/api"

def test_get_issues():
    """Test GET /api/issues"""
    print("🔍 Testing GET /api/issues...")
    try:
        response = requests.get(f"{BASE_URL}/issues")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {data.get('total', 0)} issues")
            return True
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_create_issue():
    """Test POST /api/issues"""
    print("\n🔍 Testing POST /api/issues...")
    try:
        issue_data = {
            "title": "API Test Issue",
            "description": "This is a test issue created via API",
            "commenter_name": "API Tester",
            "test_case_id": "TC-API-001",
            "tags": ["api", "test", "backend"]
        }
        
        response = requests.post(f"{BASE_URL}/issues", json=issue_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Success! Created issue with ID: {data.get('id')}")
            return data.get('id')
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_get_issue(issue_id):
    """Test GET /api/issues/{id}"""
    print(f"\n🔍 Testing GET /api/issues/{issue_id}...")
    try:
        response = requests.get(f"{BASE_URL}/issues/{issue_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Retrieved issue: {data.get('issue', {}).get('title')}")
            return True
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_add_comment(issue_id):
    """Test POST /api/issues/{id}/comments"""
    print(f"\n🔍 Testing POST /api/issues/{issue_id}/comments...")
    try:
        comment_data = {
            "commenter_name": "Comment Tester",
            "content": "This is a test comment via API"
        }
        
        response = requests.post(f"{BASE_URL}/issues/{issue_id}/comments", json=comment_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Success! Added comment with ID: {data.get('id')}")
            return data.get('id')
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_verify_solution(comment_id):
    """Test POST /api/comments/{id}/verify"""
    print(f"\n🔍 Testing POST /api/comments/{comment_id}/verify...")
    try:
        response = requests.post(f"{BASE_URL}/comments/{comment_id}/verify")
        if response.status_code == 200:
            print("✅ Success! Comment marked as verified solution")
            return True
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_search():
    """Test GET /api/search"""
    print("\n🔍 Testing GET /api/search...")
    try:
        response = requests.get(f"{BASE_URL}/search", params={"q": "test"})
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Search returned {len(data)} results")
            return True
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_tags():
    """Test GET /api/tags"""
    print("\n🔍 Testing GET /api/tags...")
    try:
        response = requests.get(f"{BASE_URL}/tags")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {len(data)} tags")
            return True
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Testing API Endpoints")
    print("=" * 50)
    
    # Test results
    results = []
    
    # Test 1: Get all issues
    results.append(("GET /api/issues", test_get_issues()))
    
    # Test 2: Create an issue
    issue_id = test_create_issue()
    results.append(("POST /api/issues", issue_id is not None))
    
    if issue_id:
        # Test 3: Get specific issue
        results.append(("GET /api/issues/{id}", test_get_issue(issue_id)))
        
        # Test 4: Add comment
        comment_id = test_add_comment(issue_id)
        results.append(("POST /api/issues/{id}/comments", comment_id is not None))
        
        if comment_id:
            # Test 5: Verify solution
            results.append(("POST /api/comments/{id}/verify", test_verify_solution(comment_id)))
    
    # Test 6: Search
    results.append(("GET /api/search", test_search()))
    
    # Test 7: Get tags
    results.append(("GET /api/tags", test_get_tags()))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 API Test Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for endpoint, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{endpoint}: {status}")
        if success:
            passed += 1
    
    print(f"\nResults: {passed}/{total} endpoints working")
    
    if passed == total:
        print("\n🎉 All API endpoints are working perfectly!")
    else:
        print(f"\n⚠️  {total - passed} endpoint(s) need attention")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 