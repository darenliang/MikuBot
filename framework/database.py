"""This framework file contains database code"""
import os

import boto3

from config import config


def initialize_database():
    return DynamoDB()


class Database:
    def __init__(self):
        self.temp = {}

    def temp_update(self, client):
        """Update temporary database"""
        raise NotImplementedError

    def temp_add(self, guild):
        """Add guild to temporary database"""
        self.temp[str(guild.id)] = config.prefix

    def temp_remove(self, guild):
        """Remove guild to temporary database"""
        del self.temp[str(guild.id)]


class DynamoDB(Database):
    def __init__(self):
        super().__init__()
        self.dynamodb = boto3.client('dynamodb', region_name=config.Aws.aws_region,
                                     aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                                     aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])

    def temp_update(self, client):
        """Update temporary database"""
        for guild in client.guilds:
            prefix = \
                self.dynamodb.get_item(TableName=config.Aws.aws_table, Key={'GuildId': {'S': str(guild.id)}})['Item'][
                    'Prefix']['S']
            self.temp[str(guild.id)] = prefix
