#!/usr/bin/python
import json


def read_file(file_path):
    """
    Read output log file from Constellation RAID run
    :param file_path: Path to file
    :return: JSON object containing the output from the file
    """
    data = []
    with open(file_path) as f:
        for line in f:
            data.append(json.loads(line))
    return data
