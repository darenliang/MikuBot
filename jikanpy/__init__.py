import requests

session: requests.Session = requests.Session()

from jikanpy.jikan import Jikan
from jikanpy.aiojikan import AioJikan
from jikanpy.exceptions import *
