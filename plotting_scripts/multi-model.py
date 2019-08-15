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


def plot_yolo_cifar_mnst_cnn():
    keys = sorted(inferences.keys())

    print keys

    yolo = [inferences[x]['YOLO'] for x in keys]
    mnist = [inferences[x]['MNIST'] for x in keys]
    cifar = [inferences[x]['CIFAR10'] for x in keys]

    ind = np.arange(len(yolo))
    width = 0.27
    plt.bar(ind - width, yolo, width, label='Yolo')
    plt.bar(ind, cifar, width, label='Cifar10')
    plt.bar(ind + width, mnist, width, label='Mnist')

    plt.ylabel('Inferences')

    plt.xticks(ind, keys)
    # plt.legend(bbox_to_anchor=(1, 1), loc='5')
    plt.legend(loc='lower right')
    plt.show()


if __name__ == "__main__":
    data = read_log.read_file(sys.argv[1])
    inferences = start(data)

    plot_yolo_cifar_mnst_cnn()
