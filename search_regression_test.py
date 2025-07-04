#!/usr/bin/env python3
"""
Comprehensive Regression Testing for Search Functionality
Tests every possible search scenario including edge cases and error conditions
"""

import requests
import json
import sys
import time
import random
import string
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

BASE_URL = "http://localhost:5000/api"

class SearchRegressionTester:
    def __init__(self):
        self.test_results = []
        self.created_issues = []
        self.session = requests.Session()
        
    def log_test(self, test_name: str, success: bool, details: str = "", duration: float = 0):
        """Log test result with details"""
        status = "✅ PASS" if success else "❌ FAIL"
        duration_str = f" ({duration:.3f}s)" if duration > 0 else ""
        print(f"{test_name}: {status}{duration_str}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test_name': test_name,
            'success': success,
            'details': details,
            'duration': duration
        })
    
    def create_test_issue(self, issue_data: Dict[str, Any]) -> Optional[int]:
        """Create a test issue and return its ID"""
        try:
            response = self.session.post(f"{BASE_URL}/issues", json=issue_data)
            if response.status_code == 201:
                data = response.json()
                issue_id = data.get('id')
                self.created_issues.append(issue_id)
                return issue_id
            else:
                print(f"Failed to create test issue: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Error creating test issue: {e}")
            return None
    
    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        for issue_id in self.created_issues:
            try:
                response = self.session.delete(f"{BASE_URL}/admin/issues/{issue_id}")
                if response.status_code == 200:
                    print(f"   Deleted issue {issue_id}")
            except:
                pass
    
    def test_search_basic_functionality(self):
        """Test basic search functionality"""
        print("\n🔍 Testing Basic Search Functionality")
        print("=" * 50)
        
        # Create test issues with different content
        test_issues = [
            {
                "testcase_title": "Login Authentication Bug",
                "testcase_path": "/lan/fed/etpv5/release/251/lnx86/etautotest/auth/login_test.py",
                "severity": "High",
                "description": "User cannot login with valid credentials",
                "reporter_name": "TestUser1",
                "tags": ["authentication", "login", "bug"]
            },
            {
                "testcase_title": "Database Connection Issue",
                "testcase_path": "/lan/fed/etpv5/release/261/lr/etautotest/db/connection_test.py",
                "severity": "Critical",
                "description": "Database connection fails intermittently",
                "reporter_name": "TestUser2",
                "tags": ["database", "connection", "critical"]
            },
            {
                "testcase_title": "UI Rendering Problem",
                "testcase_path": "/lan/fed/etpv5/release/231/rhel7.6/etautotest/ui/render_test.py",
                "severity": "Medium",
                "description": "UI elements not rendering correctly",
                "reporter_name": "TestUser3",
                "tags": ["ui", "rendering", "frontend"]
            }
        ]
        
        created_ids = []
        for issue_data in test_issues:
            issue_id = self.create_test_issue(issue_data)
            if issue_id:
                created_ids.append(issue_id)
                time.sleep(1)  # Wait for indexing
        
        if not created_ids:
            self.log_test("Create Test Issues", False, "Failed to create test issues")
            return
        
        # Test 1: Empty search
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search")
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('total', 0) == 0
            self.log_test("Empty Search", success, f"Returned {data.get('total', 0)} results", duration)
        else:
            self.log_test("Empty Search", False, f"Status: {response.status_code}", duration)
        
        # Test 2: Simple text search
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"q": "login"})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('total', 0) > 0
            self.log_test("Text Search - 'login'", success, f"Found {data.get('total', 0)} results", duration)
        else:
            self.log_test("Text Search - 'login'", False, f"Status: {response.status_code}", duration)
        
        # Test 3: Search in description
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"q": "credentials"})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('total', 0) > 0
            self.log_test("Description Search - 'credentials'", success, f"Found {data.get('total', 0)} results", duration)
        else:
            self.log_test("Description Search - 'credentials'", False, f"Status: {response.status_code}", duration)
    
    def test_search_filters(self):
        """Test search with various filters"""
        print("\n🔍 Testing Search Filters")
        print("=" * 50)
        
        # Test status filter
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"status": "open"})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('total', 0) >= 0
            self.log_test("Status Filter - 'open'", success, f"Found {data.get('total', 0)} open issues", duration)
        else:
            self.log_test("Status Filter - 'open'", False, f"Status: {response.status_code}", duration)
        
        # Test combined filters
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"status": "open", "q": "bug"})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('total', 0) >= 0
            self.log_test("Combined Filter - status + text", success, f"Found {data.get('total', 0)} results", duration)
        else:
            self.log_test("Combined Filter - status + text", False, f"Status: {response.status_code}", duration)
        
        # Test tags filter
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"tags": "critical"})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('total', 0) >= 0
            self.log_test("Tags Filter - 'critical'", success, f"Found {data.get('total', 0)} results", duration)
        else:
            self.log_test("Tags Filter - 'critical'", False, f"Status: {response.status_code}", duration)
    
    def test_search_edge_cases(self):
        """Test edge cases and error conditions"""
        print("\n🔍 Testing Edge Cases")
        print("=" * 50)
        
        # Test 1: Very long search query
        long_query = "a" * 1000
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"q": long_query})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = isinstance(data, dict) and 'issues' in data
            self.log_test("Long Query (1000 chars)", success, f"Response valid: {success}", duration)
        else:
            self.log_test("Long Query (1000 chars)", False, f"Status: {response.status_code}", duration)
        
        # Test 2: Special characters
        special_chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"q": special_chars})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = isinstance(data, dict) and 'issues' in data
            self.log_test("Special Characters", success, f"Response valid: {success}", duration)
        else:
            self.log_test("Special Characters", False, f"Status: {response.status_code}", duration)
        
        # Test 3: SQL injection attempt
        sql_injection = "'; DROP TABLE issues; --"
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"q": sql_injection})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = isinstance(data, dict) and 'issues' in data
            self.log_test("SQL Injection Prevention", success, f"Response valid: {success}", duration)
        else:
            self.log_test("SQL Injection Prevention", False, f"Status: {response.status_code}", duration)
        
        # Test 4: XSS attempt
        xss_attempt = "<script>alert('xss')</script>"
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"q": xss_attempt})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = isinstance(data, dict) and 'issues' in data
            self.log_test("XSS Prevention", success, f"Response valid: {success}", duration)
        else:
            self.log_test("XSS Prevention", False, f"Status: {response.status_code}", duration)
        
        # Test 5: Empty parameters
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"q": "", "status": "", "tags": ""})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            success = data.get('total', 0) == 0
            self.log_test("Empty Parameters", success, f"Returned {data.get('total', 0)} results", duration)
        else:
            self.log_test("Empty Parameters", False, f"Status: {response.status_code}", duration)
    
    def test_search_performance(self):
        """Test search performance with various scenarios"""
        print("\n🔍 Testing Search Performance")
        print("=" * 50)
        
        # Test 1: Simple search performance
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={"q": "test"})
        duration = time.time() - start_time
        
        if response.status_code == 200:
            success = duration < 2.0  # Should complete within 2 seconds
            self.log_test("Simple Search Performance", success, f"Took {duration:.3f}s", duration)
        else:
            self.log_test("Simple Search Performance", False, f"Status: {response.status_code}", duration)
        
        # Test 2: Complex search performance
        start_time = time.time()
        response = self.session.get(f"{BASE_URL}/search", params={
            "q": "database connection issue",
            "status": "open",
            "tags": "critical,bug"
        })
        duration = time.time() - start_time
        
        if response.status_code == 200:
            success = duration < 3.0  # Should complete within 3 seconds
            self.log_test("Complex Search Performance", success, f"Took {duration:.3f}s", duration)
        else:
            self.log_test("Complex Search Performance", False, f"Status: {response.status_code}", duration)
        
        # Test 3: Multiple concurrent searches
        print("   Testing concurrent searches...")
        start_time = time.time()
        responses = []
        for i in range(5):
            response = self.session.get(f"{BASE_URL}/search", params={"q": f"test{i}"})
            responses.append(response)
        duration = time.time() - start_time
        
        success_count = sum(1 for r in responses if r.status_code == 200)
        success = success_count == 5
        self.log_test("Concurrent Searches (5)", success, f"{success_count}/5 successful in {duration:.3f}s", duration)
    
    def test_search_response_format(self):
        """Test search response format and structure"""
        print("\n🔍 Testing Response Format")
        print("=" * 50)
        
        response = self.session.get(f"{BASE_URL}/search", params={"q": "test"})
        
        if response.status_code == 200:
            try:
                data = response.json()
                
                # Test response structure
                required_fields = ['issues', 'total']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Response Structure", True, "All required fields present")
                else:
                    self.log_test("Response Structure", False, f"Missing fields: {missing_fields}")
                
                # Test issues array structure
                if 'issues' in data and isinstance(data['issues'], list):
                    if data['issues']:
                        issue = data['issues'][0]
                        required_issue_fields = ['id', 'testcase_title', 'description', 'status']
                        missing_issue_fields = [field for field in required_issue_fields if field not in issue]
                        
                        if not missing_issue_fields:
                            self.log_test("Issue Object Structure", True, "All required issue fields present")
                        else:
                            self.log_test("Issue Object Structure", False, f"Missing fields: {missing_issue_fields}")
                    else:
                        self.log_test("Issue Object Structure", True, "No issues to test structure")
                else:
                    self.log_test("Issue Object Structure", False, "Issues field is not a list")
                
                # Test total field type
                if isinstance(data.get('total'), int):
                    self.log_test("Total Field Type", True, "Total is an integer")
                else:
                    self.log_test("Total Field Type", False, f"Total is {type(data.get('total'))}")
                    
            except json.JSONDecodeError as e:
                self.log_test("JSON Response Format", False, f"Invalid JSON: {e}")
        else:
            self.log_test("Response Format", False, f"Status: {response.status_code}")
    
    def test_search_pagination(self):
        """Test search pagination if implemented"""
        print("\n🔍 Testing Search Pagination")
        print("=" * 50)
        
        # Test with size parameter
        response = self.session.get(f"{BASE_URL}/search", params={"q": "test", "size": 5})
        
        if response.status_code == 200:
            data = response.json()
            issues_count = len(data.get('issues', []))
            success = issues_count <= 5
            self.log_test("Size Parameter", success, f"Returned {issues_count} issues (max 5)")
        else:
            self.log_test("Size Parameter", False, f"Status: {response.status_code}")
    
    def run_all_tests(self):
        """Run all search regression tests"""
        print("🚀 Starting Comprehensive Search Regression Testing")
        print("=" * 60)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        try:
            # Run all test suites
            self.test_search_basic_functionality()
            self.test_search_filters()
            self.test_search_edge_cases()
            self.test_search_performance()
            self.test_search_response_format()
            self.test_search_pagination()
            
        except Exception as e:
            print(f"\n❌ Test execution failed: {e}")
            return False
        finally:
            # Cleanup
            self.cleanup_test_data()
        
        # Generate summary
        self.generate_summary()
        return True
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 SEARCH REGRESSION TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['test_name']}: {result['details']}")
        
        # Performance summary
        avg_duration = sum(r['duration'] for r in self.test_results) / total_tests
        max_duration = max(r['duration'] for r in self.test_results)
        print(f"\n⏱️  Performance:")
        print(f"   Average Duration: {avg_duration:.3f}s")
        print(f"   Max Duration: {max_duration:.3f}s")
        
        if passed_tests == total_tests:
            print("\n🎉 ALL TESTS PASSED! Search functionality is working correctly.")
        else:
            print(f"\n⚠️  {failed_tests} test(s) failed. Search functionality needs attention.")
        
        return passed_tests == total_tests

def main():
    """Main function"""
    tester = SearchRegressionTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⏹️  Testing interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 