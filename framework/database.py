def init():
    """Initialize global temp data"""
    global server_data
    server_data = []


def channel_initialization(id):
    """Return default channel settings"""
    return {'channel_id': id, 'youtube_search': True, 'youtube_context': [],
            'youtube_message': None, 'anime_search': True, 'anime_context': [], 'anime_message': None,
            'manga_search': True, 'manga_context': [], 'manga_message': None, 'trivia_search': True,
            'trivia_answers': [], 'quiz_search': True, 'quiz_answers': []}


def channel_update(id):
    """Update channel in database"""
    for i in range(len(server_data)):
        if server_data[i]['channel_id'] == id:
            return i
    channel_add(id)
    return len(server_data) - 1


def channel_exists(id):
    """Check if channel exists in database"""
    for channel in server_data:
        if channel['channel_id'] == id:
            return True
    return False


def channel_add(id):
    """Add channel to database"""
    server_data.append(channel_initialization(id))


def get_channel(id):
    """Get channel info from database"""
    for channel in server_data:
        if channel['channel_id'] == id:
            return channel


# Unused functions due to performance problems
def update_entry(id, data, key, value):
    """Update channel entry in database.

    Note:
        Unused functions due to performance problems
    """
    for i in range(len(data)):
        if data[i]['channel_id'] == id:
            data[i][key] = value
            return


def channel_remove(id):
    """Remove channel in database.

    Note:
        Unused functions due to performance problems
    """
    for i in range(len(server_data)):
        if server_data[i]['channel_id'] == id:
            del server_data[i]
            return
