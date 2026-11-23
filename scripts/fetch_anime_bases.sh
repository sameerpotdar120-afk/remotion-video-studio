#!/bin/bash
# Downloads the anime base models our characters are built on. Licences were checked inside each file (VRM meta):
#   Sakurada_Fumiriya, HairSample_Male, Sendagaya_Shibu, Darkness_Shibu : VRoid official samples, licenseName "CC0"
#   base_pixiv (VRM1_Constraint_Twist_Sample) : pixiv Inc., commercial + modification + redistribution allowed, credit unnecessary
set -e
cd "$(dirname "$0")/.."; mkdir -p public/anime
R=https://raw.githubusercontent.com
curl -sSL -o public/anime/Sakurada_Fumiriya.vrm $R/madjin/vrm-samples/master/vroid/beta/Sakurada_Fumiriya.vrm
curl -sSL -o public/anime/HairSample_Male.vrm $R/madjin/vrm-samples/master/vroid/beta/HairSample_Male.vrm
curl -sSL -o public/anime/Sendagaya_Shibu.vrm $R/madjin/vrm-samples/master/vroid/beta/Sendagaya_Shibu.vrm
curl -sSL -o public/anime/Darkness_Shibu.vrm $R/madjin/vrm-samples/master/vroid/beta/Darkness_Shibu.vrm
curl -sSL -o public/anime/base_pixiv.vrm $R/pixiv/three-vrm/dev/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm
ls -la public/anime
