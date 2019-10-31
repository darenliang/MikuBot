"""This framework file contains functions to help play youtube music"""

import html
import os

import discord
import googleapiclient.discovery

from config import config


def get_youtube_response(query):
    """Get youtube search results"""
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    api_service_name = "youtube"
    api_version = "v3"
    developer_key = os.environ['YOUTUBE_KEY']

    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey=developer_key, cache_discovery=False)

    request = youtube.search().list(
        part="snippet",
        maxResults=5,
        q=query,
        type="video"
    )
    return request.execute()


def get_youtube_info(query):
    """Generate embed of youtube results from query"""
    response = get_youtube_response(query)
    counter = 1
    video_str = ''
    url_list = []

    for video in response['items']:
        url_list.append(video['id']['videoId'])
        video_str += str(counter) + '. ' + html.unescape(video['snippet']['title']) + '\n'
        counter += 1

    video_str = video_str.rstrip('\n')
    if not video_str:
        video_str = 'No search results'

    embed = discord.Embed(
        color=config.embed_color,
        title='Youtube search results for ' + query,
        description=video_str)

    return embed, url_list
