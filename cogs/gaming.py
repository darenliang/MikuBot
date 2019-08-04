import logging
import math
import os

import clashroyale
import discord
from discord.ext import commands
from pfaw import Fortnite, Platform

from config import config
from framework import overwatch

# set logger
log = logging.getLogger(__name__)


class Gaming(commands.Cog):
    """Gaming command group."""

    def __init__(self, client):
        self.client = client
        self.fortnite = Fortnite(
            fortnite_token=os.environ['FORTNITE_TOKEN'],
            launcher_token=os.environ['LAUNCHER_TOKEN'],
            password=os.environ['FORTNITE_PASSWORD'],
            email=os.environ['FORTNITE_EMAIL'])
        self.clashroyale = clashroyale.royaleapi.Client(os.environ['CR_TOKEN'])

    @commands.command(name='overwatch', aliases=['ow'])
    async def overwatch(self, ctx, *, battletag):
        """Get Overwatch profile info.

        Note:
            Only for NA region PC platform and profile must be set on public.

        Parameters
        ------------
        battletag: str [Required]
            Your Overwatch BattleTag in the format ____#____.
        """
        data, status = overwatch.get_overwatch_data(battletag)
        if status and not data['private']:
            embed = discord.Embed(color=config.embed_color, title="{0}'s Overwatch Stats".format(battletag))
            if data['rating'] == 0:
                sr = 'Not available'
            else:
                sr = str(data['rating'])
            embed.add_field(name='Skill Rating',
                            value=sr,
                            inline=True)
            embed.add_field(name='Level',
                            value=str((data['prestige'] * 100) + data['level']),
                            inline=True)
            embed.add_field(name='Games Won',
                            value=str(data['gamesWon']),
                            inline=True)
            if data['competitiveStats']['games']['played'] != 0:
                winrate = str(math.ceil(
                    (data['competitiveStats']['games']['won'] / data['competitiveStats']['games'][
                        'played']) * 100)) + ' %'
            else:
                winrate = 'Not available'
            embed.add_field(name='Competitive Winrate',
                            value=winrate,
                            inline=True)
            heroes = data['competitiveStats']['topHeroes']
            max_time = -1
            max_hero = None
            for hero in heroes:
                curr_time = overwatch.get_seconds(heroes[hero]['timePlayed'])
                if curr_time > max_time:
                    max_time = curr_time
                    max_hero = hero
            embed.add_field(name='Most Played Hero',
                            value=max_hero.capitalize(),
                            inline=True)
            embed.add_field(name='Endorsement Level',
                            value=str(data['endorsement']),
                            inline=True)
            embed.set_thumbnail(url=data['ratingIcon'])
            await ctx.send(embed=embed)
        elif data['private']:
            await ctx.send('Cannot retrieve player information since player has a private profile.')
        else:
            log.warning('overwatch: Player not found')
            await ctx.send('Player cannot be found. Are you sure you entered the right battletag? (Case sensitive)')

    @commands.command(name='fortnite', aliases=['fonibr'])
    async def fortnite(self, ctx, *, gamertag):
        """Get Fortnite stats.

        Note:
            Only for PC platform.

        Parameters
        ------------
        gamertag: str [Required]
            Your Fortnite gamertag.
        """
        try:
            player = self.fortnite.player(username=gamertag)
            stats = self.fortnite.battle_royale_stats(username=gamertag, platform=Platform.pc)
            status = self.fortnite.server_status()

            embed = discord.Embed(color=config.embed_color, title="{0}'s Fortnite Stats".format(player.name))
            embed.add_field(name='Solo Wins',
                            value=str(stats.solo.wins),
                            inline=True)
            embed.add_field(name='Duo Wins',
                            value=str(stats.duo.wins),
                            inline=True)
            embed.add_field(name='Squad Wins',
                            value=str(stats.squad.wins),
                            inline=True)
            embed.add_field(name='Lifetime Kills',
                            value=str(stats.all.kills),
                            inline=True)
            embed.add_field(name='Total Score',
                            value=str(stats.all.score),
                            inline=True)
            if status:
                curr_status = 'Servers are up.'
            else:
                curr_status = 'Servers are down.'
            embed.add_field(name='Fortnite Status',
                            value=curr_status,
                            inline=True)
            embed.set_thumbnail(url='https://github.com/darenliang/MikuBot/raw/master/static_files/fortnite.png')
            await ctx.send(embed=embed)
        except:
            log.warning('fortnite: Player not found')
            await ctx.send('Player cannot be found.')

    @commands.command(name='clashroyale', aliases=['cr'])
    async def clashroyale(self, ctx, *, id):
        """Get Clash Royale stats.

        Parameters
        ------------
        id: str [Required]
            Your Clash Royale ID.
        """
        try:
            if id[0] == '#':
                id = id[1:]
            player = self.clashroyale.get_player(id)
            embed = discord.Embed(color=config.embed_color, title="{0}'s ClashRoyale Stats".format(player['name']))
            embed.add_field(name='Trophies',
                            value=str(player['trophies']),
                            inline=True)
            embed.add_field(name='Max Trophies',
                            value=str(player['stats']['maxTrophies']),
                            inline=True)
            embed.add_field(name='Level',
                            value=str(player['stats']['level']),
                            inline=True)
            if player['clan'] is None:
                clan = 'Not in a clan'
            else:
                clan = player['clan']
            embed.add_field(name='Clan Name',
                            value=clan,
                            inline=True)
            embed.add_field(name='Arena',
                            value=player['arena']['name'],
                            inline=True)
            embed.add_field(name='Total Matches Played',
                            value=str(player['games']['total']),
                            inline=True)
            embed.add_field(name='Challenges Max Wins',
                            value=str(player['stats']['challengeMaxWins']),
                            inline=True)
            embed.add_field(name='Challenge Cards Won',
                            value=str(player['stats']['challengeCardsWon']),
                            inline=True)
            embed.add_field(name='Total Win Rate',
                            value=str(math.ceil(
                                (player['games']['winsPercent'] + (player['games']['drawsPercent'] / 2)) * 100)) + ' %',
                            inline=True)
            embed.add_field(name='Favorite Card',
                            value=player['stats']['favoriteCard']['name'],
                            inline=True)
            embed.set_thumbnail(url='https://github.com/darenliang/MikuBot/raw/master/static_files/clashroyale.png')
            await ctx.send(embed=embed)
        except:
            log.warning('clashroyale: Player not found')
            await ctx.send('Player cannot be found.')


def setup(client):
    client.add_cog(Gaming(client))
