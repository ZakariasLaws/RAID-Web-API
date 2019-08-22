#!/usr/bin/python

import read_log
import sys
import datetime
import matplotlib.pyplot as plt


performance = []


def start(data):
    global performance

    start_time = datetime.datetime.strptime(data[0]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')
    end_time = datetime.datetime.strptime(data[-1]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')

    execution_time = (end_time - start_time).total_seconds()

    performance.append(execution_time)


def plot_normal(len):
    global performance
    x_labels = [x for x in range(1, len)]

    # plt.bar(x_labels, performance, align='center', alpha=1)
    plt.plot(x_labels, performance, alpha=1)

    plt.ylabel('Execution Time (s)')
    plt.xlabel('Number of Executors')

    plt.show()


if __name__ == "__main__":
    for x in range(1, len(sys.argv)):
        data = read_log.read_file(sys.argv[x])
        start(data)

    plot_normal(len(sys.argv))
