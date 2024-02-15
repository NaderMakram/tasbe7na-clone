﻿const {
  app,
  BrowserWindow,
  screen,
  ipcMain,
  autoUpdater,
} = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const fs = require("fs");
const Fuse = require("fuse.js");
// const { autoUpdater } = require("electron-updater")

// auto update
// const { updateElectronApp } = require("update-electron-app");
// updateElectronApp();

// if (!isDev) {
//   const server = "https://update.electronjs.org";
//   const feed = `${server}/OWNER/REPO/${process.platform}-${
//     process.arch
//   }/${app.getVersion()}`;
//   autoUpdater.setFeedURL(feed);
//   app.on("ready", () => {
//     autoUpdater.checkForUpdates();
//   });
// }

let fastSearch = true;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}
// console.time("MappingSongs");
const songsDB = JSON.parse(
  fs.readFileSync(path.join(__dirname, "chapters_only.json"), "utf-8")
);
// console.log(songsDB);

// Map your songs array and create searchable content for each song
console.time("creating content time:");
// const songsWithSearchableContent = songsDB.map((song) => {
//   return {
//     ...song,
//     searchableContent: createSearchableContent(song),
//   };
// });
console.timeEnd("creating content time:");
// console.timeEnd("MappingSongs");

const deepFuse = new Fuse(songsDB, {
  includeScore: true,
  threshold: 0.1, // Adjust as needed
  // location: 200,
  // distance: 1000,
  ignoreLocation: true,
  minMatchCharLength: 0,
  // includeMatches: true,
  shouldSort: true,
  keys: ["chapter_book_short", "chapter_book"],
  // keys: [
  //   {
  //     name: "chapter_book_short",
  //     weight: 0.5,
  //   },
  //   {
  //     name: "chapter_book",
  //     weight: 0.1,
  //   },
  // ],
});

// Function to create a searchable content string for each song
function createSearchableContent(song) {
  const { title, chorus, verses } = song;
  const chorusText = chorus ? chorus.join(" ") : "";
  const versesText = verses
    ? verses.map((verse) => verse.join(" ")).join(" ")
    : "";
  const content = normalize(`${title} ${chorusText} ${versesText}`);

  // Remove duplicate words
  // const uniqueWords = [...new Set(content.split(" "))];
  // const uniqueContent = uniqueWords.join(" ");

  return content;
  return uniqueContent;
}

// normalize text
function normalize(text) {
  return (
    text
      .replace(/أ|آ|إ|ا/g, "ا") // Treat أ, إ, and ا as the same
      .replace(/ى|ي/g, "ي")
      .replace(/س|ث/g, "س")
      .replace(/ق|ك/g, "ك")
      .replace(/ه|ة/g, "ه")
      .replace(/ذ|ظ|ز/g, "ز")
      .replace(/ء|ؤ|ئ/g, "ء")
      // .replace(/َ|ً|ُ|ٌ|ِ|ٍ|ّ/g, "");
      .replace(/[ًٌٍَُِّْ~ـٰ]/g, "")
  ); // Remove Arabic diacritics
}
function filterVerse(text) {
  // Extract letters and numbers using regular expressions
  const lettersMatch = text.match(/[\u0600-\u06FF]+/g);
  const numbersMatch = text.match(/\d+/g);

  // Check if matches are null and handle accordingly
  const letters = lettersMatch ? lettersMatch.join("") : "";
  const numbers = numbersMatch ? numbersMatch.join("") : "";

  // Return letters followed by a space and then numbers
  return letters + " " + numbers;
}

// Function to search for songs
function searchSongs(event, term) {
  const normalizedTerm = normalize(term);
  console.time("searching time");
  // console.log(BrowserWindow.getAllWindows());
  // console.log(fastSearch);
  let results;

  // results = deepFuse.search(filterVerse(term).split(/\s+/).reverse().join(" "));
  text_in_term = term.match(/[\u0600-\u06FF]+/g);
  if (text_in_term) {
    results = deepFuse.search(text_in_term[0]);

    console.log(term.replace(/[\d\b]/g, ""));
    console.timeEnd("searching time");
    console.log(results);
    return results;
  }
}

