import os
import platform
import mimetypes
import subprocess

python_version = platform.python_version_tuple()[0]

mimetypes.add_type("application/vnd.ms-fontobject", ".eot")
mimetypes.add_type("application/octet-stream", ".ttf")
mimetypes.add_type("application/font-woff", ".woff")
mimetypes.add_type("application/font-woff2", ".woff2")
mimetypes.add_type("application/font-woff", ".otf")
mimetypes.add_type("image/svg+xml", ".svg")

dir_path = os.path.dirname(os.path.realpath(__file__)) + "/public"

extensions = set()

for subdir, dirs, files in os.walk(dir_path):
    for file in files:
        filename, file_extension = os.path.splitext(file)
        extensions.add(file_extension)

for extension in extensions:
    mime = mimetypes.types_map[extension]
    command = [
        "az", 
        "storage", 
        "blob", 
        "upload-batch", 
        "-s", 
        "public", 
        "-d", 
        "public", 
        "--pattern", 
        "*"+extension, 
        "--content-type", 
        mime
    ]
    print(subprocess.check_output(command))

print('Purging CDN')

subprocess.check_output([
    "az",
    "cdn",
    "endpoint",
    "purge",
    "-g",
    "haosblog-rg",
    "-n",
    "haosblog",
    "--profile-name",
    "haos-premium-cdn",
    "--content-paths",
    "/*"
])

print('Purgin complete')