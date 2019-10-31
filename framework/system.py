"""This framework file checks the bot's system info"""

import psutil

MB = 2 ** 20
SAMPLE_INTERVAL = 0.1


def get_platform():
    """Get platform"""
    if psutil.LINUX:
        return 'Linux'
    elif psutil.WINDOWS:
        return 'Windows'
    elif psutil.MACOS:
        return 'MacOS'
    elif psutil.POSIX:
        return 'POSIX'
    elif psutil.FREEBSD:
        return 'FreeBSD'
    elif psutil.NETBSD:
        return 'NetBSD'
    elif psutil.OPENBSD:
        return 'OpenBSD'
    elif psutil.BSD:
        return 'BSD'
    elif psutil.SUNOS:
        return 'SunOS'
    elif psutil.AIX:
        return 'AIX'
    else:
        return 'Unknown'


def get_cpu_load():
    """Get CPU load"""
    return str(int(psutil.cpu_percent(interval=SAMPLE_INTERVAL))) + ' %'


def get_cpu_count():
    """Get CPU count"""
    return str(psutil.cpu_count())


def get_mem_size():
    """Get memory size"""
    return str(int(psutil.virtual_memory().used / MB)) + ' / ' + str(
        int(psutil.virtual_memory().total / MB)) + ' MB'


def get_mem_load():
    """Get memory load"""
    return str(int(psutil.virtual_memory().percent)) + ' %'
