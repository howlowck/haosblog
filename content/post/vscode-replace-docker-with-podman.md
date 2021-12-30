+++
images = []
banner = "img/vscode-replace-docker-podman.png"
menu = ""
description = "This is a walkthrough of how to replace Docker with Podman, and configure VSCode to use its VSCode DevContainer for both single and multiple-container scenarios."
categories = []
tags = []
date = "2020-12-30T15:44:52"
title = "Replacing Docker with Podman for your VSCode DevContainers"
draft = false
+++

# Replacing Docker with Podman for VSCode DevContainers

This is a walkthrough of how to replace Docker with Podman, and configure VSCode to use its VSCode DevContainer for both single and multiple-container scenarios.

While this walkthrough is **targeted for Windows WSL2 environment**, it theoretically would work with other platforms (such as Linux and [Intel Mac](https://podman.io/blogs/2021/09/06/podman-on-macs.html))

## 1. Installing Podman

1. Remove Docker Desktop
2. Install Podman: <https://www.redhat.com/sysadmin/podman-windows-wsl2>

   ```bash
   . /etc/os-release

   sudo sh -c "echo 'deb http://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/x${NAME}_${VERSION_ID}/ /' > /etc/apt/sources.list.d/devel:kubic:libcontainers:stable.list"

   wget -nv https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable/x${NAME}_${VERSION_ID}/Release.key -O Release.key

   sudo apt-key add - < Release.key
   sudo apt-get update -qq

   sudo apt-get -qq -y install podman

   sudo mkdir -p /etc/containers

   echo -e "[registries.search]\nregistries = ['docker.io']" | sudo tee /etc/containers/registries.conf
   ```

   > Note: the script above is the same as in the linked blog post above, **except for the last command** where we removed the `quay.io` registry entry. This is because during container creation, podman will open stdin to ask the user to select the registry if the same container name exists on multiple registries, VSCode won't open the stdin for you so the process just hangs.

3. Follow the link above to configure WSL2-specific instructions.
4. `podman info` to make sure everything looks good
5. Add `alias docker="podman"` to your dotfile (ie. `.bash_profile` or `.zshrc`, etc) for convenience and back-compatibility

## 2. Configuring VSCode DevContainer

1. Make sure you have the following settings: ![podman vscode settings](/vscode-replace-docker-podman/podman-vscode-settings.png)

2. Find a non-docker-compose `.devcontainer` project, and make sure it starts up and works properly.

## Troubleshooting Podman DevContainer

* `mkdir: cannot create directory '/root': Permission denied`
  
  * If you configured podman to be rootful and would like to run the devcontainer with root, then you can remove/comment out `remoteUser` in `devcontainer.json`.
  * If you want the devcontainer to be rootless, and you encountered the error above, add the following two values into your `.devcontainer/devcontainer.json`:

  ```jsonc
    "runArgs": ["--userns=keep-id"],
    "containerUser": "vscode", // the value needs to match the value of "remoteUser"
  ```

## 3. Install Podman-Compose and configure VSCode

1. Make sure you have `pip3` installed.
2. Right now, there are some commands missing in `podman-compose` for VSCode Devcontainer to work. [There is a PR out to address this.](https://github.com/containers/podman-compose/pull/394) Until the PR is merged, **you can run `pip3 install https://github.com/howlowck/podman-compose/archive/devel.tar.gz` in install the patched version.** Simply run `pip3 install podman-compose` once the patched version is merged into `stable`.
3. (Optional) You can add `alias docker-compose="docker-compose"` in your dotfile, but there might be some back-compat issues with docker-compose, [plenty of missing commands](https://github.com/containers/podman-compose/blob/stable/CONTRIBUTING.md#missing-commands-help-needed).
4. Update VSCode settings like so: ![podman-compose vscode settings](/vscode-replace-docker-podman/podman-compose-vscode-settings.png)

## Caveat

1. Podman needs the containers to be rootful for networking to work, so we need to comment out `remoteUser` in `devcontainer.json` if it's specified.

## Troubleshooting Podman-Compose

* `Error: error creating container storage: the container name "(name)" is already in use`
  
  Kill the containers by listing out the running container (`docker ps`) and killing them (`docker kill ...<container ids>`)
