<template>
    <div id="wallpaper">
        <el-container>
            <div id="bg">
                <!-- <img :src="backgroundImageUrl" alt="background-image"> -->
                <img v-bind:src="backgroundImageUrl" alt="background-image">
            </div>
            <el-main>
                <el-row :gutter='10'>
                    <el-col :span='8'>
                        <el-card>
                            <div slot="header" class="clearfix">
                                <span>桌面图标</span>
                                <el-button style="float: right; padding: 3px 0" type="text" v-on:click="refreshPage" icon="el-icon-refresh">刷新</el-button>
                            </div>
                            <div class="icon-box">
                              <el-row>
                                  <el-col class="icon-item" :span="8" v-for="(item, index) in tableFile" :key="index" v-on:dblclick.native="openItem(item.path)">
                                      <img v-bind:src="item.icon" alt="icon">
                                      <span>{{ item.filename }}</span>
                                  </el-col>
                              </el-row>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span='8'>
                      <el-card>
                          <div slot="header" class="clearfix">
                              <span>常用软件</span>
                              <el-button style="float: right; padding: 3px 0" type="text" v-on:click="addIcon" icon="el-icon-refresh">添加</el-button>
                              <el-button style="float: right; padding: 3px 0" type="text" v-on:click="setBackgroundPath" icon="el-icon-tickets">更换壁纸</el-button>
                          </div>
                          <div class="icon-box">
                            <el-row>
                                <el-col class="icon-item" :span="8" v-for="(item, index) in customIcon" :key="index" v-on:dblclick.native="openItem(item.path)">
                                    <img v-bind:src="item.icon" alt="icon">
                                    <span>{{ item.filename }}</span>
                                </el-col>
                            </el-row>
                          </div>
                      </el-card>
                    </el-col>
                    <el-col :span='8'></el-col>
                </el-row>
            </el-main>
            <el-footer>
              <el-row type="flex" justify="end">
                <el-col :span="6">
                  <span>{{ time }}</span>
                </el-col>
              </el-row>
            </el-footer>
        </el-container>
    </div>
