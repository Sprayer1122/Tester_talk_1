# Release and Platform Filters

This document describes the new filtering capabilities added to the Test Case Review system.

## Overview

The system now automatically extracts Release and Platform information from testcase paths and provides filtering capabilities for these parameters.

## Testcase Path Format

The system expects testcase paths in the following format:
```
/lan/fed/etpv5/release/<Release>/<Platform>/etautotest/<<path_to_testcase>
```

### Examples:
- `/lan/fed/etpv5/release/251/lnx86/etautotest/customer/ccr/02061765`
- `/lan/fed/etpv5/release/251/lnx86/etautotest/diagnostics/flow/OAtutorial`
- `/lan/fed/etpv5/release/251/lnx86/etautotest/ett/small_delay/elastic_xor`

## Supported Releases

The system supports the following releases:
- 261
- 251
- 231

## Supported Platforms

The system supports the following platforms with their display names:

| Platform Code | Display Name |
|---------------|--------------|
| lnx86         | Linux        |
| lr            | LR           |
| rhel7.6       | RHEL7.6      |
| centos7.4     | CENTOS7.4    |
| sles12sp3     | SLES12SP3    |
| lop           | LOP          |

## Features

### 1. Automatic Extraction
When a user enters a testcase path in the Create Issue form, the system automatically:
- Parses the path to extract Release and Platform information
- Displays the extracted information in a blue info box
- Shows a warning if the path format is not recognized

### 2. Filtering in Issue List
The Issue List page now includes:
- Release filter dropdown (populated from existing issues)
- Platform filter dropdown (populated from existing issues)
- Combined filtering with existing Status and Severity filters

### 3. Search Integration
The search functionality includes:
- Release and Platform information in search results
- Ability to search by release and platform values
- Display of extracted information in issue cards

### 4. Database Storage
The system stores:
- `release` field: The extracted release number (e.g., "251")
- `platform` field: The platform code (e.g., "lnx86")
- `platform_display` field: The human-readable platform name (e.g., "Linux")

## API Endpoints

### New Endpoints

#### GET /api/releases
Returns all available releases from existing issues.

**Response:**
```json
["261", "251", "231"]
```

#### GET /api/platforms
Returns all available platforms with their display names.

**Response:**
```json
[
  {"code": "lnx86", "display": "Linux"},
  {"code": "lr", "display": "LR"},
  {"code": "rhel7.6", "display": "RHEL7.6"},
  {"code": "centos7.4", "display": "CENTOS7.4"},
  {"code": "sles12sp3", "display": "SLES12SP3"},
  {"code": "lop", "display": "LOP"}
]
```

### Updated Endpoints

#### GET /api/issues
Now supports additional query parameters:
- `release`: Filter by release number
- `platform`: Filter by platform code

**Example:**
```
GET /api/issues?release=251&platform=lnx86
```

## Database Migration

To update existing databases, run the migration script:

```sql
-- Run database/migrate_release_platform.sql
```

This script will:
1. Add `release` and `platform` columns to the `issues` table
2. Extract release and platform information from existing testcase paths
3. Create indexes for better query performance

## Implementation Details

### Backend Changes
- Updated `Issue` model with new fields and parsing methods
- Added new API endpoints for releases and platforms
- Updated Elasticsearch indexing to include new fields
- Enhanced filtering logic in the issues endpoint

### Frontend Changes
- Updated CreateIssue form with real-time path parsing
- Added Release and Platform filter dropdowns to IssueList
- Enhanced issue display to show release and platform information
- Updated API service to support new endpoints

### Path Parsing Logic
The system uses a regular expression to parse testcase paths:
```python
pattern = r'/lan/fed/etpv5/release/(\d+)/([^/]+)/etautotest/'
```

This pattern:
- Captures the release number (digits after `/release/`)
- Captures the platform code (any characters before `/etautotest/`)
- Validates the overall path structure

## Usage

### Creating Issues
1. Enter a testcase path in the expected format
2. The system will automatically extract and display Release and Platform information
3. If the path format is incorrect, a warning will be shown

### Filtering Issues
1. Use the Release dropdown to filter by specific releases
2. Use the Platform dropdown to filter by specific platforms
3. Combine with existing Status and Severity filters
4. Use the search bar to search across all fields including release and platform

### Search
The search functionality now includes:
- Release numbers in search results
- Platform names in search results
- Automatic highlighting of matched terms

## Future Enhancements

Potential future improvements:
- Support for additional path formats
- Bulk import with automatic path parsing
- Advanced filtering with date ranges
- Export functionality with release/platform grouping
- Dashboard with release/platform statistics 