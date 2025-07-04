#!/usr/bin/env python3
"""
Test script to verify search improvements and fix the specific issue:
"When searching for 'No src found', it shows 'No makefile found' at the top"
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000/api"

def test_search_queries():
    """Test various search queries to verify improvements"""
    
    print("🧪 Testing Search Improvements")
    print("=" * 50)
    
    # Test cases that should demonstrate better relevance
    test_cases = [
        {
            "name": "Exact phrase 'No src found'",
            "query": "No src found",
            "expected_behavior": "Should return issues with 'No src found' ranked higher than 'No makefile found'"
        },
        {
            "name": "Exact phrase 'No makefile found'", 
            "query": "No makefile found",
            "expected_behavior": "Should return issues with 'No makefile found' ranked higher than 'No src found'"
        },
        {
            "name": "Partial match 'src found'",
            "query": "src found",
            "expected_behavior": "Should return issues containing 'src found' with good relevance"
        },
        {
            "name": "Partial match 'makefile found'",
            "query": "makefile found", 
            "expected_behavior": "Should return issues containing 'makefile found' with good relevance"
        },
        {
            "name": "Single word 'src'",
            "query": "src",
            "expected_behavior": "Should return issues containing 'src'"
        },
        {
            "name": "Single word 'makefile'",
            "query": "makefile",
            "expected_behavior": "Should return issues containing 'makefile'"
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🔍 Testing: {test_case['name']}")
        print(f"Query: '{test_case['query']}'")
        print(f"Expected: {test_case['expected_behavior']}")
        
        try:
            # Perform search
            response = requests.get(f"{BASE_URL}/search", params={"q": test_case['query'], "size": 10})
            
            if response.status_code == 200:
                data = response.json()
                issues = data.get('issues', [])
                total = data.get('total', 0)
                max_score = data.get('max_score', 0)
                
                print(f"✅ Found {total} results (max score: {max_score:.2f})")
                
                if issues:
                    print("📋 Top 5 results:")
                    for i, issue in enumerate(issues[:5], 1):
                        title = issue.get('testcase_title', 'N/A')
                        score = issue.get('search_score', 0)
                        highlights = issue.get('highlights', {})
                        
                        print(f"  {i}. Score: {score:.2f} | Title: {title}")
                        
                        # Show highlights if available
                        if highlights:
                            for field, highlights_list in highlights.items():
                                if highlights_list:
                                    print(f"     Highlight ({field}): {highlights_list[0]}")
                else:
                    print("❌ No results found")
                    
            else:
                print(f"❌ Search failed with status {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Test failed: {e}")
        
        print("-" * 40)

def test_search_scoring():
    """Test that search scoring works correctly for the specific issue"""
    
    print("\n🎯 Testing Search Scoring for Specific Issue")
    print("=" * 50)
    
    # Test the specific problematic case
    problematic_queries = [
        "No src found",
        "No makefile found"
    ]
    
    results = {}
    
    for query in problematic_queries:
        print(f"\n🔍 Testing query: '{query}'")
        
        try:
            response = requests.get(f"{BASE_URL}/search", params={"q": query, "size": 5})
            
            if response.status_code == 200:
                data = response.json()
                issues = data.get('issues', [])
                
                print(f"Found {len(issues)} results:")
                
                for i, issue in enumerate(issues, 1):
                    title = issue.get('testcase_title', 'N/A')
                    score = issue.get('search_score', 0)
                    print(f"  {i}. Score: {score:.2f} | {title}")
                    
                    # Check if this result contains the search terms
                    title_lower = title.lower()
                    query_lower = query.lower()
                    
                    if query_lower in title_lower:
                        print(f"     ✅ Contains exact phrase")
                    elif all(term in title_lower for term in query_lower.split()):
                        print(f"     ✅ Contains all terms")
                    else:
                        print(f"     ⚠️  Partial match")
                
                results[query] = issues
                
            else:
                print(f"❌ Search failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Test failed: {e}")
    
    # Analyze results
    print("\n📊 Analysis:")
    print("=" * 30)
    
    if "No src found" in results and "No makefile found" in results:
        src_results = results["No src found"]
        makefile_results = results["No makefile found"]
        
        print("For 'No src found' query:")
        if src_results:
            top_result = src_results[0]
            print(f"  Top result: {top_result.get('testcase_title', 'N/A')}")
            print(f"  Score: {top_result.get('search_score', 0):.2f}")
            
            # Check if top result actually contains "src"
            if "src" in top_result.get('testcase_title', '').lower():
                print("  ✅ Top result correctly contains 'src'")
            else:
                print("  ❌ Top result does not contain 'src'")
        
        print("\nFor 'No makefile found' query:")
        if makefile_results:
            top_result = makefile_results[0]
            print(f"  Top result: {top_result.get('testcase_title', 'N/A')}")
            print(f"  Score: {top_result.get('search_score', 0):.2f}")
            
            # Check if top result actually contains "makefile"
            if "makefile" in top_result.get('testcase_title', '').lower():
                print("  ✅ Top result correctly contains 'makefile'")
            else:
                print("  ❌ Top result does not contain 'makefile'")

def test_search_performance():
    """Test search performance"""
    
    print("\n⚡ Testing Search Performance")
    print("=" * 40)
    
    test_queries = ["No src found", "No makefile found", "test", "error"]
    
    for query in test_queries:
        print(f"\n🔍 Testing performance for: '{query}'")
        
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/search", params={"q": query, "size": 20})
            end_time = time.time()
            
            duration = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                data = response.json()
                total = data.get('total', 0)
                print(f"✅ Response time: {duration:.2f}ms")
                print(f"   Results: {total}")
            else:
                print(f"❌ Failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Performance test failed: {e}")

def main():
    """Main test function"""
    
    print("🚀 Search Improvement Test Suite")
    print("=" * 50)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Server is not responding properly")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("Make sure the Flask server is running on http://localhost:5000")
        return
    
    print("✅ Server is running")
    
    # Run tests
    test_search_queries()
    test_search_scoring()
    test_search_performance()
    
    print("\n🎉 Test suite completed!")

if __name__ == "__main__":
    main() 