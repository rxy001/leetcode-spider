import fs from "fs-extra"
import { dirname as _dirname, resolve } from "path"
import _ from "lodash"
import { appDirectory } from "./paths.js"
import { errorLog } from "./log.js"

function ensureDirectoryExists(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExists(_dirname(dirname))
  fs.mkdirSync(dirname)
  return true
}

function generateMD() {
  const existsDir = {}

  return async function impl(
    question,
    questionInfo,
    solutions,
    output,
    translate,
  ) {
    const outputPath = resolve(appDirectory, output)
    if (!existsDir[outputPath]) {
      existsDir[outputPath] = ensureDirectoryExists(outputPath)
    }
    const {
      translatedTitle,
      translatedContent,
      content,
      title,
      questionFrontendId,
    } = questionInfo

    const result = {
      title: translate ? translatedTitle : title,
      content: translate ? translatedContent : content,
    }

    try {
      const fileName = `${questionFrontendId}.${result.title}.md`
      const filePath = resolve(outputPath, fileName)
      const code = `\n${_.reduce(
        solutions,
        (str, solution) =>
          `${str}\n${solution.lang}\n~~~${solution.lang}\n${solution.code}\n`,
        "",
      )}`
      const append = fs.existsSync(filePath)
      if (append) {
        fs.appendFileSync(filePath, code)
      } else {
        fs.writeFileSync(filePath, `${result.title}\n${result.content}${code}`)
      }

      return true
    } catch (err) {
      errorLog(
        `GenerateMD Error: When attempting to generate the file for ${result.title}.md ${err}`,
      )
      return false
    }
  }
}

export default generateMD()
