#!/usr/bin/python

import read_log
import sys
import datetime
import matplotlib.pyplot as plt
import numpy as np


def start(data):
    start_time = datetime.datetime.strptime(data[0]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')
    end_time = datetime.datetime.strptime(data[-1]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')

    execution_time = (end_time - start_time).total_seconds()

    batch_size = len(data[0]['predictions'])
    odroids = []

    inferences = {}

    for line in data:
        src = line['src']
        prediction_location = line['prediction_location']

        if prediction_location not in inferences.keys():
            inferences[prediction_location] = {line['model']: 1}
        elif line['model'] not in inferences[prediction_location].keys():
            inferences[prediction_location][line['model']] = 1
        else:
            inferences[prediction_location][line['model']] += 1

    return inferences


def sort_func(x, y):
    val_x = int(x.split('-')[1])
    val_y= int(y.split('-')[1])

    if val_x < val_y:
        return -1
    else:
        return 1


def plot_yolo_cifar_mnst_cnn():
    keys = inferences.keys()
    keys.sort(cmp=sort_func)

    print inferences[keys[0]]

    yolo = [inferences[x]['YOLO'] if 'YOLO' in inferences[x].keys() else 0 for x in keys]
    tiny_yolo = [inferences[x]['TINY_YOLO'] if 'TINY_YOLO' in inferences[x].keys() else 0 for x in keys]
    mnist = [inferences[x]['MNIST'] if 'MNIST' in inferences[x].keys() else 0 for x in keys]
    cifar = [inferences[x]['CIFAR10'] if 'CIFAR10' in inferences[x].keys() else 0 for x in keys]

    ind = np.arange(len(yolo))
    width = 0.22
    plt.bar(ind, yolo, width, label='YOLO', hatch='\\', color='#98D9F9', alpha=0.4)
    plt.bar(ind + width, tiny_yolo, width, label='Tiny YOLO', hatch='o', color='#ABFF95', alpha=0.4)
    plt.bar(ind + (2*width), cifar, width, label='CIFAR-10', hatch='*', color='#F8FF89', alpha=0.4)
    plt.bar(ind + (3*width), mnist, width, label='MNIST', hatch='-', color='#FF8989', alpha=0.4)

    plt.ylabel('Inferences')

    plt.xticks(ind + (2*width), ['-'.join(x.split('-')[0:2]) for x in keys])
    plt.xlim(0, 12)
    plt.ylim(0, 800)
    # plt.legend(bbox_to_anchor=(1, 1), loc='5')
    plt.legend(loc='upper right')
    plt.show()


if __name__ == "__main__":
    data = read_log.read_file(sys.argv[1])
    inferences = start(data)

    plot_yolo_cifar_mnst_cnn()
