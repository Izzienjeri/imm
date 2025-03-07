import os
directory = "./51/src/components/ui"

files = [f for f in os.listdir(directory) if os.path.join(directory, f)]

print(files)