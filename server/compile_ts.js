// 用来编译 miguApi

const fs = require('fs-extra');
const path = require('path');
const child_process = require('child_process');

const runShell = (txt) => {
  return new Promise((resolve, reject) => {
    child_process.exec(txt, (err, sto) => {
      resolve(sto);
    })
  })
}

(async () => {
  const miguList = fs.readdirSync(path.join(__dirname, 'miguApi/routes')).filter((v) => v.match(/\.ts$/))
  for (let file in miguList) {
    console.log(`tsc 编译中: ${file/1+1}/${miguList.length+1}`);
    const p = path.join(__dirname, `miguApi/routes/${miguList[file]}`)
    // console.log(`tsc ${p}`);
    await runShell(`tsc ${p}`);
  }

  console.log(`tsc 编译中: ${miguList.length+1}/${miguList.length+1}`);
  // console.log(`tsc ${path.join(__dirname, `miguApi/app.ts`)}`);
  await runShell(`tsc ${path.join(__dirname, `miguApi/app.ts`)}`);
  console.log('tsc 编译完成');
})()