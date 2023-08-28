import serial
from time import sleep

port = 'COM13'  # change this to YOUR usb port
ser = serial.Serial(port, 9600, timeout=5)

delay = 1
tap_delay = 2
ready_delay = 3
off_delay = .5

# NOTE: The usb relay defined below is being mangled when submitting this review.
# Remove the begin & ending "\" to restore the proper usb relay definition.
# Example: The begin "\[" should be "[". And the end "\]" should be "]"
usbrelay = [
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

def ch_9_on_off():
    ser.write(usbrelay[9][1])
    sleep(delay)
    ser.write(usbrelay[9][0])
    sleep(off_delay)

def ch_10_on_off():
    ser.write(usbrelay[10][1])
    sleep(delay)
    ser.write(usbrelay[10][0])
    sleep(off_delay)

def ch_11_on_off():
    ser.write(usbrelay[11][1])
    sleep(delay)
    ser.write(usbrelay[11][0])
    sleep(off_delay)

def ch_12_on_off():
    ser.write(usbrelay[12][1])
    sleep(delay)
    ser.write(usbrelay[12][0])
    sleep(off_delay)

def usb_1_ON():
    ser.write(usbrelay[1][1] + usbrelay[2][1])
    sleep(ready_delay)

def usb_1_OFF():
    ser.write(usbrelay[1][0] + usbrelay[2][0])
    sleep(off_delay)

def usb_2_ON():
    ser.write(usbrelay[3][1] + usbrelay[4][1])
    sleep(ready_delay)

def usb_2_OFF():
    ser.write(usbrelay[3][0] + usbrelay[4][0])
    sleep(off_delay)

def usb_3_ON():
    ser.write(usbrelay[5][1] + usbrelay[6][1])
    sleep(ready_delay)

def usb_3_OFF():
    ser.write(usbrelay[5][0] + usbrelay[6][0])
    sleep(off_delay)

def usb_4_ON():
    ser.write(usbrelay[7][1] + usbrelay[8][1])
    sleep(ready_delay)

def usb_4_OFF():
    ser.write(usbrelay[7][0] + usbrelay[8][0])
    sleep(off_delay)

def main():
    ch_9_on_off()
    ch_10_on_off()
    ch_11_on_off()
    ch_12_on_off()
    usb_1_ON()
    usb_1_OFF()
    usb_2_ON()
    usb_2_OFF()
    usb_3_ON()
    usb_3_OFF()
    usb_4_ON()
    usb_4_OFF()

if __name__ == "__main__":
    main()

ser.close()
