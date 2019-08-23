import json
import urllib.request


def get_code_count(repo):
    with urllib.request.urlopen("https://api.codetabs.com/v1/loc?github=" + repo) as url:
        return json.loads(url.read().decode())
