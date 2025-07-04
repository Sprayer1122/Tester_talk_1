import requests
import random

API_URL = 'http://localhost:5000/api/issues'

RELEASES = ['251', '261', '231']
PLATFORMS = ['lnx86', 'lr', 'rhel7.6', 'centos7.4', 'sles12sp3', 'lop']
PLATFORM_DISPLAY = {
    'lnx86': 'Linux',
    'lr': 'LR',
    'rhel7.6': 'RHEL7.6',
    'centos7.4': 'CENTOS7.4',
    'sles12sp3': 'SLES12SP3',
    'lop': 'LOP',
}
BUILDS = ['Weekly', 'Daily', 'Daily Plus']
TARGETS = {
    '251': [
        '25.11-d065_1_Jun23',
        '25.11-d062_1_Jun_19',
        '25.11-d057_1_Jun_12',
        '25.11-d049_1_Jun_05'
    ],
    '261': [
        '26.10-d075_1_May_08'
    ],
    '231': [
        '23.13-d014_1_Oct_23',
        '23.13-d012_1_Oct_15'
    ]
}
SEVERITIES = ['Low', 'Medium', 'High', 'Critical']
REPORTERS = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy']
TAGS = ['diagnostics', 'parallel', 'compression', 'sanity', 'customer', 'flow', 'atpg', 'ijtag', 'cellaware', 'delay', 'ram', 'scan', 'misc']

random.seed(42)

def random_path(release, platform):
    base = f"/lan/fed/etpv5/release/{release}/{platform}/etautotest"
    subdirs = [
        'customer/ccr', 'diagnostics/ELASTIC_COMPRESSION', 'flow', 'eta/IJTAG', 'ett/ram_sequential',
        'misc/License_Testing', 'gui/TCL_Interface', 'diagnostics/scan_chain_grouping', 'ett/small_delay'
    ]
    subdir = random.choice(subdirs)
    testcase = f"testcase_{random.randint(1000,9999)}"
    return f"{base}/{subdir}/{testcase}"

for i in range(1, 101):
    release = random.choice(RELEASES)
    platform = random.choice(PLATFORMS)
    build = random.choice(BUILDS)
    target = random.choice(TARGETS[release])
    path = random_path(release, platform)
    data = {
        'testcase_title': f"Sample Testcase {i}",
        'testcase_path': path,
        'severity': random.choice(SEVERITIES),
        'build': build,
        'target': target,
        'description': f"Randomly generated testcase for {platform} on release {release}.",
        'additional_comments': f"Random comment {random.randint(1000,9999)}.",
        'reporter_name': random.choice(REPORTERS),
        'tags': ','.join(random.sample(TAGS, k=random.randint(1, 3)))
    }
    try:
        resp = requests.post(API_URL, json=data)
        if resp.status_code == 201:
            print(f"[{i}/100] Added: {data['testcase_title']} | {release} | {platform} | {build} | {target}")
        else:
            print(f"[{i}/100] Failed: {data['testcase_title']} | Status: {resp.status_code} | {resp.text}")
    except Exception as e:
        print(f"[{i}/100] Exception: {e}") 