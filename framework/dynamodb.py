"""This framework file contains DynamoDB setup and functions"""

import os

import boto3

from config import config


def init():
    """Setup AWS storage"""
    global dynamodb
    global temp
    dynamodb = boto3.client('dynamodb', region_name=config.Aws.aws_region,
                            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
    temp = []


def guild_initialization(guild, prefix=config.prefix):
    """Return default guild settings"""
    return {'Guild_Id': {'N': str(guild.id)}, 'Guild_Name': {'S': guild.name}, 'Prefix': {'S': prefix}}


def temp_initialization(guild, prefix=config.prefix):
    """Return default guild settings for temp database"""
    return {'Guild_Id': guild.id, 'Prefix': prefix}


def temp_update(client):
    """Update temporary database"""
    for guild in client.guilds:
        prefix = \
            dynamodb.get_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(guild.id)}})['Item']['Prefix'][
                'S']
        temp.append(temp_initialization(guild, prefix))


def guild_update(client):
    """Update guild in database"""
    for guild in client.guilds:
        response = dynamodb.get_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(guild.id)}})
        if 'Item' not in response:
            dynamodb.put_item(TableName=config.Aws.aws_table, Item=guild_initialization(guild))


def temp_add(guild):
    """Add guild to temporary database"""
    temp.append(temp_initialization(guild))


def guild_add(guild):
    """Add guild in database"""
    dynamodb.put_item(TableName=config.Aws.aws_table, Item=guild_initialization(guild))


def temp_remove(guild):
    """Remove guild to temporary database"""
    for i in range(len(temp)):
        if temp[i]['Guild_Id'] == guild.id:
            del temp[i]
            return


def guild_remove(guild):
    """Remove guild in database"""
    dynamodb.delete_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(guild.id)}})


def guild_change(old_guild, new_guild):
    """Change guild in database"""
    dynamodb.update_item(TableName=config.Aws.aws_table, Key={'Guild_Id': {'N': str(old_guild.id)}},
                         UpdateExpression="SET Guild_Name = :r",
                         ExpressionAttributeValues={':r': {'S': new_guild.name}})
