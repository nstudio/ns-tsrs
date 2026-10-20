import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'app', 'benchmark-results.json');
const config = 'tsconfig.bench.json';
const checkers = 4;
const repetitions = 7;

if (!['darwin', 'linux'].includes(process.platform) || !existsSync('/usr/bin/time')) {
  throw new Error('This benchmark needs macOS or Linux with /usr/bin/time to measure peak RSS.');
}

const argumentsForCheck = ['-p', config, '--noEmit', '--checkers', String(checkers), '--pretty', 'false'];
const compilers = [
  {
    id: 'tsrs',
    name: 'tsrs',
    executable: path.join(root, 'node_modules', 'tsrs', 'bin', 'tsrs'),
  },
  {
    id: 'tsgo',
    name: 'TypeScript 7.1',
    executable: path.join(root, 'node_modules', 'typescript-benchmark', 'bin', 'tsc'),
  },
];

function execute(compiler, args, timed = false) {
  const useTime = timed;
  const timeArgs = process.platform === 'darwin' ? ['-l'] : ['-v'];
  const command = useTime ? '/usr/bin/time' : compiler.executable;
  const commandArgs = useTime ? [...timeArgs, compiler.executable, ...args] : args;
  const start = performance.now();
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
  });
  const elapsedMs = performance.now() - start;
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${compiler.id} exited ${result.status}\n${result.stdout}\n${result.stderr}`);
  }

  const macMemory = result.stderr.match(/(\d+)\s+maximum resident set size/);
  const linuxMemory = result.stderr.match(/Maximum resident set size \(kbytes\):\s*(\d+)/);
  const peakRssBytes = macMemory
    ? Number(macMemory[1])
    : linuxMemory
      ? Number(linuxMemory[1]) * 1024
      : null;

  return { stdout: result.stdout, elapsedMs, peakRssBytes };
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor(ordered.length / 2)];
}

function round(value, digits = 1) {
  return Number(value.toFixed(digits));
}

function listFiles(compiler) {
  return execute(compiler, ['-p', config, '--listFilesOnly']).stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(root));
}

const filesByCompiler = Object.fromEntries(compilers.map((compiler) => [compiler.id, listFiles(compiler)]));
const nativeFiles = (files) => files
  .filter((file) => file.includes('/node_modules/@nativescript/types-'))
  .map((file) => path.relative(root, file))
  .sort();
const tsrsNativeFiles = nativeFiles(filesByCompiler.tsrs);
const tsgoNativeFiles = nativeFiles(filesByCompiler.tsgo);

if (JSON.stringify(tsrsNativeFiles) !== JSON.stringify(tsgoNativeFiles)) {
  throw new Error('Compiler file lists differ for the NativeScript platform declarations.');
}

console.log(`NativeScript declarations: ${tsrsNativeFiles.length} identical files`);
for (const compiler of compilers) {
  execute(compiler, argumentsForCheck);
  console.log(`${compiler.id}: warmup passed`);
}

const samples = { tsrs: [], tsgo: [] };
for (let pass = 0; pass < repetitions; pass++) {
  const order = pass % 2 === 0 ? compilers : [...compilers].reverse();
  for (const compiler of order) {
    const run = execute(compiler, argumentsForCheck, true);
    samples[compiler.id].push({
      ms: round(run.elapsedMs),
      peakRssMiB: run.peakRssBytes === null ? null : round(run.peakRssBytes / 1048576),
    });
    console.log(`${String(pass + 1).padStart(2, '0')} ${compiler.id.padEnd(4)} ${round(run.elapsedMs)} ms`);
  }
}

const compilerResults = Object.fromEntries(compilers.map((compiler) => {
  const runs = samples[compiler.id];
  const memorySamples = runs.map((run) => run.peakRssMiB).filter((value) => value !== null);
  return [compiler.id, {
    version: execute(compiler, ['--version']).stdout.trim().replace(/^Version\s+/, ''),
    medianMs: round(median(runs.map((run) => run.ms))),
    medianPeakRssMiB: memorySamples.length ? round(median(memorySamples)) : null,
    samples: runs,
    files: filesByCompiler[compiler.id].length,
  }];
}));

const result = {
  recordedAt: new Date().toISOString(),
  machine: {
    cpu: os.cpus()[0]?.model ?? 'Unknown CPU',
    platform: `${os.type()} ${os.arch()}`,
    node: process.version,
  },
  workload: {
    config,
    checkers,
    repetitions,
    nativeDeclarations: tsrsNativeFiles.length,
    nativeDeclarationMiB: round(tsrsNativeFiles.reduce((total, file) => total + readFileSync(path.join(root, file)).byteLength, 0) / 1048576),
    includesVueSfc: false,
    skipLibCheck: true,
  },
  compilers: compilerResults,
  speedup: round(compilerResults.tsgo.medianMs / compilerResults.tsrs.medianMs, 2),
};

writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`\nMedian speedup: ${result.speedup}×. Saved app/benchmark-results.json`);
