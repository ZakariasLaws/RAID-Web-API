#!/usr/bin/python

"""
Plot the time it for an entire execution using x number of Odroids.

Important, this script should ONLY be used with log files that have a
fixed number of Odroids and a fixed batch size (same for all scripts).
Otherwise the comparision becomes useless
"""
from time import strftime, gmtime

from matplotlib import dates, ticker

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

    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111)

    x_pos = np.arange(len(odroids_labels))

    plt.xticks(x_pos, odroids_labels)
    plt.xlim(-1, len(performance))
    plt.ylabel('Execution Time')
    plt.xlabel('Number of Odroids')

    # plt.yticks(performance, [strftime("%M:%S", gmtime(x)) for x in performance])
    # plt.yticks([x for x in range(0, 1000, 90)])
    # plt.yticks([x for x in range(0, 1700, 120)])

    # WEAK SCALABILITY TINY YOLO
    plt.yticks([x for x in range(0, 300, 30)])
    plt.ylim(0, 250)
    plt.xlim(-1, 10)
    ax.plot([0,1,2,3,4,5,6,7,8,9,10,11], [performance[0] for x in range(0, len(performance)+2)], color='r', alpha=1, markersize=8, label='Ideal')
    ax.plot(x_pos, performance, marker='o', alpha=1, markersize=8, label='RAID')

    for i in range(10):
        ax.annotate(str(int(round(performance[i]))) + 's', (x_pos[i], performance[i]+10))
    plt.legend(loc='upper left')


    # REST (bar chart)
    # ax.bar(x_pos, performance, align='center', alpha=1)

    def my_formatter(val, pos=None):
        return str(strftime("%H:%M:%S", gmtime(val)))

    ax.yaxis.set_major_formatter(ticker.FuncFormatter(my_formatter))

    for val, label in zip(ax.patches, [int(x) for x in performance]):
        height = val.get_height()
        ax.text(val.get_x() + val.get_width() / 2, height + 10, str(label) + "s", ha='center', va='bottom')

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

    x_pos = np.arange(len(odroids_labels))
    plt.bar(x_pos, performance, align='center', alpha=1)
    plt.xticks(x_pos, odroids_labels)
    plt.ylabel('Inferences / Second')
    plt.xlabel('Number of Odroids')

    # Add linear line
    first_value = performance[0]

    line = [first_value*x for x in range(1, len(performance)+1)]
    positions = list(x_pos)

    positions.insert(0, -1)
    positions.append(positions[len(positions)-1]+0.5)
    line.insert(0, 0)
    line.append(line[len(line)-1] + (first_value/2))

    plt.plot(positions, line, alpha=1, color='red', label='LINEAR', linestyle='solid')

    plt.legend(loc='upper left')
    plt.show()


def strong_scalability():
    for x in range(1, len(sys.argv)):
        data = read_log.read_file(sys.argv[x])
        start_execution_time(data)

    x_pos = np.arange(len(odroids_labels))
    perf = [performance[0]/x for x in performance] # Speedup

    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111)

    plt.xticks(x_pos, odroids_labels)
    plt.ylabel('Speedup')
    plt.xlabel('Number of Odroids')
    # plt.bar(x_pos, perf, align='center', alpha=1)

    # Add linear line
    first_value = perf[0]

    line = [first_value*x for x in range(1, len(perf)+1)]
    positions = list(x_pos)

    positions.insert(0, -1)
    positions.append(positions[len(positions)-1]+0.5)
    line.insert(0, 0)
    line.append(line[len(line)-1] + (first_value/2))

    ax.plot(positions, line, alpha=1, color='red', label='LINEAR', linestyle='solid')
    ax.plot(x_pos, perf, linestyle='dashed', marker='o', alpha=1, markersize=8, label='RAID')

    plt.legend(loc='upper left')
    plt.show()


if __name__ == "__main__":
    execution_time()
    # inferences_per_second()
    # strong_scalability()
