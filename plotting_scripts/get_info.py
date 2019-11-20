#!/usr/bin/python

"""
SINGLE MODEL

Print useful info about the log
"""

import read_log
import sys
import datetime


def start(data):
    start_time = datetime.datetime.strptime(data[0]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')
    end_time = datetime.datetime.strptime(data[-1]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f')

    execution_time = (end_time - start_time).total_seconds()

    if "batch_size" in data[0].keys():
        batch_size = int(data[0]['batch_size'])
    else:
        batch_size = len(data[0]['predictions'])
    odroids = []

    inferences = {}
    total_inferences = 0

    for line in data:
        src = line['src']
        prediction_location = str(''.join(line['prediction_location'].split(':')[0:2]))

        if "batch_size" in data[0].keys():
            local_batch_size = int(line['batch_size'])
        else:
            local_batch_size = len(data[0]['predictions'])

        if prediction_location not in inferences.keys():
            inferences[prediction_location] = {line['model']: local_batch_size}
        elif line['model'] not in inferences[prediction_location].keys():
            inferences[prediction_location][line['model']] = local_batch_size
        else:
            inferences[prediction_location][line['model']] += local_batch_size

        total_inferences += local_batch_size

    print "Execution time (s) " + str(execution_time)
    print "Batch size: " + str(batch_size)
    print "Odroids used: " + str(inferences.keys())
    print "Total Inferences: " + str(total_inferences)
    print "Throughput: " + str(total_inferences / execution_time) + " I/S"
    print "Inferences per Odroid"
    for x in inferences:
        print " " + str(x) + ": "
        for model in inferences[x]:
            print " \t" + str(model) + ": " + str(inferences[x][model])


if __name__ == "__main__":
    data = read_log.read_file(sys.argv[1])
    start(data)
