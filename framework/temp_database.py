"""This framework file contains database setup and functions"""


def init():
    global database
    database = TempDatabase()


class TempDatabase:
    def __init__(self):
        """Initialize global temp data"""
        self.server_data = []

    def channel_initialization(self, channel_id):
        """Return default channel settings"""
        return {'channel_id': channel_id, 'quiz_search': True, 'quiz_answers': []}

    def channel_update(self, channel_id):
        """Update channel in database"""
        for i in range(len(self.server_data)):
            if self.server_data[i]['channel_id'] == channel_id:
                return i
        self.channel_add(channel_id)
        return len(self.server_data) - 1

    def channel_exists(self, channel_id):
        """Check if channel exists in database"""
        for channel in self.server_data:
            if channel['channel_id'] == channel_id:
                return True
        return False

    def channel_add(self, channel_id):
        """Add channel to database"""
        self.server_data.append(self.channel_initialization(channel_id))

    def get_channel(self, channel_id):
        """Get channel info from database"""
        for channel in self.server_data:
            if channel['channel_id'] == channel_id:
                return channel

    # Unused functions due to performance problems
    def update_entry(self, channel_id, data, key, value):
        """Update channel entry in database.

        Note:
            Unused functions due to performance problems
        """
        for i in range(len(data)):
            if data[i]['channel_id'] == channel_id:
                data[i][key] = value
                return

    def channel_remove(self, channel_id):
        """Remove channel in database.

        Note:
            Unused functions due to performance problems
        """
        for i in range(len(self.server_data)):
            if self.server_data[i]['channel_id'] == channel_id:
                del self.server_data[i]
                return
