import { Config } from '@remotion/cli/config';

// 4K 60 fps master settings.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(16); // visually lossless for YouTube 4K; use ProRes (see docs) if you grade afterwards
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto; lower it if 4K frames run out of memory
