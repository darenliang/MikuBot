"""This cog file contains the bot's utility commands"""

import logging
import os
from math import floor

import discord
import requests
import wolframalpha
from clarifai.rest import ClarifaiApp
from discord.ext import commands
from googletrans import Translator

import bitly_api
from config import config
from framework import google_trans

# sketchify endpoint
SKETCHIFY_API_ENDPOINT = "http://verylegit.link/sketchify"

# set logger
log = logging.getLogger(__name__)


class Utility(commands.Cog):
    """Utility command group."""

    def __init__(self, client):
        self.client = client

        # sets up clarifai instance
        clarifai = ClarifaiApp(api_key=os.environ['CLARIFAI_KEY'])
        self.clarifai_model = clarifai.public_models.general_model

        # creates wolfram alpha instance
        self.wolfram = wolframalpha.Client(os.environ['WOLFRAM_ALPHA_KEY'])

        # sets up translator
        self.translate = Translator()

        # sets url shortener
        self.bitly = bitly_api.Connection(access_token=os.environ['BITLY_KEY'])

    @commands.command(name='ask', aliases=['question', 'wa', 'wolfram', 'wolfram_alpha'])
    async def ask(self, ctx, *, query):
        """Use Wolfram|Alpha to get answers about literally anything.

        Parameters
        ------------
        query: str [Required]
            Text query.
        """
        try:
            result = self.wolfram.query(query)
            answer = next(result.results).text
        except:
            log.warning('ask: Cannot parse result')
            return await ctx.send('Cannot parse result.')
        await ctx.send(answer)

    @commands.command(name='what', aliases=['clarifai', 'identify'])
    async def what(self, ctx, url):
        """Use Clarifai to determine the contents of an image url.

        Parameters
        ------------
        url: str [Required]
            Image URL
        """
        response = self.clarifai_model.predict_by_url(url=url)
        concepts = response['outputs'][0]['data']['concepts']

        answers = "Here's what I think it is:\n```"
        for i in range(10):
            answers += concepts[i]['name'] + ': ' + str(floor(concepts[i]['value'] * 100) / 100) + '\n'
        answers = answers.rstrip('\n') + '```'

        await ctx.send(answers)

    @commands.command(name='translate', aliases=['google_trans', 'gt', 'trans'])
    async def translate(self, ctx, *, arg):
        """Translate text to literally any language.

        Parameters
        ------------
        arg: str [Required]
            Formats:
                <text>
                    Translates <text> to English.
                <text> to <destination>
                    Translates <text> to <destination> language.
                <text> to <destination> from <source>
                    Translates <text> to <destination> language from <source> language.

        Examples:
            !translate bonjour -> hello
            !translate bonjour to english -> hello
            !translate bonjour to english from french -> hello
        """
        text = arg.lower()
        arg2 = None
        arg3 = None
        if ' to ' in text:
            to_index = text.rfind(' to ')
            arg1 = arg[:to_index].strip()
            if ' from ' in text[to_index + 4:]:
                from_index = text.rfind(' from ')
                arg2 = arg[to_index + 4:from_index].strip()
                arg3 = arg[from_index + 6:].strip()
            else:
                arg2 = arg[to_index + 4:].strip()
        else:
            arg1 = arg.strip()
        try:
            if arg2 is not None:
                arg2 = google_trans.get_language_code(arg2)
            if arg3 is not None:
                arg3 = google_trans.get_language_code(arg3)
            translation = google_trans.get_translation(self.translate, arg1, arg2, arg3)
            embed = discord.Embed(
                color=config.embed_color,
                title='{0} to {1}'.format(google_trans.get_language_name(translation.src).title(),
                                          google_trans.get_language_name(translation.dest).title()))
            embed.add_field(name='Original Text',
                            value=arg1,
                            inline=False)
            embed.add_field(name='Translated Text',
                            value=translation.text,
                            inline=False)
            if translation.pronunciation == translation.text:
                pronun = 'Not Applicable'
            elif translation.pronunciation is None:
                pronun = translation.extra_data['translation'][1][2]
            else:
                pronun = translation.pronunciation
            embed.add_field(name='Pronunciation',
                            value=pronun,
                            inline=False)
            await ctx.send(embed=embed)
        except:
            log.warning('translate: Error encountered')
            await ctx.send('Cannot get translation from text.')

    @commands.command(name='shorten', aliases=['short'])
    async def shorten(self, ctx, *, link):
        """Return a shortened link.

        Parameters
        ------------
        link: str [Required]
            URL you want to shorten.
        """
        try:
            response = self.bitly.shorten(uri=link)
        except:
            return await ctx.send('Enter a valid link URL.')
        await ctx.send('Here is the shorted link: ' + response['url'])

    @commands.command(name='sketchy', aliases=['sketch', 'sketchify'])
    async def sketchy(self, ctx, *, link):
        """Return a sketchy link.

        Parameters
        ------------
        link: str [Required]
            URL you want to sketchify.
        """
        try:
            data = {'long_url': link}
            response = requests.post(url=SKETCHIFY_API_ENDPOINT, data=data)
            sketchy = response.text
        except:
            return await ctx.send('Cannot sketchify the link you provided.')
        await ctx.send('Here is your sketchy link: ' + sketchy)


def setup(client):
    client.add_cog(Utility(client))
