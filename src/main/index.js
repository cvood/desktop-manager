'use strict'

import { app, BrowserWindow, screen, Tray, Menu } from 'electron'
import path from 'path'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let wins = []

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindows () {
  /**
   * Initial window options
   */
  createTray()
  let displays = screen.getAllDisplays()
  for (let index = 0; index < displays.length; index++) {
    const element = displays[index]
    createWindow(wins[index], element)
  }
}

function createWindow (mainWindow, display) {
  const {width, height} = display.workAreaSize
  mainWindow = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: width,
    height: height,
    frame: false,
    useContentSize: true,
    resizable: false,
    minimizable: false,
    skipTaskbar: true
  })

  mainWindow.loadURL(winURL)
  mainWindow.maximize()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

var tray = null

function createTray () {
  let iconPath = path.join(__static, 'trayIcon.png')
  tray = new Tray(iconPath)
  let trayMenu = Menu.buildFromTemplate([
    {label: 'quit', role: 'quit'}
  ])
  tray.setContextMenu(trayMenu)
}

app.on('ready', createWindows)
console.log(wins.length)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
