// 2D photo -> depth map (Depth Anything V2, runs locally on CPU, Apache-2.0 model). Usage:
//   node scripts/depth.mjs input.jpg output_depth.png [small|base]
// White = near, black = far. Feed photo + depth to the Photo3D composition (src/photo3d) to fly a camera through it.
import { pipeline, RawImage } from "@huggingface/transformers";
const [, , inp, out, size = "small"] = process.argv;
const model = size === "base" ? "onnx-community/depth-anything-v2-base" : "onnx-community/depth-anything-v2-small";
const depth = await pipeline("depth-estimation", model, { dtype: "fp32" });
const img = await RawImage.read(inp);
const t0 = Date.now();
const { depth: d } = await depth(img);
await d.resize(img.width, img.height).then((r) => r.save(out));
console.log("depth saved", out, img.width + "x" + img.height, ((Date.now() - t0) / 1000).toFixed(1) + "s", model);
