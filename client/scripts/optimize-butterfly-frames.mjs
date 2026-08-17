import { spawn } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const EXPECTED_FRAME_COUNT = 241;
const FRAME_PATTERN = /^frame-\d{4}\.webp$/;
const CONCURRENT_ENCODERS = 2;
const FFMPEG_COMMAND = process.env.BUTTERFLY_FFMPEG_PATH || "ffmpeg";

const clientRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceDirectory = path.join(
  clientRoot,
  "assets-source",
  "butterfly-transformation",
  "transparent",
);
const outputRoot = path.join(
  clientRoot,
  "public",
  "animations",
  "butterfly-transformation",
  "v2",
);

const tiers = [
  {
    name: "w1280",
    width: 1280,
  },
  {
    name: "w1920",
    width: 1920,
  },
];

function runFfmpeg(sourcePath, outputPath, width) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      FFMPEG_COMMAND,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        sourcePath,
        "-vf",
        `scale=${width}:-2:flags=lanczos`,
        "-frames:v",
        "1",
        "-c:v",
        "libwebp",
        "-lossless",
        "0",
        "-preset",
        "picture",
        "-quality",
        "80",
        "-pix_fmt",
        "yuva420p",
        outputPath,
      ],
      {
        stdio: "inherit",
      },
    );

    child.once("error", reject);
    child.once("exit", (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`FFmpeg exited with code ${exitCode}.`));
    });
  });
}

async function encodeJobs(jobs) {
  let nextJobIndex = 0;

  async function worker() {
    while (nextJobIndex < jobs.length) {
      const job = jobs[nextJobIndex];
      nextJobIndex += 1;

      await runFfmpeg(job.sourcePath, job.outputPath, job.width);
    }
  }

  await Promise.all(
    Array.from(
      {
        length: Math.min(CONCURRENT_ENCODERS, jobs.length),
      },
      () => worker(),
    ),
  );
}

const sourceFrames = (await readdir(sourceDirectory))
  .filter((fileName) => FRAME_PATTERN.test(fileName))
  .sort();

if (sourceFrames.length !== EXPECTED_FRAME_COUNT) {
  throw new Error(
    `Expected ${EXPECTED_FRAME_COUNT} source frames, found ${sourceFrames.length}.`,
  );
}

const jobs = [];

for (const tier of tiers) {
  const outputDirectory = path.join(outputRoot, tier.name);

  await mkdir(outputDirectory, {
    recursive: true,
  });

  for (const fileName of sourceFrames) {
    jobs.push({
      sourcePath: path.join(sourceDirectory, fileName),
      outputPath: path.join(outputDirectory, fileName),
      width: tier.width,
    });
  }
}

await encodeJobs(jobs);

for (const tier of tiers) {
  const outputFrames = (await readdir(path.join(outputRoot, tier.name))).filter(
    (fileName) => FRAME_PATTERN.test(fileName),
  );

  if (outputFrames.length !== EXPECTED_FRAME_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_FRAME_COUNT} ${tier.name} frames, found ${outputFrames.length}.`,
    );
  }
}

process.stdout.write(
  `Generated ${EXPECTED_FRAME_COUNT} transparent frames for ${tiers.length} responsive tiers.\n`,
);
