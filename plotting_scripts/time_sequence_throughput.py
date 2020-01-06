#!/usr/bin/python

import read_log
import sys
import datetime, time
import matplotlib.pyplot as plt
from matplotlib import dates
import numpy as np

seconds_per_group = 1


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


def get_inferences_tiny_yolo_yolo(data):
    start_time = datetime.datetime.strptime(data[0]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')
    end_time = datetime.datetime.strptime(data[-1]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')

    execution_time = (end_time - start_time).total_seconds()
    batch_size = len(data[0]['predictions'])

    start = 0
    end = time.mktime(end_time.timetuple()) - time.mktime(start_time.timetuple())

    predictions_ty = [0, 0, 0, 0]
    predictions_y = [0, 0, 0, 0]

    prev_timestamp = start
    tmp_ty = 0
    tmp_y = 0

    for line in data:
        timestamp = time.mktime(datetime.datetime.strptime(line['timestamp'], '%Y-%m-%dT%H:%M:%S.%f').timetuple())
        timestamp = int(timestamp - time.mktime(start_time.timetuple()))

        if prev_timestamp + (seconds_per_group-1) < timestamp:
            predictions_ty.append(tmp_ty)
            predictions_y.append(tmp_y)
            tmp_ty = 0
            tmp_y = 0
            prev_timestamp = timestamp

        if 'TINY' in line['model']:
            tmp_ty += 1
        else:
            tmp_y += 1

    return predictions_ty, predictions_y


def smooth(y, box_pts):
    box = np.ones(box_pts)/box_pts
    y_smooth = np.convolve(y, box, mode='same')
    return y_smooth


if __name__ == "__main__":
    data = read_log.read_file(sys.argv[1])
    inferences_tiny_yolo, inferences_yolo = get_inferences_tiny_yolo_yolo(data)

    sequence = list(range(0, len(inferences_tiny_yolo) * seconds_per_group, seconds_per_group))

    ticks = [datetime.datetime.fromtimestamp(x) for x in sequence]

    fig, ax = plt.subplots()
    ax.plot(ticks, smooth(inferences_tiny_yolo, 5), alpha=1, color='blue', label='Tiny YOLO Average', linestyle='dashed')
    ax.plot(ticks, smooth(inferences_yolo, 5), alpha=1, color='red', label='YOLO Average')

    # ax.plot(ticks, inferences_tiny_yolo, alpha=1, color='black', label='SMOOOTH')
    ax.scatter(ticks, inferences_tiny_yolo, alpha=0.5, color='blue', label='Tiny YOLO Throughput')
    ax.scatter(ticks, inferences_yolo, alpha=0.5, color='red', label='YOLO Throughput', marker='x')

    ax.xaxis.set_major_formatter(dates.DateFormatter('%M:%S'))

    ax.set_xticks([datetime.datetime.fromtimestamp(x) for x in range(0, len(inferences_tiny_yolo) * seconds_per_group, 5)])

    plt.xticks(rotation=75)
    plt.ylabel('Inferences / 5 seconds')
    plt.xlabel('Duration')

    # plt.xlim(0, 12)
    # plt.ylim(0, 800)
    # plt.legend(bbox_to_anchor=(1, 1), loc='5')
    plt.legend(loc='upper right')
    plt.show()
