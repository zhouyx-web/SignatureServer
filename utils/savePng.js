const fs = require('fs')
const publicSavePath = 'F:/Web-Projects/workspace/server-signature/public/upload/autograph/'

function savePng (uid, imgBase64) {
    const path = publicSavePath + uid + '.png'
    const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, "") //去掉图片base64码前面部分data:image/png;base64,
    const dataBuffer = Buffer.from(base64Data, 'base64')
    return new Promise((resolve, reject) => {
      fs.writeFile(path, dataBuffer, function(err) {
          if(err){
            console.log(err)
            reject()
          }else{
            resolve()
          }
      })
  })
}

module.exports = savePng