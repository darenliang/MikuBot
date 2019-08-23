"""This test file gets responses for various apis"""

import json
import os
import urllib.request
from random import randint

import cfscrape
import clashroyale
import praw
import requests
import wolframalpha
from clarifai.rest import ClarifaiApp
from googletrans import Translator
from pfaw import Fortnite
from pybooru import Danbooru

import bitly_api
from cogs.utility import SKETCHIFY_API_ENDPOINT
from framework import link_converter, youtube, cloc
from jikanpy import Jikan


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


def get_sketchify_response():
    data = {'long_url': "google.com"}
    response = requests.post(url=SKETCHIFY_API_ENDPOINT, data=data)
    sketchy = response.text
    return sketchy


def get_wolframalpha_response():
    wa = wolframalpha.Client(os.environ['WOLFRAM_ALPHA_KEY'])
    result = wa.query("1+1")
    answer = next(result.results).text
    return answer


def get_bitly_response():
    bitly = bitly_api.Connection(access_token=os.environ['BITLY_KEY'])
    response = bitly.shorten(uri=link_converter.convert("www.google.com"))
    return response['url']


def get_translate_response():
    translator = Translator()
    return translator.translate('안녕하세요.').text


def get_clarifai_response():
    clarifai = ClarifaiApp(api_key=os.environ['CLARIFAI_KEY'])
    clarifai_model = clarifai.public_models.general_model
    response = clarifai_model.predict_by_url(url="https://sample-videos.com/img/Sample-jpg-image-100kb.jpg")
    concepts = response['outputs'][0]['data']['concepts']
    return concepts[0]['name']


def get_reddit_response():
    reddit = praw.Reddit(client_id=os.environ['REDDIT_ID'], client_secret=os.environ['REDDIT_SECRET'],
                         user_agent=os.environ['REDDIT_USERAGENT'])

    def get_submission(subreddit):
        counter = 0
        submissions = [x for x in reddit.subreddit(subreddit).hot(limit=150) if not x.stickied and x.url]
        limit = randint(0, len(submissions) - 1)
        for submission in submissions:
            if counter == limit:
                return submission
            else:
                counter += 1

    submission = get_submission('showerthoughts')
    showerthought = submission.title
    if submission.selftext is not None:
        showerthought += "\n\n" + submission.selftext
    return showerthought


def get_booru_response():
    booru = Danbooru('danbooru')
    return booru.post_list(limit=1, tags="1girl", random=True, raw=True)[0]['file_url']


def get_youtube_response():
    embed, url_list = youtube.get_youtube_info("Hello")
    return url_list


def get_anime_response():
    jikan = Jikan()
    result = jikan.anime(1)
    return result['title']


def get_fortnite_response():
    fortnite = Fortnite(
        fortnite_token=os.environ['FORTNITE_TOKEN'],
        launcher_token=os.environ['LAUNCHER_TOKEN'],
        password=os.environ['FORTNITE_PASSWORD'],
        email=os.environ['FORTNITE_EMAIL'])
    status = fortnite.server_status()
    return status


def get_clashroyale_response():
    cr = clashroyale.royaleapi.Client(os.environ['CR_TOKEN'])
    player = cr.get_player("29L2YQCGG")
    return player[0]['name']


def get_dbl_response():
    scraper = cfscrape.create_scraper()
    return json.loads(scraper.get('https://discordbots.org/api').content)['hello']


def get_discord_response():
    with urllib.request.urlopen("https://srhpyqt94yxb.statuspage.io/api/v2/status.json") as url:
        data = json.loads(url.read().decode())
        return data['status']['description'] == 'All Systems Operational'


def get_cloc_response():
    data = cloc.get_code_count("darenliang/MikuBot")
    return data
