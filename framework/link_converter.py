"""This framework file checks urls for missing components"""


def convert(url):
    """Adds correct prefix"""
    if url.startswith('http://www.'):
        return 'http://' + url[len('http://www.'):]
    if url.startswith('www.'):
        return 'http://' + url[len('www.'):]
    if not url.startswith('http://'):
        return 'http://' + url
    return url
