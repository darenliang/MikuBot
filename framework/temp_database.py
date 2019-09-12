"""This framework file contains database setup and functions"""


def init():
    global database
    database = TempDatabase()


class TempDatabase:
    def __init__(self):
        """Initialize global temp data"""
        self.server_data = []

    def channel_initialization(self, id):
        """Return default channel settings"""
        return {'channel_id': id, 'quiz_search': True, 'quiz_answers': []}

    def channel_update(self, id):
        """Update channel in database"""
        for i in range(len(self.server_data)):
            if self.server_data[i]['channel_id'] == id:
                return i
        self.channel_add(id)
        return len(self.server_data) - 1

    def channel_exists(self, id):
        """Check if channel exists in database"""
        for channel in self.server_data:
            if channel['channel_id'] == id:
                return True
        return False

    def channel_add(self, id):
        """Add channel to database"""
        self.server_data.append(self.channel_initialization(id))

    def get_channel(self, id):
        """Get channel info from database"""
        for channel in self.server_data:
            if channel['channel_id'] == id:
                return channel

    # Unused functions due to performance problems
    def update_entry(self, id, data, key, value):
        """Update channel entry in database.

        Note:
            Unused functions due to performance problems
        """
        for i in range(len(data)):
            if data[i]['channel_id'] == id:
                data[i][key] = value
                return

    def channel_remove(self, id):
        """Remove channel in database.

        Note:
            Unused functions due to performance problems
        """
        for i in range(len(self.server_data)):
            if self.server_data[i]['channel_id'] == id:
                del self.server_data[i]
                return
