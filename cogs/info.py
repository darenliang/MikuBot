"""This cog file contains the bot's info commands"""

from datetime import datetime

import discord
import pkg_resources
from discord.ext import commands

from config import config
from framework import cloc
from framework import prefix_handler, system, pastebin


def get_uptime(client):
    """Get uptime of running client"""
    delta_uptime = datetime.utcnow() - client.launch_time
    hours, remainder = divmod(int(delta_uptime.total_seconds()), 3600)
    minutes, seconds = divmod(remainder, 60)
    days, hours = divmod(hours, 24)
    return f'{days}d, {hours}h, {minutes}m, {seconds}s'


class Info(commands.Cog):
    """Info command group."""

    def __init__(self, client):
        self.client = client

    @commands.command(name='about', aliases=[])
    async def about(self, ctx):
        """Return a list of packages and services used."""
        info = await self.client.application_info()

        # makes use of a paginator to prevent sending a message that is too big
        paginator = commands.Paginator()
        paginator.add_line('About ' + info.name)
        paginator.add_line('')
        paginator.add_line(
            'This bot is created by Daren Liang (' + info.owner.name + '#' + info.owner.discriminator +
            ') using discord.py')
        paginator.add_line('')
        paginator.add_line('This bot is made possible with the following cloud services:')
        paginator.add_line('')
        paginator.add_line('Heroku PaaS')
        paginator.add_line('Amazon DynamoDB')
        paginator.add_line('')
        paginator.add_line('and is powered by these system tools:')
        paginator.add_line('')
        paginator.add_line('Opus Codec')
        paginator.add_line('FFMPEG')
        paginator.add_line('')
        paginator.add_line(
            'This bot is complex and requires a lot of work to maintain. If you do find any bugs or have any'
            ' suggestions, please contact me at {0}'.format(info.owner.name + '#' + info.owner.discriminator))
        paginator.add_line('')
        paginator.add_line('Here is the list of loaded packages:')
        paginator.add_line('')

        # gets list of packages
        installed_packages = [(d.project_name, d.version) for d in pkg_resources.working_set]
        installed_packages.reverse()
        for package in installed_packages:
            paginator.add_line('{0}: {1}'.format(package[0], package[1]))

        for page in paginator.pages:
            await ctx.author.send(page)
        if ctx.guild:
            await ctx.send('Message sent to your DMs!')

    @commands.command(name='info', aliases=['information', 'invite', 'ping'])
    async def info(self, ctx):
        """Return information about this bot."""
        # spits out information about the bot
        info = await self.client.application_info()
        embed = discord.Embed(
            color=config.embed_color,
            title=info.name + ' Info')
        if not ctx.guild:
            server_prefix = 'Prefix'
            prefix_str = config.prefix
        else:
            server_prefix = 'Server Prefix'
            prefix_str = prefix_handler.return_prefix(self.client, ctx)
        embed.add_field(name='Links',
                        value='[Invite Bot](https://discordapp.com/oauth2/authorize?client_id=' + str(
                            info.id) + '&scope=bot)\n'
                                       '[Support Server](https://discord.gg/vGcNVe9)\n'
                                       '[Github](https://github.com/darenliang/MikuBot)\n'
                                       '[Status](https://mikubot.statuspal.io)',
                        inline=True)
        embed.add_field(name=server_prefix,
                        value=prefix_str,
                        inline=True)
        embed.add_field(name='Created by',
                        value=info.owner.name + '#' + info.owner.discriminator,
                        inline=False)
        embed.add_field(name='Latency',
                        value=str(int(self.client.latency * 1000)) + 'ms',
                        inline=True)
        embed.add_field(name='Guilds',
                        value=str(len(self.client.guilds)),
                        inline=True)
        embed.add_field(name='Users',
                        value=str(len(self.client.users)),
                        inline=True)
        embed.add_field(name='Uptime',
                        value=get_uptime(self.client),
                        inline=True)

        if not ctx.guild:
            shard_id = '0'
        else:
            shard_id = str(ctx.guild.shard_id)

        embed.add_field(name='Current Shard ID',
                        value=shard_id,
                        inline=True)
        embed.add_field(name='Shard Count',
                        value=str(self.client.shard_count),
                        inline=True)
        await ctx.send(embed=embed)

    @commands.command(name='system_info', aliases=['sysinfo'])
    async def system_info(self, ctx):
        """Return system information about this bot."""
        # spits out system information about the bot
        info = await self.client.application_info()
        embed = discord.Embed(
            color=config.embed_color,
            title=info.name + ' System Info')
        embed.add_field(name='Platform',
                        value=system.get_platform(),
                        inline=True)
        embed.add_field(name='CPU Threads',
                        value=system.get_cpu_count(),
                        inline=True)
        embed.add_field(name='CPU Load',
                        value=system.get_cpu_load(),
                        inline=True)
        embed.add_field(name='Shard Count',
                        value=str(self.client.shard_count),
                        inline=True)
        embed.add_field(name='Memory',
                        value=system.get_mem_size(),
                        inline=True)
        embed.add_field(name='Memory Load',
                        value=system.get_mem_load(),
                        inline=True)
        await ctx.send(embed=embed)

    @commands.command(name='pfp', aliases=[])
    async def pfp(self, ctx, *, member: discord.Member = None):
        """Return profile picture url

        Parameters
        ------------
        member: discord.Member [Optional]
            When in a guild:
                The user or member to get profile picture from.
                If the user or member is not specified, the message author will be checked instead.
            When in DMs:
                Member is not to be specified.
        """
        if member is None or ctx.guild is None:
            member = ctx.author
        await ctx.send(str(member.avatar_url).replace('.webp', '.png'))

    @commands.command(name='new', aliases=['whatsnew'])
    async def new(self, ctx):
        """Return what's new about bot development"""
        text = '```' + pastebin.get_url_data(config.whatsnew) + '```'
        await ctx.send(text)

    @commands.command(name='cloc', aliases=[])
    async def cloc(self, ctx, repo=None):
        """Return number of lines of code of a repo

        Parameters
        ------------
        repo: string [Optional]
            The GitHub repo in the format username/repo_name (ex: darenliang/MikuBot)
            If the GitHub repo is not specified, this bot's repo will be used.
        """
        if not repo:
            repo = "darenliang/MikuBot"
        data = cloc.get_code_count(repo)
        if "Error" in data:
            return await ctx.send("Please provide a valid GitHub repo.")
        else:
            embed = discord.Embed(
                color=config.embed_color,
                title=f'How many lines of code in {repo}?')
            if len(data) < 26:
                for element in data:
                    embed.add_field(name=element['language'],
                                    value=element['linesOfCode'],
                                    inline=False)
            else:
                for i in range(24):
                    embed.add_field(name=data[i]['language'],
                                    value=data[i]['linesOfCode'],
                                    inline=False)
                embed.add_field(name=data[-1]['language'],
                                value=data[-1]['linesOfCode'],
                                inline=False)
            return await ctx.send(embed=embed)


def setup(client):
    client.add_cog(Info(client))
