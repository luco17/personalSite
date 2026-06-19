import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args) {
  const rendered = [command, ...args].join(" ");
  console.log(`\n> ${rendered}`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.error) {
    fail(`Command failed to start: ${rendered}\n${result.error.message}`);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function printUsage() {
  console.log(
    [
      "Usage: node ./scripts/pull-local-d1-from-remote.mjs --config <path> --persist-to <path> [--database <name>] [--env <name>] [--output <path>]",
      "",
      "Refresh a local Wrangler D1 state directory by exporting the configured remote D1 database and importing that SQL into local state.",
    ].join("\n"),
  );
}

function readOption(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    fail(`Missing value for ${flag}`);
  }
  return value;
}

const rawArgs = process.argv.slice(2);
const options = {
  config: null,
  persistTo: null,
  database: "pensieve-db",
  env: null,
  output: null,
};

for (let index = 0; index < rawArgs.length; index += 1) {
  const arg = rawArgs[index];

  if (arg === "--help") {
    printUsage();
    process.exit(0);
  }

  if (arg === "--config") {
    options.config = readOption(rawArgs, index, arg);
    index += 1;
    continue;
  }

  if (arg === "--persist-to") {
    options.persistTo = readOption(rawArgs, index, arg);
    index += 1;
    continue;
  }

  if (arg === "--database") {
    options.database = readOption(rawArgs, index, arg);
    index += 1;
    continue;
  }

  if (arg === "--env") {
    options.env = readOption(rawArgs, index, arg);
    index += 1;
    continue;
  }

  if (arg === "--output") {
    options.output = readOption(rawArgs, index, arg);
    index += 1;
    continue;
  }

  fail(`Unknown argument: ${arg}`);
}

if (!options.config) {
  fail("Missing required argument: --config");
}

if (!options.persistTo) {
  fail("Missing required argument: --persist-to");
}

const configPath = resolve(process.cwd(), options.config);
const persistToPath = resolve(process.cwd(), options.persistTo);
const outputPath = options.output
  ? resolve(process.cwd(), options.output)
  : resolve(dirname(persistToPath), "tmp", `${options.database}.remote.sql`);

mkdirSync(dirname(outputPath), { recursive: true });

const wranglerFlags = ["--config", configPath];
if (options.env) {
  wranglerFlags.push("--env", options.env);
}

run("npx", ["wrangler", "whoami"]);
run("npx", [
  "wrangler",
  "d1",
  "export",
  options.database,
  "--remote",
  "--output",
  outputPath,
  ...wranglerFlags,
]);

rmSync(persistToPath, { force: true, recursive: true });

run("npx", [
  "wrangler",
  "d1",
  "execute",
  options.database,
  "--local",
  "--persist-to",
  persistToPath,
  "--file",
  outputPath,
  ...wranglerFlags,
]);

console.log(
  [
    "",
    `Local D1 refreshed from remote '${options.database}'.`,
    `- SQL export: ${outputPath}`,
    `- Local state: ${persistToPath}`,
  ].join("\n"),
);
