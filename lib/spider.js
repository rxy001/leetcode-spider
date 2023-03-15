import _ from "lodash"
import fs from "fs-extra"
import path from "path"
import request from "./axios.js"
import { generateMD, appendToMD } from "./markdown.js"
import { loginURL, graphql, appDirectory } from "./paths.js"
import {
  queryQuestionList,
  queryQuestionData,
  queryLastSubmission,
  querySubmissionDetail,
} from "./graphqlQueries.js"
import { errorLog, debug, print } from "./log.js"
import manifest from "./manifest.js"
import enqueueTask from "./enqueueTask.js"

export default async function spider(config) {
  const manifestData = manifest.readLocalFile()
  const { translate, output } = config
  if (
    manifestData.translate !== undefined &&
    manifestData.translate !== translate
  ) {
    manifest.clear()
    fs.rmSync(path.resolve(appDirectory, output), {
      recursive: true,
    })
  }

  await login(config)
  const questionList = await fetchACQuestions()
  if (!_.size(questionList)) {
    print("No questions have been solved yet.")
    process.exit(1)
  }
  const questions = await parallelFetch(questionList, config)
  const length = _.size(questions)
  if (!length) {
    print("No new questions have been solved yet.")
    process.exit(1)
  }
  print(`Add ${_.size(length)} new questions`)
  manifest.set(translate, questions)
  manifest.writeToLocal()
  print("It's over, my friend")
}

async function login(config) {
  try {
    const params = new URLSearchParams()
    params.append("csrfmiddlewaretoken", "")
    params.append("login", config.username)
    params.append("password", config.password)
    await request.post(loginURL, params, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    })
    print("Login successfully")
  } catch (error) {
    errorLog("Login Error:", error)
    process.exit(1)
  }
}

/**
 * Fetch the accepted solutions' list.
 *
 * @returns {Promise<Array>}
 */

async function fetchACQuestions() {
  print("Fetching accepted question list.")
  try {
    const list = []
    let hasMore = true
    while (hasMore) {
      let questions = []
      ;({
        problemsetQuestionList: { questions, hasMore },
        // eslint-disable-next-line no-await-in-loop
      } = await request.post(graphql, {
        variables: {
          categorySlug: "",
          skip: _.size(list),
          limit: 50,
          filters: { status: "AC" },
        },
        query: queryQuestionList,
      }))
      list.push(...questions)
    }
    return list
  } catch (error) {
    errorLog("FetchACQuestions Error:", error.message)
    process.exit(1)
  }
}

async function parallelFetch(questions, config) {
  print(
    "Fetching questions and solutions, and generating corresponding markdown.",
  )
  const manifestData = manifest.get()
  const result = await Promise.all(
    questions.map((question) => {
      const { output, languages, translate } = config
      const { frontendQuestionId, titleSlug } = question
      const exists = manifestData[frontendQuestionId]

      if (exists && exists.titleSlug === titleSlug) {
        const unAcceptedLanguages = _.filter(
          languages,
          (language) => !exists[language],
        )
        if (!_.size(unAcceptedLanguages)) {
          return null
        }
        return fetchAndAppendToMD(
          question,
          unAcceptedLanguages,
          exists.markdownPath,
        )
      }
      return fetchAndWrite(question, languages, output, translate)
    }),
  )
  return _.filter(result, Boolean)
}

/**
 * Find the languages in which the algorithm question has not been passed.
 */
async function fetchAndAppendToMD(question, languages, output) {
  debug("fetchAndAppendToMD", question.titleSlug)
  const solutions = await fetchACSolutions(question, languages)
  if (!_.size(solutions)) {
    return null
  }
  const markdownPath = await appendToMD(solutions, output)
  if (!markdownPath) {
    return null
  }
  return { ...question, markdownPath, solutions }
}

/**
 * Fetch a leetcode question and solutions.
 * and generate a markdown file.
 *
 * @param {Object} question accepted question.
 * @param {Array} languages no accepted languages
 * @param {String} output output path
 * @returns {Object} add solutions and question to the previous question object
 */

async function fetchAndWrite(question, languages, output, translate) {
  debug("fetchAndWrite", question.titleSlug)
  const solutions = await fetchACSolutions(question, languages)
  if (!_.size(solutions)) {
    return null
  }
  const questionInfo = await fetchQuestionInfo(question)
  if (!questionInfo) {
    return null
  }
  const markdownPath = await generateMD(
    question,
    questionInfo,
    solutions,
    output,
    translate,
  )
  if (!markdownPath) {
    return null
  }
  return { ...question, markdownPath, questionInfo, solutions }
}

/**
 *
 * Fetch the accepted solutions' question.
 *
 * @param {Object} question accepted question.
 * @returns {Promise<Object>} questionInfo
 */

async function fetchQuestionInfo({ titleSlug }) {
  try {
    const operationName = "questionData"
    const data = await request.post(
      graphql,
      {
        operationName,
        variables: {
          titleSlug,
        },
        query: queryQuestionData,
      },
      {
        headers: {
          "x-operation-name": operationName,
          "x-definition-name": "question",
        },
      },
    )
    return data.question
  } catch (err) {
    errorLog(
      `FetchQuestion Error: When fetch the question statement for the ${titleSlug} algorithm`,
    )
  }
}

/**
 *
 * Fetch the accepted solutions' code based on different programming languages.
 *
 * @param {Object} question accepted question.
 * @param {Array} languages
 * @returns {Promise<Array>} solutions' code
 */

async function fetchACSolutions(question, languages) {
  const lastSubmissions = await Promise.all(
    _.map(languages, (language) => fetchLastSubmission(question, language)),
  )
  const filtered = _.filter(lastSubmissions, Boolean)
  const solutions = await Promise.all(
    _.map(filtered, (ls) =>
      enqueueTask(
        fetchSubmissionDetail({
          ...ls,
          titleSlug: question,
        }),
      ),
    ),
  )
  return _.filter(solutions, Boolean)
}

async function fetchLastSubmission({ titleSlug }, lang) {
  try {
    const operationName = "lastSubmission"
    const data = await request.post(
      graphql,
      {
        operationName,
        variables: { lang, questionSlug: titleSlug },
        query: queryLastSubmission,
      },
      {
        headers: {
          "x-definition-name": operationName,
          "x-operation-name": operationName,
        },
      },
    )
    if (data.lastSubmission?.statusDisplay === "Accepted") {
      return data.lastSubmission
    }
    return null
  } catch (error) {
    errorLog(
      `FetchLastSubmission Error: When fetch the ${lang} latest submission for the ${titleSlug} algorithm`,
      error,
    )
  }
}

function fetchSubmissionDetail({ id, titleSlug, lang }) {
  return async function impl() {
    try {
      const operationName = "mySubmissionDetail"
      const data = await request.post(
        graphql,
        {
          operationName,
          variables: { id },
          query: querySubmissionDetail,
        },
        {
          headers: {
            "x-definition-name": "submissionDetail",
            "x-operation-name": operationName,
          },
        },
      )

      return data.submissionDetail
    } catch (error) {
      errorLog(
        `FetchSubmissionDetail Error: When fetch the ${lang} solution for the ${titleSlug} algorithm`,
      )
    }
  }
}
