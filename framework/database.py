"""This framework file contains database code"""
import os

import boto3
from tinydb import TinyDB, Query

from config import config


def initialize_database():
    if config.local_database:
        return LocalDB()
    else:
        return DynamoDB()


class Database:
    def __init__(self):
        self.temp = []

    def guild_initialization(self, guild, prefix=config.prefix):
        """Return default guild settings"""
        raise NotImplementedError

    def temp_initialization(self, guild, prefix=config.prefix):
        """Return default guild settings for temp database"""
        return {'Guild_Id': guild.id, 'Prefix': prefix}

    def temp_update(self, client):
        """Update temporary database"""
        raise NotImplementedError

    def guild_update(self, client):
        """Update guild in database"""
        raise NotImplementedError

    def temp_add(self, guild):
        """Add guild to temporary database"""
        self.temp.append(self.temp_initialization(guild))

    def guild_add(self, guild):
        """Add guild in database"""
        raise NotImplementedError

    def temp_remove(self, guild):
        """Remove guild to temporary database"""
        for i in range(len(self.temp)):
            if self.temp[i]['Guild_Id'] == guild.id:
                del self.temp[i]
                return

    def guild_remove(self, guild):
        """Remove guild in database"""
        raise NotImplementedError

    def guild_change(self, old_guild, new_guild):
        """Change guild in database"""
        raise NotImplementedError


class DynamoDB(Database):
    def __init__(self):
        super().__init__()
        self.dynamodb = boto3.client('dynamodb', region_name=config.Aws.aws_region,
                                     aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                                     aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])

    def guild_initialization(self, guild, prefix=config.prefix):
        """Return default guild settings"""
        return {'Guild_Id': {'N': str(guild.id)}, 'Guild_Name': {'S': guild.name}, 'Prefix': {'S': prefix}}

    def temp_update(self, client):
        """Update temporary database"""
        for guild in client.guilds:
            prefix = \
                self.dynamodb.get_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(guild.id)}})['Item'][
                    'Prefix']['S']
            self.temp.append(self.temp_initialization(guild, prefix))

    def guild_update(self, client):
        """Update guild in database"""
        for guild in client.guilds:
            response = self.dynamodb.get_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(guild.id)}})
            if 'Item' not in response:
                self.dynamodb.put_item(TableName=config.Aws.aws_table, Item=self.guild_initialization(guild))

    def guild_add(self, guild):
        """Add guild in database"""
        self.dynamodb.put_item(TableName=config.Aws.aws_table, Item=self.guild_initialization(guild))

    def guild_remove(self, guild):
        """Remove guild in database"""
        self.dynamodb.delete_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(guild.id)}})

    def guild_change(self, old_guild, new_guild):
        """Change guild in database"""
        self.dynamodb.update_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(old_guild.id)}},
                                  UpdateExpression="SET Guild_Name = :r",
                                  ExpressionAttributeValues={':r': {'S': new_guild.name}})


class LocalDB(Database):
    def __init__(self):
        super().__init__()
        self.localdb = TinyDB(config.local_database_location)
        self.user = Query()

    def guild_initialization(self, guild, prefix=config.prefix):
        """Return default guild settings"""
        return {'Guild_Id': guild.id, 'Guild_Name': guild.name, 'Prefix': prefix}

    def temp_update(self, client):
        """Update temporary database"""
        for guild in client.guilds:
            prefix = self.localdb.search(self.user.Guild_Id == guild.id)[0]['Prefix']
            self.temp.append(self.temp_initialization(guild, prefix))

    def guild_update(self, client):
        """Update guild in database"""
        for guild in client.guilds:
            response = self.localdb.search(self.user.Guild_Id == guild.id)
            if not response:
                self.localdb.insert(self.guild_initialization(guild))

    def guild_add(self, guild):
        """Add guild in database"""
        self.localdb.insert(self.guild_initialization(guild))

    def guild_remove(self, guild):
        """Remove guild in database"""
        self.localdb.remove(self.user.Guild_Id == guild.id)

    def guild_change(self, old_guild, new_guild):
        """Change guild in database"""
        self.localdb.update({'Guild_Name': new_guild.name}, self.user.Guild_Id == old_guild.id)
