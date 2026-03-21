import { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
const fs = require("fs");

const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: "info",
    message: "Atualização pronta! Reiniciar agora?",
    buttons: ["Sim", "Depois"]
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

const youtubedl = require("yt-dlp-exec");


// Função para checar se é url do youtube
function isYouTubeUrl(url) {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return pattern.test(url);
}

try {
  // Só existe quando o app é instalado via squirrel
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (_) {
  // Build zip/portable pode não ter esse módulo, e tá tudo bem
}


if (process.platform === 'win32') {
  app.setAppUserModelId('com.ytdownloader.app');
}

const iconPath = path.join(__dirname, 'src/Resources', 'YTDownloaderlogo.ico');
const trayPath = path.join(__dirname, 'src/Resources', 'YTDownloaderlogo.png');

const trayIcon = nativeImage.createFromPath(trayPath);
trayIcon.resize({ width: 16, height: 16 });



/// handle ytdl on electron

ipcMain.handle("yt:getMetadata", async (_, url) => {
  try {
    if (!isYouTubeUrl(url)) {
      throw new Error("Invalid YouTube URL");
    }

    const info = await youtubedl(url, {
      dumpSingleJson: true,
      skipDownload: true,
      playlistItems: "1-20",
    });

    if (info.entries) {
      return {
        playlist: true,
        videoInfo: {
          id: info.id,
          title: info.title,
          uploader: info.uploader,
          entries: info.entries.filter(Boolean),
        },
      };
    } else {
      return {
        playlist: false,
        videoInfo: {
          thumbnail: info.thumbnails?.at(-1),
          id: info.id,
          videoName: info.title,
          description: info.description,
          author: info.uploader,
          authorProfilePic:
            info.channel_thumbnails?.at(-1)?.url || null,
          viewCount: info.view_count,
          likeCount: info.like_count,
        },
      };
    }
  } catch (err) {
    return { error: err.message };
  }
});


// Ytdlp for downloading
ipcMain.handle("yt:downloadVideo", async (_, url, format, downloadAll=false) => {
  const runDownload = (options) => {
    return new Promise((resolve, reject) => {
      const subprocess = youtubedl.exec(url, options);

      subprocess.stdout.on("data", (data) => {
        const text = data.toString();
        console.log("[yt-dlp]", text);


      
      subprocess.stderr.on("data", (data) => {
      console.log("[yt-dlp:err]", data.toString());
      });

      subprocess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp failed: ${code}`));
      });

      subprocess.on("error", reject);

      })
    })
  }

  const downloadPath = path.join(app.getPath('downloads'), "%(title)s.%(ext)s" );

  console.log("STARTING DOWNLOAD...");


  try {
    switch(format){
    case ".mp3":
      await runDownload({
        extractAudio: true,
        audioFormat: "mp3",
        ...(downloadAll ? {} : {noPlaylist: true}),
        ...(downloadAll && {playlistItems: "1-20"}),
        output: downloadPath,
      });
      break;
    
    case ".mp4":
      await runDownload(url, {
        format: "best[height<=720]",
        output: downloadPath,
        ...(downloadAll ? {} : {noPlaylist: true}),
      });
      break;
  }
  
  return {
    success: true,
    filePath: app.getPath('downloads')
  };
  
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }

  

});

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