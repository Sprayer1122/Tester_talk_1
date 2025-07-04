# Build and Target Features

## Overview

The test case review system now includes two new user-input fields: **Build** and **Target**. These fields allow users to specify build type and target version information when creating test case reviews.

## Build Field

### Description
The Build field allows users to specify the type of build being tested.

### Options
- **Weekly** - Weekly build releases
- **Daily** - Daily build releases  
- **Daily Plus** - Daily Plus build releases

### Usage
- Users select from a dropdown menu during issue creation
- This field is optional and can be left empty
- The field is available for all test case reviews

## Target Field

### Description
The Target field allows users to specify the specific build target version based on the extracted release.

### Release-Specific Options

#### Release 251
- 25.11-d065_1_Jun23
- 25.11-d062_1_Jun_19
- 25.11-d057_1_Jun_12
- 25.11-d049_1_Jun_05

#### Release 261
- 26.10-d075_1_May_08

#### Release 231
- 23.13-d014_1_Oct_23
- 23.13-d012_1_Oct_15

### Usage
- Target options are dynamically populated based on the release extracted from the test case path
- The field is disabled until a valid test case path is entered
- Users can only select targets that correspond to the extracted release
- This field is optional and can be left empty

## Implementation Details

### Database Schema
```sql
-- New columns added to issues table
ALTER TABLE issues ADD COLUMN build VARCHAR(20) NULL;
ALTER TABLE issues ADD COLUMN target VARCHAR(100) NULL;
```

### Backend Changes

#### Model Updates (`backend/models.py`)
- Added `build` and `target` fields to Issue model
- Added helper methods:
  - `get_build_options()` - Returns all available build options
  - `get_target_options(release)` - Returns target options for a specific release

#### API Endpoints (`backend/routes.py`)
- Updated create and update issue routes to handle new fields
- Added new endpoints:
  - `GET /api/builds` - Returns all build options
  - `GET /api/targets/<release>` - Returns target options for a release
- Updated filtering in `GET /api/issues` to support build and target filters
- Updated Elasticsearch indexing to include new fields

### Frontend Changes

#### Create Issue Form (`frontend/src/pages/CreateIssue.js`)
- Added Build dropdown with all available options
- Added Target dropdown with release-specific options
- Target dropdown is disabled until a valid test case path is entered
- Target options are dynamically populated based on extracted release

#### Issue List (`frontend/src/pages/IssueList.js`)
- Added Build and Target filter dropdowns
- Updated issue cards to display build and target information
- Added filtering functionality for both fields

#### Issue Detail (`frontend/src/pages/IssueDetail.js`)
- Added Build and Target fields to the issue details section
- Displays the values in a clean, organized layout

#### API Service (`frontend/src/services/api.js`)
- Updated `getIssues()` function to include build and target parameters
- Added `getBuilds()` and `getTargets(release)` functions

## User Experience

### Creating Issues
1. User enters test case path
2. System extracts release and platform information
3. Build dropdown shows all available options
4. Target dropdown is enabled and populated with release-specific options
5. User can select appropriate build and target values
6. Both fields are optional

### Filtering Issues
1. Users can filter by build type (Weekly, Daily, Daily Plus)
2. Users can filter by specific target versions
3. Filters work in combination with existing filters (status, severity, release, platform)
4. Filter options show all available values regardless of current data

### Viewing Issues
1. Build and target information is displayed in issue cards
2. Detailed view shows build and target in the issue details section
3. Information is clearly labeled and easy to read

## Testing

### Test Script
A test script (`test_build_target.py`) is provided to verify functionality:
- Tests API endpoints for build and target options
- Tests issue creation with build and target fields
- Tests filtering functionality
- Provides detailed output for debugging

### Manual Testing
1. Create a new issue with different test case paths
2. Verify target options change based on extracted release
3. Test filtering by build and target
4. Verify data persistence and display

## Migration

### Database Migration
The migration script `database/migrate_build_target.sql` adds the necessary columns:
```sql
ALTER TABLE issues ADD COLUMN build VARCHAR(20) NULL;
ALTER TABLE issues ADD COLUMN target VARCHAR(100) NULL;
CREATE INDEX idx_issues_build ON issues(build);
CREATE INDEX idx_issues_target ON issues(target);
```

### Elasticsearch Mapping
The Elasticsearch index mapping is updated to include the new fields:
```json
{
  "build": {"type": "keyword"},
  "target": {"type": "keyword"}
}
```

## Future Enhancements

### Potential Improvements
1. **Dynamic Target Management** - Allow admins to add/remove target options
2. **Build History** - Track build changes over time
3. **Target Validation** - Validate target versions against actual releases
4. **Bulk Operations** - Update build/target for multiple issues
5. **Reporting** - Generate reports based on build and target data

### Configuration
Consider making build and target options configurable through:
- Environment variables
- Configuration files
- Admin interface
- Database configuration tables

## Troubleshooting

### Common Issues
1. **Target dropdown not populated** - Check if test case path format is correct
2. **Build options not showing** - Verify API endpoint is working
3. **Filtering not working** - Check database indexes are created
4. **Data not saving** - Verify form data is being sent correctly

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoints are responding correctly
3. Check database schema has new columns
4. Test with the provided test script
 