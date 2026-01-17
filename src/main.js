import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
const ytdl = require("@distube/ytdl-core");

// handle ytdlcore on electron

ipcMain.handle("yt:getMetadata", async (_, url) => {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error("Invalid YouTube URL");
    }
    const data = await ytdl.getInfo(url);

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


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}




const createWindow = () => {
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  
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