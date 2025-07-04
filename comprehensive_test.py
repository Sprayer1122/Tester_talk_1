#!/usr/bin/env python3
"""
Comprehensive Test Script for Tester Talk Application
Tests all APIs, frontend flows, and backend functionality
"""

import requests
import json
import time
import os
from datetime import datetime

BASE_URL = 'http://localhost:8080/api'

class TesterTalkTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append((test_name, success, details))
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test API health endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/health")
            success = response.status_code == 200
            self.log_test("Health Check", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False
    
    def test_authentication(self):
        """Test authentication flow"""
        try:
            # Test login
            login_data = {'username': 'admin', 'password': 'admin123'}
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            success = response.status_code == 200
            self.log_test("Login", success, f"Status: {response.status_code}")
            
            if success:
                # Test current user endpoint
                response = self.session.get(f"{BASE_URL}/auth/me")
                success = response.status_code == 200
                self.log_test("Get Current User", success, f"Status: {response.status_code}")
                
                # Test logout
                response = self.session.post(f"{BASE_URL}/auth/logout")
                success = response.status_code == 200
                self.log_test("Logout", success, f"Status: {response.status_code}")
                
                # Test that user is logged out
                response = self.session.get(f"{BASE_URL}/auth/me")
                success = response.status_code == 401
                self.log_test("Unauthenticated Access", success, f"Status: {response.status_code}")
            
            return success
        except Exception as e:
            self.log_test("Authentication", False, str(e))
            return False
    
    def test_issue_creation(self):
        """Test issue creation flow"""
        try:
            # Login first
            self.session.post(f"{BASE_URL}/auth/login", json={'username': 'admin', 'password': 'admin123'})
            
            # Test issue creation
            issue_data = {
                'testcase_title': 'Regression Test Issue',
                'testcase_path': '/lan/fed/etpv5/release/251/lnx86/etautotest/ett/small_delay/elastic_xor',
                'build': 'Weekly',
                'target': '25.11-d062_1_Jun_19',
                'severity': 'Medium',
                'test_case_id': 'Auto-generated',
                'description': 'This is a test issue created during regression testing',
                'additional_comments': 'Additional test comments',
                'reporter_name': 'admin',
                'tags': 'test,regression'
            }
            
            # Convert all values to strings for form-data compatibility
            issue_data = {k: str(v) for k, v in issue_data.items()}
            response = self.session.post(f"{BASE_URL}/issues", data=issue_data, files={})
            success = response.status_code == 201
            details = f"Status: {response.status_code}"
            if not success:
                details += f" | Response: {response.text}"
            self.log_test("Create Issue", success, details)
            
            if success:
                issue_id = response.json().get('id')
                self.log_test("Issue ID Generated", issue_id is not None, f"Issue ID: {issue_id}")
                return issue_id
            
            return None
        except Exception as e:
            self.log_test("Issue Creation", False, str(e))
            return None
    
    def test_issue_operations(self, issue_id):
        """Test issue operations"""
        try:
            # Test get issue
            response = self.session.get(f"{BASE_URL}/issues/{issue_id}")
            success = response.status_code == 200
            self.log_test("Get Issue", success, f"Status: {response.status_code}")
            
            # Test add comment
            comment_data = {
                'commenter_name': 'admin',
                'content': 'This is a test comment during regression testing'
            }
            response = self.session.post(f"{BASE_URL}/issues/{issue_id}/comments", json=comment_data)
            success = response.status_code == 201
            self.log_test("Add Comment", success, f"Status: {response.status_code}")
            
            if success:
                comment_id = response.json().get('id')
                
                # Test upvote comment
                response = self.session.post(f"{BASE_URL}/comments/{comment_id}/upvote")
                success = response.status_code == 200
                self.log_test("Upvote Comment", success, f"Status: {response.status_code}")
                
                # Test verify solution
                response = self.session.post(f"{BASE_URL}/comments/{comment_id}/verify")
                success = response.status_code == 200
                self.log_test("Verify Solution", success, f"Status: {response.status_code}")
            
            # Test upvote issue
            response = self.session.post(f"{BASE_URL}/issues/{issue_id}/upvote")
            success = response.status_code == 200
            self.log_test("Upvote Issue", success, f"Status: {response.status_code}")
            
            return True
        except Exception as e:
            self.log_test("Issue Operations", False, str(e))
            return False
    
    def test_search_functionality(self):
        """Test search functionality"""
        try:
            # Test search
            search_data = {'query': 'test'}
            response = self.session.post(f"{BASE_URL}/search", json=search_data)
            success = response.status_code == 200
            self.log_test("Search Issues", success, f"Status: {response.status_code}")
            
            return success
        except Exception as e:
            self.log_test("Search", False, str(e))
            return False
    
    def test_admin_functionality(self):
        """Test admin functionality"""
        try:
            # Test get users (admin only)
            response = self.session.get(f"{BASE_URL}/admin/users")
            success = response.status_code == 200
            self.log_test("Get Users (Admin)", success, f"Status: {response.status_code}")
            
            # Test get all issue IDs
            response = self.session.get(f"{BASE_URL}/admin/issues/ids")
            success = response.status_code == 200
            self.log_test("Get Issue IDs (Admin)", success, f"Status: {response.status_code}")
            
            return True
        except Exception as e:
            self.log_test("Admin Functions", False, str(e))
            return False
    
    def test_api_endpoints(self):
        """Test various API endpoints"""
        try:
            endpoints = [
                ('/builds', 'GET'),
                ('/tags', 'GET'),
                ('/releases', 'GET'),
                ('/platforms', 'GET'),
                ('/issues', 'GET')
            ]
            
            for endpoint, method in endpoints:
                if method == 'GET':
                    response = self.session.get(f"{BASE_URL}{endpoint}")
                else:
                    response = self.session.post(f"{BASE_URL}{endpoint}")
                
                success = response.status_code in [200, 201]
                self.log_test(f"{method} {endpoint}", success, f"Status: {response.status_code}")
            
            return True
        except Exception as e:
            self.log_test("API Endpoints", False, str(e))
            return False
    
    def test_frontend_pages(self):
        """Test frontend page accessibility"""
        try:
            pages = ['/', '/create.html', '/login.html', '/admin.html']
            
            for page in pages:
                response = self.session.get(f"http://localhost:8080{page}")
                success = response.status_code == 200
                self.log_test(f"Frontend Page: {page}", success, f"Status: {response.status_code}")
            
            return True
        except Exception as e:
            self.log_test("Frontend Pages", False, str(e))
            return False
    
    def test_static_files(self):
        """Test static file serving"""
        try:
            static_files = [
                '/static/style.css',
                '/static/main.js',
                '/static/loading.js',
                '/static/notifications.js'
            ]
            
            for file_path in static_files:
                response = self.session.get(f"http://localhost:8080{file_path}")
                success = response.status_code == 200
                self.log_test(f"Static File: {file_path}", success, f"Status: {response.status_code}")
            
            return True
        except Exception as e:
            self.log_test("Static Files", False, str(e))
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Comprehensive Regression Test")
        print("=" * 60)
        
        # Test basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed. Server may not be running.")
            return False
        
        # Test authentication
        self.test_authentication()
        
        # Login for authenticated tests
        self.session.post(f"{BASE_URL}/auth/login", json={'username': 'admin', 'password': 'admin123'})
        
        # Test API endpoints
        self.test_api_endpoints()
        
        # Test issue creation and operations
        issue_id = self.test_issue_creation()
        if issue_id:
            self.test_issue_operations(issue_id)
        
        # Test search
        self.test_search_functionality()
        
        # Test admin functionality
        self.test_admin_functionality()
        
        # Test frontend
        self.test_frontend_pages()
        self.test_static_files()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 REGRESSION TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for _, success, _ in self.test_results if success)
        total = len(self.test_results)
        
        for test_name, success, details in self.test_results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{status} {test_name}")
            if details and not success:
                print(f"   Details: {details}")
        
        print(f"\nResults: {passed}/{total} tests passed")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Application is 100% functional!")
            return True
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Please review the issues above.")
            return False

if __name__ == "__main__":
    tester = TesterTalkTester()
    success = tester.run_all_tests()
    exit(0 if success else 1) 