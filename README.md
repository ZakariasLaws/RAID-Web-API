# RAID Web API

A user interface for visualizing results and increasing usability of [RAID-Constellation](https://github.com/ZakariasLaws/RAID-constellation)

The website uses webpack for package management, NodeJS with express in the backend and ReactJS in the front end. ``

This website was made to demo the functionality of RAID, hence it is not fully tested and still contains many bugs.
Whenever the running instance is stopped, a `KILL SIGTERM` signal is sent to all devices for all running agents. This
should stop everything, but is not 100% fool-proof, so you might need to monitor and kill processes manually upon 
errors. This can be done from the terminal using `top` or `ps aux`.

## Setup, Dependencies and Running
Open a terminal window, clone the project and preform the following modifications.

Change the hardcoded `CONSTELLATION_BIN_DIR` path in `src/utils` and `models/constellation.model/js`.

Add the file `database/devices.json` with the content `[]`.

Install dependencies and start the NodeJS server as follows.

```shell script
git clone https://github.com/ZakariasLaws/RAID-Web-API
cd RAID-Web-Api
npm install
nodeamon
```

In a separate window, start watching the files using webpack:

```shell script
cd RAID-Web-Api
webpack -w
```

Wait a few seconds for both the server to start and the bundles to be created, then open your browser and navigate to 
`localhoist:3000`, this should show you the website.

## Usage
Use the navigation on the left side to toggle Device Management or Home (executing RAID). 

#### Device Management
Here you can add new remote devices. In order for the connection to work, ssh keys **MUST** have been exchanged between
the host running the web API and the remote device. In the backend, a ssh connection will be setup to the device and it
will use the ssh keys located in the `~/.ssh` folder. Follow this guide to setup and copy the appropriate key to the 
remote device: [https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2)

#### Home
First, make sure you understand how RAID works (see [RAID-Constellation](https://github.com/ZakariasLaws/RAID-constellation)).

To execute, start the server first after which the devices can be connected. Make sure to **always** start a target
before any other device.

Logs from each execution can be found in `/logs/<date>/<name-of-execution>/`. The logs include the output from all
devices as well as the result in a line-by-line JSON format (can be found in the target directory).
