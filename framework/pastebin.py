"""This framework file contains functions to request text from pastebin"""

import urllib.request


def get_url_data(url):
    """Request url string data"""
    with urllib.request.urlopen(url) as resp:
        return resp.read().decode('unicode_escape')
