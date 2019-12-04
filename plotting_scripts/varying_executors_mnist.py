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


def plot_broken():
    global performance

    x_labels = [x for x in range(1, 21)]

    x_labels_large = range(20, 210, 10)

    f, (ax, ax2) = plt.subplots(1, 2, sharey=True)

    ax.plot(x_labels, performance[:20], alpha=1)
    ax2.plot(x_labels_large, performance[20:], alpha=1)

    ax.set_xlim(1, 21)
    ax2.set_xlim(20, 200, 10)

    ax.spines['right'].set_visible(False)
    ax2.spines['left'].set_visible(False)
    ax.yaxis.tick_left()
    ax.tick_params(labelright='off')
    ax2.yaxis.tick_right()

    d = .015  # how big to make the diagonal lines in axes coordinates
    # arguments to pass plot, just so we don't keep repeating them
    kwargs = dict(transform=ax.transAxes, color='k', clip_on=False)
    ax.plot((1 - d, 1 + d), (-d, +d), **kwargs)
    ax.plot((1 - d, 1 + d), (1 - d, 1 + d), **kwargs)

    kwargs.update(transform=ax2.transAxes)  # switch to the bottom axes
    ax2.plot((-d, +d), (1 - d, 1 + d), **kwargs)
    ax2.plot((-d, +d), (-d, +d), **kwargs)


    f.text(0.5, 0.04, 'Number of Executors', ha='center')
    f.text(0.04, 0.5, 'Execution Time (s)', va='center', rotation='vertical')

    plt.show()


def plot_normal(arg_len):
    global performance
    x_labels = [x for x in range(1, arg_len)]

    print x_labels

    x_labels_large = [30, 40, 50]

    # plt.bar(x_labels, performance, align='center', alpha=1)
    # plt.plot(x_labels+x_labels_large, performance, alpha=1)
    plt.plot(x_labels, performance, alpha=1)

    # plt.xticks([x for x in range(0, len(x_labels)+1, 5)] + [x for x in x_labels_large if x % 10 == 0])
    plt.xticks([x for x in range(1, len(x_labels)+1)])
    plt.ylabel('Execution Time (s)')
    plt.xlabel('Executors/threads')

    plt.show()


if __name__ == "__main__":
    for x in range(1, len(sys.argv)):
        data = read_log.read_file(sys.argv[x])
        start(data)

    plot_normal(len(sys.argv))
