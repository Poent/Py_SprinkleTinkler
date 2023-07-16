import serial
from time import sleep

port = 'COM4'  # change this to YOUR usb port
ser = serial.Serial(port, 9600, timeout=5)

delay = 0.1
tap_delay = 2
ready_delay = .5
off_delay = .5
relay_count = 17

# setup the array of commands to send to the relay
# Item zero is the status command and the status return
# Items 1-16 are the commands to turn on each channel
# Items 17-32 are the commands to turn off each channel
commandTable = [
    [b':FE0100200000FF\r\n', b':FE0100000010F1\r\n'],  # status & status return
    [b':FE0500000000FD\r\n', b':FE050000FF00FE\r\n'],  # channel-1
    [b':FE0500010000FC\r\n', b':FE050001FF00FD\r\n'],  # channel-2
    [b':FE0500020000FB\r\n', b':FE050002FF00FC\r\n'],  # channel-3
    [b':FE0500030000FA\r\n', b':FE050003FF00FB\r\n'],  # channel-4
    [b':FE0500040000F9\r\n', b':FE050004FF00FA\r\n'],  # channel-5
    [b':FE0500050000F8\r\n', b':FE050005FF00F9\r\n'],  # channel-6
    [b':FE0500060000F7\r\n', b':FE050006FF00F8\r\n'],  # channel-7
    [b':FE0500070000F6\r\n', b':FE050007FF00F7\r\n'],  # channel-8
    [b':FE0500080000F5\r\n', b':FE050008FF00F6\r\n'],  # channel-9
    [b':FE0500090000F4\r\n', b':FE050009FF00F5\r\n'],  # channel-10
    [b':FE05000A0000F3\r\n', b':FE05000AFF00F4\r\n'],  # channel-11
    [b':FE05000B0000F2\r\n', b':FE05000BFF00F3\r\n'],  # channel-12
    [b':FE05000C0000F1\r\n', b':FE05000CFF00F2\r\n'],  # channel-13
    [b':FE05000D0000F0\r\n', b':FE05000DFF00F1\r\n'],  # channel-14
    [b':FE05000E0000FF\r\n', b':FE05000EFF00F0\r\n'],  # channel-15
    [b':FE05000F0000FE\r\n', b':FE05000FFF00FF\r\n'],  # channel-16
    [b':FE0F00000010020000E1\r\n', b':FE0F0000001002FFFFE3\r\n']  # all channels
]

relay_states = [False] * relay_count

def control_channel(channel, on):
    # First check if the state has changed
    if relay_states[channel - 1] != on:
        # If it has, update the state in the array and change the actual relay
        relay_states[channel - 1] = on
        if on:
            print_and_write(commandTable[channel][1])
            sleep(delay)
        else:
            print_and_write(commandTable[channel][0])
            sleep(off_delay)


def print_and_write(command):
    print("Command to send: ", command)
    ser.write(command)

# get the relay_states
def get_status():
    return relay_states

def turn_on_all_relays():
    print_and_write(commandTable[17][1])

def turn_off_all_relays():
    print_and_write(commandTable[17][0])








