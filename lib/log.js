import chalk from "chalk"

/* eslint-disable no-console */
export function errorLog(...s) {
  return console.log(chalk.red(...s))
}
export function debug(...s) {
  if (process.env.DEBUG) {
    console.log(chalk.blue(...s))
  }
}
export function print(...s) {
  return console.log(chalk.yellow(...s))
}
