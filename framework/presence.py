import datetime
import random

from jikanpy import Jikan


def get_presence():
    """Get a random anime airing today"""
    jikan = Jikan()
    datetime.datetime.today().weekday()
    day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][
        datetime.datetime.today().weekday()]
    anime_list = jikan.schedule(day)[day]
    if len(anime_list) > 9:
        day_rand = random.randint(0, 9)
    else:
        day_rand = random.randint(0, len(anime_list) - 1)
    return anime_list[day_rand]['title']
