const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const fs = require('node:fs');
const path = require('node:path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

// Read deps from package-lock (npm v7+ => lockfileVersion 2/3)
function getLockDepsTree(lock, pkgName) {
  // lock.packages (v2/v3) have keys from type node_modules/async 
  if (lock.packages) {
    const key = `node_modules/${pkgName}`;
    const entry = lock.packages[key];
    if (!entry) return [];
    return Object.keys(entry.dependencies || {});
  }

  // fallback: lock.dependencies (Old)
  if (lock.dependencies && lock.dependencies[pkgName]) {
    return Object.keys(lock.dependencies[pkgName].requires || {});
  }

  return [];
}

function collectAllDeps(lock, rootPkgs) {
  const seen = new Set();
  const queue = [...rootPkgs];

  while (queue.length) {
    const pkg = queue.shift();
    if (seen.has(pkg)) continue;
    seen.add(pkg);

    const deps = getLockDepsTree(lock, pkg);
    for (const d of deps) {
      if (!seen.has(d)) queue.push(d);
    }
  }

  return [...seen];
}


module.exports = {
  packagerConfig: {
    asar: true,
    asarUnpack: [
      '**/node_modules/ffmpeg-static/**'
    ],  
    icon: './src/Resources/icon.ico',
    extraResource: [
      path.join(__dirname, 'node_modules/ffmpeg-static', 'ffmpeg')  
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: './src/Resources/icon.ico', 
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options:{
          icon: path.join(__dirname, 'src/Resources', 'YTDownloaderlogo.png')
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
            target: 'preload',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
  hooks: {
    packageAfterPrune: async (_config, buildPath) => {
      const lockPath = path.join(process.cwd(), 'package-lock.json');
      if (!fs.existsSync(lockPath)) {
        throw new Error('package-lock.json não encontrado. Rode npm i para gerar.');
      }

      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

      // Root: all the main needs in runtime
      const roots = [
        'fluent-ffmpeg',
        'ffmpeg-static',
        '@distube/ytdl-core'
      ];


      // Take all the deps via lock
      const all = collectAllDeps(lock, roots);

      const destNodeModules = path.join(buildPath, 'node_modules');

      for (const mod of all) {
        const src = path.join(process.cwd(), 'node_modules', mod);
        const dest = path.join(destNodeModules, mod);

        if (fs.existsSync(src)) {
          copyDir(src, dest);
        } else {
          // Some deps may be optional in some platforms.
          // Just log, don't break the build
          console.warn(`⚠️ I didn't find ${mod} in node_modules (maybe optional).`);
        }
      }

      console.log(`✅ I'd copy all ${all.length} modules to the package (roots: ${roots.join(', ')})`);
    },
  },
};
