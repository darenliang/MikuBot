import html
import json
import os
import random
import urllib.request

import discord
from discord.ext import commands
from googletrans import Translator

from config import config
from framework import database, error_checking, themes
from jikanpy import Jikan


class Fun(commands.Cog):
    """Fun command group."""

    def __init__(self, client):
        self.client = client
        self.translate = Translator()
        self.jikan = Jikan()

    @commands.command(name='kaomoji', aliases=['emoji', 'emoticon', 'lenny'])
    async def kaomoji(self, ctx):
        """Return a random kaomoji."""
        await ctx.send(config.lenny[random.randint(0, 108)])

    @commands.command(name='trivia', aliases=[])
    async def trivia(self, ctx, num=None):
        """Get an anime themed trivia question.

        Parameters
        ------------
        num: int [Optional]
            If the a number choice is not specified, a trivia question will be given to you.
            If a number is specified, it will check if it is the right answer
        """
        # uses questions from opentdb
        if not num:
            with urllib.request.urlopen("https://opentdb.com/api.php?amount=1&category=31&type=multiple") as url:
                data = json.loads(url.read().decode())
            answers = [[1, data["results"][0]["correct_answer"]],
                       [0, data["results"][0]["incorrect_answers"][0]],
                       [0, data["results"][0]["incorrect_answers"][1]],
                       [0, data["results"][0]["incorrect_answers"][2]]]
            random.shuffle(answers)
            embed = discord.Embed(
                color=config.embed_color,
                title='Anime trivia question',
                description=html.unescape(data["results"][0]["question"]) + "\n" + '1. ' + html.unescape(
                    answers[0][1]) + "\n" + '2. ' + html.unescape(answers[1][1]) + "\n" + '3. ' + html.unescape(
                    answers[2][1]) + "\n" + '4. ' + html.unescape(answers[3][1]),
            )
            search = database.channel_update(ctx.channel.id)
            database.server_data[search]['trivia_answers'] = answers
            database.server_data[search]['trivia_search'] = False

            await ctx.send(embed=embed)
        else:
            search = database.channel_update(ctx.channel.id)
            if error_checking.is_int(num) and 1 <= int(num) <= 4 and not database.server_data[search]['trivia_search']:
                choice = int(num)
                database.server_data[search]['trivia_search'] = True
                retrieve = database.server_data[search]['trivia_answers']
                if retrieve[choice - 1][0] == 1:
                    return await ctx.send('You are correct!')
                else:
                    message = 'You are incorrect. The correct answer is: '
                    for answer in retrieve:
                        if answer[0] == 1:
                            message += html.unescape(answer[1])
                            break
                    return await ctx.send(message)
            elif database.server_data[search]['trivia_search']:
                return await ctx.send("You haven't called out a trivia question on this channel.")
            elif error_checking.is_int(num):
                return await ctx.send('Choice out of range.')
            else:
                return await ctx.send('Enter a valid input.')

    @commands.command(name='8ball', aliases=['8b', 'eightball'])
    async def eightball(self, ctx, *, question):
        """Return an 8ball response.

        Parameters
        ------------
        question: str [Required]
            The question asked.

        Please note that a question string is not necessary, but the bot enforces it.
        """
        choices = ['It is certain.', 'Outlook good.', 'You may rely on it.', 'Ask again later',
                   'Concentrate and ask again.', 'Reply hazy, try again.', 'My reply is no', 'My sources say no.']
        await ctx.send(choices[random.randint(0, 7)])

    @commands.command(name='musicquiz', aliases=['mq', 'quiz'])
    async def musicquiz(self, ctx, *, answer=None):
        """Get an anime music quiz

        Parameters
        ------------
        answer: str [Optional]
            If the an answer is not specified, a music quiz will be given to you.
            If an answer is specified, it will check if it is the right answer
            If the answer is the string "giveup", the answer will be given.
        """
        if not answer:
            source, anime, url = themes.get_theme()

            search = database.channel_update(ctx.channel.id)
            database.server_data[search]['quiz_answers'] = (source, anime)
            database.server_data[search]['quiz_search'] = False

            video_hash = themes.download_url(url)
            music_hash = themes.convert_video(video_hash)
            os.remove(video_hash + '.webm')
            song = themes.get_file(music_hash + '.mp3')
            await ctx.send(file=song)
            os.remove(music_hash + '.mp3')
        else:
            search = database.channel_update(ctx.channel.id)
            if not database.server_data[search]['quiz_search']:
                retrieve = database.server_data[search]['quiz_answers']
                if answer.lower() == 'giveup':
                    database.server_data[search]['quiz_search'] = True
                    return await ctx.send('The answer is: {0}'.format(retrieve[0]))
                else:
                    if themes.validation(self.jikan.search('anime', answer)['results'], retrieve[1]):
                        database.server_data[search]['quiz_search'] = True
                        return await ctx.send('You are correct! The answer is {0}'.format(retrieve[0]))
                    else:
                        return await ctx.send('You are incorrect. Please try again.')
            else:
                return await ctx.send("You haven't asked a question yet.")


def setup(client):
    client.add_cog(Fun(client))