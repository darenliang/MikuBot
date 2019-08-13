import json
import urllib.request

import requests


def get_trivia_response():
    with urllib.request.urlopen("https://opentdb.com/api.php?amount=1&category=31&type=multiple") as url:
        data = json.loads(url.read().decode())
        return data['response_code']


def get_theme_response():
    page_response = requests.get('https://openings.moe', timeout=5)
    return page_response.status_code


def get_overwatch_response():
    with urllib.request.urlopen("https://ow-api.com/v1/stats/pc/us/SirPlumPits-1892/complete") as url:
        data = json.loads(url.read().decode())
        if 'private' in data:
            return 0
        else:
            return 1
