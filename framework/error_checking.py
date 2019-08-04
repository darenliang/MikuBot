def is_int(num):
    """Check num is an int"""
    try:
        int(num)
        return True
    except ValueError:
        return False