</template>
<style scoped>
  /* #bg {
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      z-index: -1;
  }

  #bg img {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      min-width: 50%;
      min-height: 50%;
  } */

  #bg {
    position:fixed;
    z-index: -1;
    top:0;
    left:0;
    right:0;
    bottom:0;
  }

  #bg img{
    width: 100%;
    height: 100%;
    object-fit:cover;
}

  .clearfix:before,
  .clearfix:after {
  display: table;
  content: "";
  }

  .clearfix:after {
  clear: both
  }

  .el-card {
    background-color: rgba(255, 255, 255, 0.4);
    border-color: transparent;
  }
  .icon-box {
    height: 50vh;
    overflow:auto
  }
  ::-webkit-scrollbar {
    display: none;
  }
  .icon-item img {
    display: block;
    margin: auto;
  }
  .icon-item span {
    height: 18px;
    display: block;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .el-footer span{
    font-size: 5vh
  }
</style>
<script>
import {remote} from 'electron'
import fs from 'fs'
import path from 'path'

export default {
  data () {
    return {
      tableFile: [],
      customIcon: [],
      time: '',
      backgroundImageUrl: '',
      config: {imagePath: ''}
    }
  },
  mounted () {
    this.getConfig()
    this.getDesktopIcon()
    this.refreshTime()
    this.getCustomIcon()
    this.ignoreMouse()
    console.log('mounted', this.config)
  },
  methods: {
    setBackgroundPath () {
      let defaultPath = remote.app.getPath('pictures')
      let backgroundPath = remote.dialog.showOpenDialog({defaultPath: defaultPath, properties: ['openDirectory']})
      this.$db.update({type: 'config'}, {$set: {type: 'config', imagePath: backgroundPath[0]}}, {upsert: true}, (err, result) => {
        if (err) {
          console.log(err)
        }
      })
      this.getConfig()
      this.changeImage()
    },
    getConfig () {
      let self = this
      self.$db.findOne({type: 'config'}, (err, result) => {
        if (err) {
          console.log(err)
        }
        if (result === null) {
          return
        }
        if (result.hasOwnProperty('imagePath')) {
          self.config = result
          console.log('getConfig', self.config)
          if (this.config.imagePath !== '') {
            this.changeImage()
          } else {
            this.backgroundImageUrl = 'https://i.loli.net/2018/10/16/5bc5c350bd3c4.jpg'
          }
        }
      })
    },
    getDesktopIcon () {
      let deskPath = remote.app.getPath('desktop')
      let publicPath = 'C:\\Users\\Public\\Desktop'
      let deskFiles = fs.readdirSync(deskPath)
      let publicFiles = fs.readdirSync(publicPath)
      let icons = []
      deskFiles.map((file) => {
        let fullPath = path.join(deskPath, file)
        if (fullPath.indexOf('.lnk') === -1) {
          remote.app.getFileIcon(fullPath, (err, icon) => {
            if (err) {
              console.log(err)
            }
            let iconSrc = icon.toDataURL()
            icons.push({filename: file, icon: iconSrc, path: fullPath})
          })
        } else {
          let targetPath = remote.shell.readShortcutLink(fullPath)
          remote.app.getFileIcon(targetPath.target, (err, icon) => {
            if (err) {
              console.log(err)
            }
            let iconSrc = icon.toDataURL()
            icons.push({filename: file, icon: iconSrc, path: fullPath})
          })
        }
      })
      publicFiles.map((file) => {
        let fullPath = path.join(publicPath, file)
        if (fullPath.indexOf('.lnk') === -1) {
          remote.app.getFileIcon(fullPath, (err, icon) => {
            if (err) {
              console.log(err)
            }
            let iconSrc = icon.toDataURL()
            icons.push({filename: file, icon: iconSrc, path: fullPath})
          })
        } else {
          let targetPath = remote.shell.readShortcutLink(fullPath)
          remote.app.getFileIcon(targetPath.target, (err, icon) => {
            if (err) {
              console.log(err)
            }
            let iconSrc = icon.toDataURL()
            icons.push({filename: file, icon: iconSrc, path: fullPath})
          })
        }
      })
      this.tableFile = icons
    },
    openItem (path) {
      remote.shell.openItem(path)
    },
    addIcon () {
      let _self = this
      let selectedFile = remote.dialog.showOpenDialog()
      console.log(selectedFile)
      for (let index = 0; index < selectedFile.length; index++) {
        const element = selectedFile[index]
        let filename = element.split('\\').pop()
        console.log(filename)
        if (selectedFile.indexOf('.lnk') === -1) {
          remote.app.getFileIcon(element, (err, icon) => {
            if (err) {
              console.log(err)
            }
            let iconSrc = icon.toDataURL()
            _self.$db.insert({type: 'icon', filename: filename, icon: iconSrc, path: element}, (err, newDoc) => {
              if (err) {
                console.log(err)
              }
              _self.customIcon.push(newDoc)
            })
          })
        } else {
          let targetPath = remote.shell.readShortcutLink(element)
          remote.app.getFileIcon(targetPath, (err, icon) => {
            if (err) {
              console.log(err)
            }
            let iconSrc = icon.toDataURL()
            _self.$db.insert({type: 'icon', filename: filename, icon: iconSrc, path: targetPath}, (err, newDoc) => {
              if (err) {
                console.log(err)
              }
              _self.customIcon.push(newDoc)
            })
          })
        }
      }
    },
    getCustomIcon () {
      let _self = this
      _self.$db.find({type: 'icon'}, (err, docs) => {
        if (err) {
          console.log(err)
        }
        _self.customIcon = docs
      })
    },
    ignoreMouse () {
      let win = remote.getCurrentWindow()
      let els = document.querySelectorAll('.el-card')
      for (const el of els) {
        el.addEventListener('mouseenter', () => {
          win.setIgnoreMouseEvents(false)
        })
        el.addEventListener('mouseleave', () => {
          win.setIgnoreMouseEvents(true, {forward: true})
        })
      }
    },
    changeImage () {
      let self = this
      let imagePath = self.config['imagePath']
      console.log(imagePath)
      let images = fs.readdirSync(imagePath)
      let index = Math.floor(Math.random() * images.length)
      self.backgroundImageUrl = path.join(imagePath, images[index])
      setTimeout(() => {
        self.changeImage()
      }, 1000 * 60 * 5)
    },
    refreshTime () {
      this.time = new Date().toLocaleString()
      setTimeout(() => {
        this.refreshTime()
      }, 500)
    },
    refreshPage () {
      let thisWindow = remote.getCurrentWindow()
      thisWindow.reload()
    }
  }
}
</script>
