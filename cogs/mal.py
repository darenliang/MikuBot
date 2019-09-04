"""This cog file contains the bot's MyAnimeList commands"""

import datetime
import logging
import random

import discord
from discord.ext import commands

from config import config
from framework import database, error_checking
from jikanpy import Jikan

# set logger
log = logging.getLogger(__name__)


class Mal(commands.Cog):
    """MAL command group."""

    def __init__(self, client):
        self.client = client

        # starts jikan instance
        self.jikan = Jikan()

    def create_selection(self, type, query):
        """Return list of results based on a query."""
        results_str = ""
        list_ids = []
        search_result = self.jikan.search(type, query)
        results = search_result['results']
        for i in range(5):
            results_str += "{0}. {1}\n".format((i + 1), results[i]['title'])
            list_ids.append(results[i]['mal_id'])
        results_str = results_str.rstrip('\n')
        embed = discord.Embed(
            color=config.embed_color,
            title='Search results for ' + query,
            description=results_str)
        return embed, list_ids

    def get_anime(self, id):
        """Generate embed for anime"""
        result = self.jikan.anime(id)

        # title
        title = result['title']
        title_english = result['title_english']
        if (title_english is None) or title == title_english:
            final_title = title
        else:
            final_title = title + ' (' + title_english + ')'

        # episodes
        if result['episodes'] is None:
            episodes = "Unknown"
        else:
            episodes = result['episodes']

        # genres
        genres = ""
        for genre in result['genres']:
            genres += genre['name'] + ", "
        genres = genres.rstrip(", ")

        # studios
        studios = ""
        if not result['studios']:
            studios = "Not available"
        else:
            for studio in result['studios']:
                studios += studio['name'] + ", "
        studios = studios.rstrip(", ")

        # score
        if result['score'] is None:
            score = "Not available"
        else:
            score = result['score']

        # ranked
        if result['rank'] is None:
            ranked = "Not available"
        else:
            ranked = result['rank']

        embed = discord.Embed(
            color=config.embed_color,
            title=final_title,
            description=result['synopsis'])
        embed.set_image(url=result['image_url'])
        embed.add_field(name='Type', value=result['type'], inline=True)
        embed.add_field(name='Episodes', value=episodes, inline=True)
        embed.add_field(name='Status', value=result['status'], inline=True)
        embed.add_field(name='Aired', value=result['aired']['string'], inline=False)
        embed.add_field(name='Genres', value=genres, inline=False)
        embed.add_field(name='Studios', value=studios, inline=True)
        embed.add_field(name='Source', value=result['source'], inline=True)
        embed.add_field(name='Score', value=score, inline=True)
        embed.add_field(name='Ranked', value=ranked, inline=True)
        embed.add_field(name='Popularity', value=result['popularity'], inline=True)
        embed.add_field(name='Members', value=result['members'], inline=True)
        return embed

    def get_manga(self, id):
        """Generate embed for manga"""
        result = self.jikan.manga(id)

        # title
        title = result['title']
        title_english = result['title_english']
        if (title_english is None) or title == title_english:
            final_title = title
        else:
            final_title = title + ' (' + title_english + ')'

        # volumes
        if result['volumes'] is None:
            volumes = "Unknown"
        else:
            volumes = result['volumes']

        # chapters
        if result['chapters'] is None:
            chapters = "Unknown"
        else:
            chapters = result['chapters']

        # genres
        genres = ""
        for genre in result['genres']:
            genres += genre['name'] + ", "
        genres = genres.rstrip(", ")

        # authors
        authors = ""
        for author in result['authors']:
            authors += author['name'] + ", "
        authors = authors.rstrip(", ")

        # serializations
        serializations = ""
        if not result['serializations']:
            serializations = "Not available"
        else:
            for serialization in result['serializations']:
                serializations += serialization['name'] + ", "
        serializations = serializations.rstrip(", ")

        # score
        if result['score'] is None:
            score = "Not available"
        else:
            score = result['score']

        # ranked
        if result['rank'] is None:
            ranked = "Not available"
        else:
            ranked = result['rank']

        embed = discord.Embed(
            color=config.embed_color,
            title=final_title,
            description=result['synopsis'])
        embed.set_image(url=result['image_url'])
        embed.add_field(name='Type', value=result['type'], inline=True)
        embed.add_field(name='Volumes', value=volumes, inline=True)
        embed.add_field(name='Chapters', value=chapters, inline=True)
        embed.add_field(name='Status', value=result['status'], inline=True)
        embed.add_field(name='Published', value=result['published']['string'], inline=False)
        embed.add_field(name='Genres', value=genres, inline=False)
        embed.add_field(name='Authors', value=authors, inline=False)
        embed.add_field(name='Serializations', value=serializations, inline=True)
        embed.add_field(name='Score', value=score, inline=True)
        embed.add_field(name='Ranked', value=ranked, inline=True)
        embed.add_field(name='Popularity', value=result['popularity'], inline=True)
        embed.add_field(name='Members', value=result['members'], inline=True)
        return embed

    def get_user(self, username):
        """Generate embed for user on MAL"""
        result = self.jikan.user(username=username)
        embed = discord.Embed(
            color=config.embed_color,
            title=result["username"] + "'s profile"
        )
        if result["image_url"] is not None:
            embed.set_image(url=result["image_url"])
        embed.add_field(name='Gender', value=result["gender"], inline=True)
        embed.add_field(name='Location', value=result["location"], inline=True)
        embed.add_field(name='Last Online', value=result["last_online"][:10], inline=False)
        embed.add_field(name='Birthday', value=result["birthday"], inline=False)
        embed.add_field(name='Joined', value=result["joined"][:10], inline=False)
        embed.add_field(name='Days Watched', value=result["anime_stats"]["days_watched"], inline=True)
        embed.add_field(name='Mean Score', value=result["anime_stats"]["mean_score"], inline=True)
        embed.add_field(name='Watching', value=result["anime_stats"]["watching"], inline=True)
        embed.add_field(name='Completed', value=result["anime_stats"]["completed"], inline=True)
        embed.add_field(name='On Hold', value=result["anime_stats"]["on_hold"], inline=True)
        embed.add_field(name='Dropped', value=result["anime_stats"]["dropped"], inline=True)
        embed.add_field(name='Plan to Watch', value=result["anime_stats"]["plan_to_watch"], inline=True)
        embed.add_field(name='Rewatched', value=result["anime_stats"]["rewatched"], inline=True)
        embed.add_field(
            name='Episodes Watched', value=result["anime_stats"]["episodes_watched"], inline=True)
        embed.add_field(name='Total Entries', value=result["anime_stats"]["total_entries"], inline=False)
        embed.add_field(name='Profile URL', value=result["url"], inline=False)
        return embed

    def lister(self, results, title):
        """Generate embed for list of results"""
        counter = 1
        result_str = ''
        for result in results:
            result_str += str(counter) + '. ' + result['title'] + '\n'
            counter += 1
        result_str = result_str.rstrip('\n')
        embed = discord.Embed(
            color=config.embed_color,
            title=title,
            description=result_str)
        return embed

    @commands.command(name='anime', aliases=['mal_anime'])
    async def anime(self, ctx, *, arg):
        """Get info about an anime.

        Parameters
        ------------
        arg: str [Required]
            The anime query you want to search.

        Note that to select an option, you must give a valid integer in the selection range.
        """
        embed, list_ids = self.create_selection('anime', arg)
        message = await ctx.send(embed=embed)

        def check_int(message):
            return error_checking.is_int(message.content) and message.channel == ctx.channel and 1 <= int(
                message.content) <= 5

        selection = await self.client.wait_for('message', timeout=config.timeout, check=check_int)
        selection = int(selection.content)
        id = list_ids[selection - 1]
        embed = self.get_anime(id)
        await ctx.send(embed=embed)
        try:
            await message.delete()
        except discord.HTTPException:
            pass

    @commands.command(name='manga', aliases=['mal_manga'])
    async def manga(self, ctx, *, arg):
        """Get info about a manga.

        Parameters
        ------------
        arg: str [Required]
            The manga query you want to search.

        Note that to select an option, you must give a valid integer in the selection range.
        """
        embed, list_ids = self.create_selection('manga', arg)
        message = await ctx.send(embed=embed)

        def check_int(message):
            return error_checking.is_int(message.content) and message.channel == ctx.channel and 1 <= int(
                message.content) <= 5

        selection = await self.client.wait_for('message', timeout=config.timeout, check=check_int)
        selection = int(selection.content)
        id = list_ids[selection - 1]
        embed = self.get_manga(id)
        await ctx.send(embed=embed)
        try:
            await message.delete()
        except discord.HTTPException:
            pass

    @commands.command(name='user', aliases=['mal_user'])
    async def user(self, ctx, user):
        """Get info about a user.

        Parameters
        ------------
        user: str [Required]
            User's MAL username.
        """
        try:
            embed = self.get_user(user)
        except Exception as e:
            log.warning('user: Error')
            log.error(e)
            return await ctx.send('Cannot retreive user info.')
        await ctx.send(embed=embed)

    @commands.command(name='schedule', aliases=['mal_schedule'])
    async def schedule(self, ctx, day=None):
        """Return a list of anime airing a certain day.

        Parameters
        ------------
        day: str [Optional]
            If day is not specified, the day will be today.
            Valid days: monday, tuesday, wednesday, thursday, friday, saturday, sunday
        """
        if day is None:
            datetime.datetime.today().weekday()
            day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][
                datetime.datetime.today().weekday()]
        else:
            day = day.lower()
        if day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
            embed = self.lister(self.jikan.schedule(day)[day], day.capitalize() + "'s anime schedule")
            return await ctx.send(embed=embed)
        else:
            return await ctx.send('Enter a valid day.')

    @commands.command(name='airing', aliases=['mal_airing'])
    async def airing(self, ctx):
        """Return a list of anime currently airing."""
        embed = self.lister(self.jikan.top(type='anime', page=1, subtype='airing')['top'][:15], "Top airing anime")
        await ctx.send(embed=embed)

    @commands.command(name='upcoming', aliases=['mal_upcoming'])
    async def upcoming(self, ctx):
        """Return a list of upcoming anime."""
        embed = self.lister(self.jikan.top(type='anime', page=1, subtype='upcoming')['top'][:15], "Top upcoming anime")
        await ctx.send(embed=embed)

    @commands.command(name='season', aliases=['mal_season'])
    async def season(self, ctx, season, year):
        """Return a list of anime aired during the season.

        Parameters
        ------------
        season: str [Required]
            Season argument
            Valid seasons: spring, summer, fall, winter

        year: int [Required]
            Year argument
        """
        if error_checking.is_int(year):
            year = int(year)
        try:
            embed = self.lister(self.jikan.season(year=year, season=season.lower())['anime'][:15],
                                "{0} {1} anime".format(season.capitalize(), year))
        except Exception as e:
            log.warning('season: Error')
            log.error(e)
            return await ctx.send('Cannot get specified season.')
        await ctx.send(embed=embed)

    @commands.command(name='recommend', aliases=['mal_recommend'])
    async def recommend(self, ctx):
        """Return a pseudo-random anime.
        Based on a weighted random distribution.
        """
        rank = random.randint(1, 63750)
        page = 0
        while True:
            if rank - (50 - page) * 50 < 0:
                index = rank // (50 - page)
                break
            rank -= (50 - page) * 50
            page += 1
        id = self.jikan.top(type='anime', page=page + 1)['top'][index]['mal_id']
        embed = self.get_anime(id)
        await ctx.send(embed=embed)


def setup(client):
    client.add_cog(Mal(client))
