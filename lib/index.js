import path from "path"
import _ from "lodash"
import { Command } from "commander"
import fs from "fs-extra"
import spider from "./spider.js"
import languageMap from "./language.js"
import { errorLog, print } from "./log.js"
import { appDirectory } from "./paths.js"

const program = new Command()

program
  .name("lc-spider")
  .option(
    "-c, --config <path>",
    "Specifie config file path, The file type must be json. Or create an lc-config.json file in the root directory",
    "lc-config.json",
  )
  .parse(process.argv)

const options = program.opts()

spider(mergeConfig(checkConfigFile(tryLoadConfig())))

function tryLoadConfig() {
  try {
    const configFilePath = path.resolve(appDirectory, options.config)
    const config = fs.readFileSync(configFilePath, {
      encoding: "utf-8",
    })
    return JSON.parse(config)
  } catch (error) {
    errorLog("Failed to load config. ")
    print(
      "Specifie config file path, The file type must be json. Or create an lc-config.json file in the root directory",
    )
    process.exit(1)
  }
}

function checkConfigFile(config) {
  let exit = false
  if (!config.username) {
    exit = true
    errorLog("CheckConfigFile Error: Missing username field.")
  } else if (!config.password) {
    exit = true
    errorLog("CheckConfigFile Error: Missing passwork field.")
  } else if (!config.languages) {
    exit = true
    errorLog("CheckConfigFile Error: Missing languages field.")
  } else if (!_.isArray(config.languages)) {
    exit = true
    errorLog("CheckConfigFile Error: Languages must be array.")
  }

  let noSupported = null
  const leetcodeLang = []
  _.forEach(config.languages, (language) => {
    const temp = languageMap[language]
    if (!temp) {
      return (noSupported = language)
    }
    leetcodeLang.push(temp)
  })
  if (noSupported !== null) {
    exit = true
    errorLog(
      `CheckConfigFile Error: No supported ${noSupported} programing language`,
    )
  }

  if (exit) {
    process.exit(1)
  }

  return {
    ...config,
    languages: leetcodeLang,
  }
}

function mergeConfig(config) {
  const defaultConfig = { output: "./questions", translate: true }
  return { ...defaultConfig, ...config }
}