const handleSetTitle = (event, title) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
};

function readJson() {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "tasbe7naDB.json"), "utf-8")
  );
}
app.on("ready", () => {
  ipcMain.on("set-title", handleSetTitle);
  ipcMain.handle("search-songs", searchSongs);
  ipcMain.on("flip-searching-mode", () => (fastSearch = !fastSearch));
  ipcMain.handle("read-json", readJson);
  // const container = document.getElementById("jsoneditor");
  // const options = {};
  // const editor = new JSONEditor(container, options);
});

let mainWindow;
const createMainWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: path.join(__dirname, "assets", "taraneem logo transparent.png"),
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // mainWindow.maximize();

  // remove menu
  mainWindow.removeMenu();

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    app.quit();
  });
};

// song window
let songWindow;

const createSongWindow = () => {
  const displays = screen.getAllDisplays();
  if (displays.length > 1 && !isDev) {
    const secondScreen = displays[1];
    songWindow = new BrowserWindow({
      width: secondScreen.size.width,
      height: secondScreen.size.height,
      icon: path.join(__dirname, "assets", "taraneem logo transparent.png"),
      x: secondScreen.bounds.x,
      y: secondScreen.bounds.y,
      frame: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        // contextIsolation: false,
        preload: path.join(__dirname, "songPreload.js"),
      },
    });
    songWindow.setFullScreen(true);
  } else {
    songWindow = new BrowserWindow({
      width: 500,
      height: 400,
      icon: path.join(__dirname, "assets", "taraneem logo transparent.png"),
      webPreferences: {
        nodeIntegration: true,
        // contextIsolation: false,
        preload: path.join(__dirname, "songPreload.js"),
      },
    });
  }

  songWindow.removeMenu();
  // and load the index.html of the app.
  songWindow.loadFile(path.join(__dirname, "song.html"));

  // remove menu
  songWindow.on("closed", () => {
    app.quit();
  });
  if (isDev) {
    songWindow.webContents.openDevTools();
  }
};

app.on("ready", createMainWindow);
app.on("ready", createSongWindow);
app.on("ready", addIPCs);
app.on("ready", () => {
  let currentVersion = app.getVersion();
  mainWindow.webContents.executeJavaScript(
    `document.querySelector('#version').textContent =("version: ${currentVersion}")`
  );
});
function addIPCs() {
  ipcMain.on("update-song-window", (event, content) => {
    songWindow.webContents.send("update-song-window", content);
    songWindow.webContents.executeJavaScript(`
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    `);
    if (content != "") {
      mainWindow.webContents.executeJavaScript(
        `
        element = document.querySelector('.active');
        if(element){

          elementRect = element.getBoundingClientRect();
          absoluteElementTop = elementRect.top + window.pageYOffset;
          middle = absoluteElementTop - (window.innerHeight / 2);
          window.scrollTo({
            top: middle,
            left: 0,
            behavior: "smooth",
          });
        }
        `
      );
    }
  });
}

ipcMain.on("update-font-size", (event, message) => {
  songWindow.webContents.send("update-font-size", message);
});
ipcMain.on("update-font-weight", (event) => {
  songWindow.webContents.send("update-font-weight");
});
ipcMain.on("toggle-dark-mode", (event) => {
  songWindow.webContents.send("toggle-dark-mode");
});

// verse number shortcut
ipcMain.on("shift-to-slide", (event, message) => {
  mainWindow.webContents.send("shift-to-slide", message);
});

// move screen when pressing up or down arrow
ipcMain.on("scroll-to-active", (event, message) => {
  // mainWindow.webContents.executeJavaScript(
  //   `window.scrollBy({top: ${message},left: 0,behavior : 'smooth'})`
  // );
  // mainWindow.webContents.executeJavaScript(
  //   `document.querySelector('.active').scrollIntoView({behavior: "smooth", block: "center", inline: "center" });
  //   `
  // );
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
