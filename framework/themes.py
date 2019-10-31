"""This framework file contains a scraper and media downloader for openings.moe"""

import random
import subprocess

import discord
import requests
from bs4 import BeautifulSoup
from fuzzywuzzy import fuzz


def get_hash(bits=96):
    """Return random hash"""
    assert bits % 8 == 0
    required_length = bits / 8 * 2
    s = hex(random.getrandbits(bits)).lstrip('0x').rstrip('L')
    if len(s) < required_length:
        return hash(bits)
    else:
        return s


def get_theme():
    """Get anime theme data"""
    page_response = requests.get('https://openings.moe', timeout=5)
    page_content = BeautifulSoup(page_response.content, "lxml")
    anime = page_content.find("p", id="source").text
    source = anime[5:]
    anime = source
    if source[-1] == ')':
        anime = source[:anime.rfind('(') - 1]
    url = page_content.find("meta", property="og:video")['content']
    return source, anime, url


def download_url(url):
    """Download file from url"""
    hash = str(get_hash())
    filename = hash + ".webm"
    r = requests.get(url, stream=True)
    with open(filename, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
    f.close()
    return str(hash)


def convert_video(filename):
    """Convert video"""
    randhash = str(get_hash())
    command = "ffmpeg -i {0}.webm -vn -ab 128k -ar 44100 -y {1}.mp3".format(filename, randhash)
    subprocess.call(command, shell=True)
    return randhash


def get_file(filename):
    """Prepare file for uploading"""
    return discord.File(filename)


def validation(anime_list, answer):
    """Validate answer"""
    for i in range(5):
        if fuzz.token_sort_ratio(anime_list[i]['title'], answer) > 80:
            return True
    return False
