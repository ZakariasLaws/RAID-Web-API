#!/usr/bin/python

"""
Plot the time it for an entire execution using x number of Odroids.

Important, this script should ONLY be used with log files that have a
fixed number of Odroids and a fixed batch size (same for all scripts).
Otherwise the comparision becomes useless
"""

import read_log
import sys
import datetime
import numpy as np
import matplotlib.pyplot as plt


odroids_labels = []
performance = []


def start_execution_time(data):
    global odroids_labels
    global performance

    start_time = datetime.datetime.strptime(data[0]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')
    end_time = datetime.datetime.strptime(data[-1]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')

    execution_time = (end_time - start_time).total_seconds()

    batch_size = len(data[0]['predictions'])
    odroids = []

    for line in data:
        src = line['src']
        prediction_location = str(''.join(line['prediction_location'].split(':')[0:2]))
        if prediction_location not in odroids:
            odroids.append(prediction_location)

    odroids_labels.append(len(odroids))
    performance.append(execution_time)


def execution_time():
    for x in range(1,len(sys.argv)):
        data = read_log.read_file(sys.argv[x])
        start_execution_time(data)

    y_pos = np.arange(len(odroids_labels))
    plt.bar(y_pos, performance, align='center', alpha=1)
    plt.xticks(y_pos, odroids_labels)
    plt.ylabel('Execution Time (s)')
    plt.xlabel('Odroids')

    plt.show()


def start_inferences_per_second(data):
    global odroids_labels
    global performance

    start_time = datetime.datetime.strptime(data[0]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')
    end_time = datetime.datetime.strptime(data[-1]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')

    inferences_per_second = len(data) / (end_time - start_time).total_seconds()

    batch_size = len(data[0]['predictions'])
    odroids = []

    for line in data:
        src = line['src']
        prediction_location = str(''.join(line['prediction_location'].split(':')[0:2]))
        if prediction_location not in odroids:
            odroids.append(prediction_location)

    odroids_labels.append(len(odroids))
    performance.append(inferences_per_second)


def inferences_per_second():
    for x in range(1,len(sys.argv)):
        data = read_log.read_file(sys.argv[x])
        start_inferences_per_second(data)

    y_pos = np.arange(len(odroids_labels))
    plt.bar(y_pos, performance, align='center', alpha=1)
    plt.xticks(y_pos, odroids_labels)
    plt.ylabel('Inferences Per Second')
    plt.xlabel('Odroids')

    plt.show()


if __name__ == "__main__":
    execution_time()
    # inferences_per_second()
