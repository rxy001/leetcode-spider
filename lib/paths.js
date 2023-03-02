import fs from "fs-extra"
import { resolve } from "path"

export const appDirectory = fs.realpathSync(process.cwd())
export const baseURL = "https://leetcode.cn"
export const loginURL = "/accounts/login/"
export const graphql = "/graphql/"
export const manifestPath = resolve(appDirectory, "lc-manifest.json")
