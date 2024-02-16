
# Bad Apple by Bots




## Video
[![Bad Apple!! Played on Minecraft Shields by 500 Bots](http://img.youtube.com/vi/ixX6J-4tvaE/0.jpg)](https://youtu.be/ixX6J-4tvaE "Bad Apple!! Played on Minecraft Shields by 500 Bots")
## Installation

Install nodejs with Nix. (optional if already installed.)
```
nix flake dev
```
! Install packages
```
npm install
```
## Usage

The start coordinates must always be greater than the end coordinates.

**Bots are not working on the Z axis** yet, so `sz` should be equal to `ez`.
```sh
npm start -- --offset <X+n> <Y+n> <WIDTH-n> <HEIGHT-n> \
             -sx 50 -sy 50 -sz 0 --host localhost
             -ex 30 -ey 30 -ez 0 --port 25565
```
Convert video.mp4 into a matrix for bots (the size of the matrix is changed by editing convert.py, by default it is 18x18)
```sh
python3 convert.py
```