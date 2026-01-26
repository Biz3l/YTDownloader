import { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
import { pipeline } from 'node:stream/promises';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

try {
  // Just exists when the app is installed via squirrel
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (_) {
  // Build zip/portable may not have this module, and it's allright
}


if (process.platform === 'win32') {
  app.setAppUserModelId('com.ytdownloader.app');
}

const iconPath = path.join(__dirname, 'src/Resources', 'YTDownloaderlogo.ico');
const trayPath = path.join(__dirname, 'src/Resources', 'YTDownloaderlogo.png');

const trayIcon = nativeImage.createFromPath(trayPath);
trayIcon.resize({ width: 16, height: 16 });



// handle ytdl on electron

ipcMain.handle("yt:getMetadata", async (_, url) => {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error("Invalid YouTube URL");
    }
    const data = await ytdl.getInfo(url); // Pega info da URL passada

    return (
      {
        thumbnail: data.videoDetails.thumbnails,
        id: data.videoDetails.videoId,
        videoName: data.videoDetails.title,
        description: data.videoDetails.description,
        author: data.videoDetails.author.name,
        authorProfilePic: data.videoDetails.author.thumbnails[0].url,
        viewCount: data.videoDetails.viewCount,
        likeCount: data.videoDetails.likes,
      }
    )

  } catch (err) {
    return { error: err.message };
  }
});

// Ytdl for downloading
ipcMain.handle("yt:downloadVideo", async (_, url, format) => {
    function sanitizeFileName(name) {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim();
  }
  try {
    if(!ytdl.validateURL(url)) {
      return ("Invalid URL");
    };
    
    const validFormats = [".mp4", ".mp3"];
    if (!validFormats.includes(format)){
      return ("Invalid Format!");
    };

    const videoInfo = await ytdl.getInfo(url);
    const videoTitle = videoInfo.videoDetails.title;
    let downloadPath = await path.join(app.getPath('downloads'), `${sanitizeFileName(videoTitle)}${format}`);


    if (format === ".mp4") {
      const videoStream = ytdl(url, {
        quality: "highestvideo",
        filter: "videoandaudio",
      });

      const fileStream = fs.createWriteStream(downloadPath);

      await pipeline(videoStream, fileStream);

      return {
        success: true,
        filePath: downloadPath,
      };

      } else if (format === ".mp3") {
        const videoStream = ytdl(url, {
        quality: "highestvideo",
        filter: "videoandaudio",
      });
      
      downloadPath = await path.join(app.getPath('downloads'), `${sanitizeFileName(videoTitle)}.mp4`);

      const fileStream = fs.createWriteStream(downloadPath);

      await pipeline(videoStream, fileStream);
      
      let ffmpegExecPath;

      if (app.isPackaged) {
        ffmpegExecPath = path.join(
          process.resourcesPath, 'ffmpeg.exe'
        );
      } else {
        ffmpegExecPath = ffmpegPath;
      }

      ffmpeg.setFfmpegPath(ffmpegExecPath);

      await new Promise((resolve, reject) => {
        ffmpeg(downloadPath)
        .toFormat('mp3')
        .save(path.join(
          app.getPath('downloads'), `${sanitizeFileName(videoTitle)}.mp3`
      )
    )
        .on('end', resolve)
        .on('error', reject);
      });

      
      await fs.promises.unlink(downloadPath, (error => {
        if (error) {
          return {
            result: error,
            message: "An error ocurred while trying to delete the file",
          };
        } else {
          return {
            result: "file Succesfully deleted",
          }
        }
      }));



      return {
        success: true,
        filePath: path.join(
          app.getPath('downloads'), `${sanitizeFileName(videoTitle)}.mp3`)
      }
    }
    
    } catch (error) {
      return {error: error.message};
  }
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}


let tray;

const createWindow = () => {
  tray = new Tray(trayIcon);
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    center: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  
// Handle titlebar commands

  ipcMain.on("app/close", () => {
  mainWindow.close();
  })

  ipcMain.on("app/minimize", () => {
    mainWindow.minimize();
  })

  ipcMain.on("app/fullscreen", () => {
    if (!mainWindow.fullScreen) {
      mainWindow.setFullScreen(true);
    } else {
      mainWindow.setFullScreen(false);
    }
  })

  ipcMain.on("app/devTools", () => {
      mainWindow.webContents.toggleDevTools();
  })

mainWindow.webContents.on("context-menu", (e, params) => {
    const menu = Menu.buildFromTemplate([
      { role: "cut", enabled: params.editFlags.canCut },
      { role: "copy", enabled: params.editFlags.canCopy },
      { role: "paste", enabled: params.editFlags.canPaste },
      { type: "separator" },
      { role: "selectAll" }
    ]);

    menu.popup();
});

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.