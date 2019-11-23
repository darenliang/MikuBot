"""This framework file contains api bindings for ow-api.com"""

import json
from urllib.request import Request, urlopen

OW_API = 'https://ow-api.com/v1/stats/pc/us/{0}/complete'


def get_overwatch_data(username):
    """Request overwatch data"""
    username = username.replace('#', '-')
    req = Request(OW_API.format(username), headers={'User-Agent': 'Mozilla/5.0'})
    data = json.loads(urlopen(req).read().decode())
    if 'error' in data:
        return None, False
    return data, True


def get_seconds(time):
    """Get seconds from time"""
    return sum(int(x) * 60 ** i for i, x in enumerate(reversed(time.split(":"))))
