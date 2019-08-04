import logging
import os

import discord
from clarifai.rest import ClarifaiApp
from discord.ext import commands

from config import config
from framework import prefix_handler, dynamodb, presence

# months list
months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
          'November', 'December']

# set logger
log = logging.getLogger(__name__)


class Admin(commands.Cog):
    """Admin command group."""

    def __init__(self, client):
        self.client = client

        # sets up clarifai instance
        clarifai = ClarifaiApp(api_key=os.environ['CLARIFAI_KEY'])
        self.clarifai_model = clarifai.public_models.general_model

    @commands.command(name='prefix', aliases=['set_prefix'])
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def prefix(self, ctx, *, prefix):
        """Set the prefix of the bot for this server.

        Note:
            You must have admin to run the command.

        Parameters
        ------------
        prefix: str [Required]
            The prefix to change to for this server.
        """
        # sets prefix on AWS
        dynamodb.dynamodb.update_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(ctx.guild.id)}},
                                      UpdateExpression="SET Prefix = :r",
                                      ExpressionAttributeValues={':r': {'S': prefix}})

        # set new prefix in temporary local database
        for guild in dynamodb.temp:
            if guild['Guild_Id'] == ctx.guild.id:
                guild['Prefix'] = prefix

        # set prefix_handler
        self.client.command_prefix = prefix_handler.get_prefix
        log.info('Prefix changed for server: {0} ({1})'.format(ctx.guild.name, ctx.guild.id))
        await ctx.send('Updated server prefix changed to {0}'.format(prefix))

    @commands.command(name='permissions', aliases=['perms'])
    @commands.guild_only()
    async def permissions(self, ctx, *, member: discord.Member = None):
        """List the permissions of a member.

        Parameters
        ------------
        member: discord.Member [Optional]
            The member to check permissions.
            If a member is not specified, the message author will be checked instead.
        """
        if not member:
            member = ctx.author

        # Here we check if the value of each permission is True.
        perms = '\n'.join(perm for perm, value in member.guild_permissions if value)

        # And to make it look nice, we wrap it in an Embed.
        embed = discord.Embed(title='Server permissions for ' + str(member), colour=member.colour)

        # \uFEFF is a Zero-Width Space, which basically allows us to have an empty field name.
        embed.add_field(name='\uFEFF', value=perms)
        embed.set_thumbnail(url=member.avatar_url)
        await ctx.send(content=None, embed=embed)

    @commands.command(name='who', aliases=['identity', 'whois'])
    @commands.guild_only()
    async def who(self, ctx, *, member: discord.Member = None):
        """Return info about a member.

        Parameters
        ------------
        member: discord.Member [Optional]
            The user or member to get info from.
            If the user or member is not specified, the message author will be checked instead.
        """
        # use author of member is not mentioned
        if not member:
            member = ctx.author

        # create embed
        embed = discord.Embed(
            color=member.colour,
            title='Who is {0}?'.format(str(member)))
        embed.add_field(name='Display Name',
                        value=member.display_name,
                        inline=True)
        embed.add_field(name='User ID',
                        value=str(member.id),
                        inline=True)
        joined_at = member.joined_at
        if joined_at is None:
            joined_at_str = 'Not available'
        else:
            joined_month = months[joined_at.month - 1]
            joined_at_str = '{0} {1}, {2}'.format(joined_month, joined_at.day, joined_at.year)
        embed.add_field(name='Joined {0}'.format(ctx.guild.name),
                        value=joined_at_str,
                        inline=True)
        created_at = member.created_at
        if created_at is None:
            created_at_str = 'Not available'
        else:
            created_month = months[created_at.month - 1]
            created_at_str = '{0} {1}, {2}'.format(created_month, created_at.day, created_at.year)
        embed.add_field(name='Joined Discord',
                        value=created_at_str,
                        inline=True)
        embed.add_field(name='Highest Role',
                        value=member.top_role.name,
                        inline=True)
        try:
            response = self.clarifai_model.predict_by_url(
                url=str(member.avatar_url).replace('.webp', '.jpg'))
            concept = response['outputs'][0]['data']['concepts'][0]['name']
        except:
            concept = 'Cannot parse data.'
            log.warning('who: Cannot concept data')
        embed.add_field(name="What's their avatar?",
                        value=concept.capitalize(),
                        inline=True)
        embed.set_thumbnail(url=member.avatar_url)
        await ctx.send(embed=embed)

    @commands.command(name='presence', aliases=[])
    @commands.is_owner()
    async def presence(self, ctx, status, message=None, url=None):
        """Change the presence of the bot.

        Note:
            You must be the bot owner to run the command.

        Parameters
        ------------
        status: string [Required]
            playing - Changes to playing
            watching - Changes to watching
            listening - Changes to listening
            streaming - Changes to streaming
            anime - Changes to anime watching mode

        message: string [Optional]
            specify message for the bot to display as the presence

        Note:
            You must put quotes around the message

        url: string [Optional]
            specify streaming url

        Examples:
            !presence playing "with weebs"
            !presence watching "anime"
            !presence listening "to music"
            !presence streaming "video games" https://www.twitch.tv
            !presence anime
        """
        # make case insensitive
        status = status.lower()

        # playing status
        if status == 'playing':
            config.anime_presence = False
            await self.client.change_presence(activity=discord.Game(name=message))
            logging.info('Presence changed')

        # watching status
        elif status == 'watching':
            config.anime_presence = False
            await self.client.change_presence(
                activity=discord.Activity(type=discord.ActivityType.watching, name=message))
            logging.info('Presence changed')

        # listening status
        elif status == 'listening':
            config.anime_presence = False
            await self.client.change_presence(
                activity=discord.Activity(type=discord.ActivityType.listening, name=message))
            logging.info('Presence changed')

        # streaming status
        elif status == 'streaming':
            config.anime_presence = False
            await self.client.change_presence(activity=discord.Streaming(name=message, url=url))
            logging.info('Presence changed')

        # anime status
        elif status == 'anime':
            config.anime_presence = True
            await self.client.change_presence(
                activity=discord.Activity(type=discord.ActivityType.watching, name=presence.get_presence()))
            logging.info('Presence changed')

        # invalid status
        else:
            await ctx.send('Invalid status.')

    @commands.command(name='status', aliases=[])
    @commands.is_owner()
    async def status(self, ctx, status):
        """Change the status of the bot.

        Note:
            You must be the bot owner to run the command.

        Parameters
        ------------
        status: string [Required]
            online - Changes to online
            offline - Changes to offline
            idle - Changes to idle
            dnd - Changes to do not disturb
        """
        # make case insensitive
        status = status.lower()

        # online status
        if status == 'online':
            await self.client.change_presence(status=discord.Status.online)
            logging.info('Status changed')

        # offline status
        elif status == 'offline':
            await self.client.change_presence(status=discord.Status.offline)
            logging.info('Status changed')

        # idle status
        elif status == 'idle':
            await self.client.change_presence(status=discord.Status.idle)
            logging.info('Status changed')

        # do not disturb status
        elif status == 'dnd':
            await self.client.change_presence(status=discord.Status.dnd)
            logging.info('Status changed')

        # invalid status
        else:
            await ctx.send('Invalid status.')

    @commands.command(name='unload', aliases=[])
    @commands.is_owner()
    async def unload(self, ctx, extension):
        """Unload cog

        Note:
            You must be the bot owner to run the command.

        Parameters
        ------------
        extension: string [Required]
            The extension you want to unload
        """
        # unload extension
        self.client.unload_extension(f'cogs.{extension}')
        await ctx.send(f'{extension} is unloaded')
        logging.info(f'{extension} is unloaded')

    @commands.command(name='load', aliases=[])
    @commands.is_owner()
    async def load(self, ctx, extension):
        """Load cog

        Note:
            You must be the bot owner to run the command.

        Parameters
        ------------
        extension: string [Required]
            The extension you want to load
        """
        # load extension
        self.client.load_extension(f'cogs.{extension}')
        await ctx.send(f'{extension} is loaded')
        logging.info(f'{extension} is loaded')

    @commands.command(name='say', aliases=[])
    @commands.is_owner()
    async def say(self, ctx, channel: discord.TextChannel, *, message):
        """Say a message to a given channel

        Note:
            You must be the bot owner to run the command.

        Parameters
        ------------
        channel: discord.TextChannel [Required]
            The channel to send the message to

        message: string [Required]
            The message to send
        """
        await channel.send(message)


def setup(client):
    client.add_cog(Admin(client))
