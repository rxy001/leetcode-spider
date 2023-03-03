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

function snippet(solutions) {
  return `\n${_.reduce(
    solutions,
    (str, solution) =>
      `\n${str}\n${solution.lang}\n\`\`\`${solution.lang}\n${solution.code}\n\`\`\``,
    "",
  )}`
}

export const appendToMD = (solutions, output) => {
  try {
    fs.appendFileSync(output, snippet(solutions))
    return output
  } catch (error) {
    errorLog(`AppendToMD Error: ${error}. `)
    return null
  }
}

function generateMDImpl() {
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

      fs.writeFileSync(
        filePath,
        `${result.title}\n${result.content}${snippet(solutions)}`,
      )
      return filePath
    } catch (err) {
      errorLog(
        `GenerateMD Error: When attempting to generate the file for ${result.title}.md ${err}`,
      )
      return null
    }
  }
}

export const generateMD = generateMDImpl()
