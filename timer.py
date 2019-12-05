#!/usr/bin/python

from __future__ import print_function
import time, sys, datetime, re

def print_clock(value):
    sys.stdout.write("\r %s" % datetime.timedelta(seconds=value))
    sys.stdout.flush()

def wait_timer(start, end):
    while start >= end:
        print_clock(start)
        time.sleep(1) # Sleep 1 second
        start -= 1

start = sys.argv[1]

regex = re.compile(r'(\d+|\s+)')

if 'm' in start:
    start = int(regex.split(start)[1]) * 60

elif 'h' in start:
    start = int(regex.split(start)[1]) * 60 * 60

elif 's' in start:
    start = int(regex.split(start)[1])

else:
    start = int(start)

wait_timer(start, 0)

print ("\nSTOP STOP STOP STOP")
