import _ from "lodash"
import fs from "fs-extra"
import { manifestPath } from "./paths.js"
import { errorLog } from "./log.js"

function Manifest() {
  this.data = {}
}

function format(solutions) {
  return _.reduce(
    solutions,
    (r, { lang, id, timestamp }) => ({
      ...r,
      [lang]: {
        id,
        timestamp,
      },
    }),

    {},
  )
}

/**
 * Add or modify question data in the manifest.
 *
 * @param {Array} questions
 */
Manifest.prototype.set = function set(translate, questions) {
  if (_.isArray(questions) && _.size(questions) | 0) {
    this.data = _.reduce(
      questions,
      (result, question) => {
        const { titleSlug, frontendQuestionId, solutions } = question
        const exists = this.data[frontendQuestionId]
        if (exists) {
          return {
            ...result,
            ...exists,
            ...format(solutions),
          }
        }
        return {
          ...result,
          [frontendQuestionId]: {
            titleSlug,
            ...format(solutions),
          },
        }
      },
      { translate },
    )
  }
}

Manifest.prototype.get = function get() {
  return this.data
}

/**
 * Read the manifest file in the root directory of the local project.
 *
 * @returns manifest data
 */
Manifest.prototype.readLocalFile = function readLocalFile() {
  try {
    const exists = fs.existsSync(manifestPath)
    if (exists) {
      const data = fs.readFileSync(manifestPath, { encoding: "utf8" })
      return (this.data = JSON.parse(data))
    }
    return this.data
  } catch (e) {
    errorLog(
      "Failed to read the manifest file in the local directory. Please delete it and call the CLI again.",
    )
    process.exit(1)
  }
}

/**
 * Write the manifest to the root directory of the local project.
 */

Manifest.prototype.writeToLocal = function writeToLocal() {
  if (_.size(this.data) | 0) {
    fs.writeFileSync(manifestPath, JSON.stringify(this.data, null, "\t"))
  }
}

Manifest.prototype.clear = function clear() {
  this.data = {}
}

export default new Manifest()
