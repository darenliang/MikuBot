"""This framework file checks for common errors"""


def is_int(num):
    """Check num is an int"""
    try:
        int(num)
        return True
    except ValueError:
        return False
