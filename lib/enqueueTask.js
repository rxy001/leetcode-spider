import _ from "lodash"
import { print } from "./log.js"

const queue = []
const concurrency = 10
const delay = 20000

let processing = false
let timer = null

function Task(request) {
  function task() {
    return request().then(task.resolve)
  }

  task.promise = new Promise((resolve) => {
    task.resolve = resolve
  })

  return task
}

function enqueueTask(request) {
  if (!processing) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      wookLoop()
    }, 500)
  }

  const task = new Task(request)

  queue.push(task)

  return task.promise
}

async function wookLoop() {
  if (!processing) {
    processing = true
    if (_.size(queue) > 50) {
      await batchProcessing()
    } else {
      await immediateProcessing()
    }
    processing = false
  }
}

async function immediateProcessing() {
  const tasks = queue.splice(0, _.size(queue))
  await performTasks(tasks)
}

async function batchProcessing() {
  const tasks = queue.splice(0, concurrency)

  await performTasks(tasks)

  if (_.size(queue)) {
    return new Promise((res) => {
      print("batchProcessing after 20s")
      print("...")
      setTimeout(() => {
        res(batchProcessing())
      }, delay)
    })
  }
}

async function performTasks(tasks) {
  return Promise.all(_.map(tasks, (task) => task()))
}

export default enqueueTask
