"""This framework file contains api bindings for ow-api.com"""

import json
import urllib.request


def get_overwatch_data(username):
    """Request overwatch data"""
    username = username.replace('#', '-')
    with urllib.request.urlopen('https://ow-api.com/v1/stats/pc/us/{0}/complete'.format(username)) as url:
        data = json.loads(url.read().decode())
        if 'error' in data:
            return None, False
        return data, True


def get_seconds(time):
    """Get seconds from time"""
    return sum(int(x) * 60 ** i for i, x in enumerate(reversed(time.split(":"))))
