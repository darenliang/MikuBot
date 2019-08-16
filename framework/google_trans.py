"""This framework file contains functions to help with google translate"""

from fuzzywuzzy import fuzz

# list of langcodes
LANGCODES = {'afrikaans': 'af', 'albanian': 'sq', 'amharic': 'am', 'arabic': 'ar', 'armenian': 'hy',
             'azerbaijani': 'az', 'basque': 'eu', 'belarusian': 'be', 'bengali': 'bn', 'bosnian': 'bs',
             'bulgarian': 'bg', 'catalan': 'ca', 'cebuano': 'ceb', 'chichewa': 'ny', 'chinese simplified': 'zh-cn',
             'chinese traditional': 'zh-tw', 'corsican': 'co', 'croatian': 'hr', 'czech': 'cs', 'danish': 'da',
             'dutch': 'nl', 'english': 'en', 'esperanto': 'eo', 'estonian': 'et', 'filipino': 'fil', 'finnish': 'fi',
             'french': 'fr', 'frisian': 'fy', 'galician': 'gl', 'georgian': 'ka', 'german': 'de', 'greek': 'el',
             'gujarati': 'gu', 'haitian creole': 'ht', 'hausa': 'ha', 'hawaiian': 'haw', 'hebrew': 'he', 'hindi': 'hi',
             'hmong': 'hmn', 'hungarian': 'hu', 'icelandic': 'is', 'igbo': 'ig', 'indonesian': 'id', 'irish': 'ga',
             'italian': 'it', 'japanese': 'ja', 'javanese': 'jw', 'kannada': 'kn', 'kazakh': 'kk', 'khmer': 'km',
             'korean': 'ko', 'kurdish kurmanji': 'ku', 'kyrgyz': 'ky', 'lao': 'lo', 'latin': 'la', 'latvian': 'lv',
             'lithuanian': 'lt', 'luxembourgish': 'lb', 'macedonian': 'mk', 'malagasy': 'mg', 'malay': 'ms',
             'malayalam': 'ml', 'maltese': 'mt', 'maori': 'mi', 'marathi': 'mr', 'mongolian': 'mn',
             'myanmar burmese': 'my', 'nepali': 'ne', 'norwegian': 'no', 'pashto': 'ps', 'persian': 'fa',
             'polish': 'pl', 'portuguese': 'pt', 'punjabi': 'pa', 'romanian': 'ro', 'russian': 'ru', 'samoan': 'sm',
             'scots gaelic': 'gd', 'serbian': 'sr', 'sesotho': 'st', 'shona': 'sn', 'sindhi': 'sd', 'sinhala': 'si',
             'slovak': 'sk', 'slovenian': 'sl', 'somali': 'so', 'spanish': 'es', 'sundanese': 'su', 'swahili': 'sw',
             'swedish': 'sv', 'tajik': 'tg', 'tamil': 'ta', 'telugu': 'te', 'thai': 'th', 'turkish': 'tr',
             'ukrainian': 'uk', 'urdu': 'ur', 'uzbek': 'uz', 'vietnamese': 'vi', 'welsh': 'cy', 'xhosa': 'xh',
             'yiddish': 'yi', 'yoruba': 'yo', 'zulu': 'zu'}

# reverse map langcodes list
LANGUAGES = dict(map(reversed, LANGCODES.items()))


def get_language_code(search):
    """Get language code"""
    max_factor = -1
    max_language = None
    for language in LANGCODES:
        factor = fuzz.partial_ratio(search, language)
        if factor > max_factor:
            max_factor = factor
            max_language = language
    return LANGCODES[max_language]


def get_language_name(code):
    """Get language name"""
    return LANGUAGES[code]


def get_translation(translator, query, destination, source):
    """Get translation"""
    if destination is None:
        return translator.translate(query)
    elif source is None:
        return translator.translate(query, dest=destination)
    else:
        return translator.translate(query, dest=destination, src=source)
