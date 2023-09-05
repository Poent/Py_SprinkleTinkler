from time import sleep


# setup an array to hold the state of each relay
relay_states = [False] * 17

# function to toggle the state of a relay
def control_channel(channel, on):
    # First check if the state has changed
    if relay_states[channel - 1] != on:
        # If it has, update the state in the array and change the actual relay
        relay_states[channel - 1] = on
        if on:
            print("Turning ON relay ", channel)
            sleep(0.1)
        else:
            print("Turning OFF relay ", channel)
            sleep(0.1)


def print_and_write(command):
    print("Command to send: ", command)

# get the relay_states
def get_status():
    return relay_states

def turn_on_all_relays():
    print_and_write("Turning ON all relays")

def turn_off_all_relays():
    print_and_write("Turning OFF all relays")








