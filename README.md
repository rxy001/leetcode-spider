[简体中文](/README.md)｜[English](/README.EN.md)

# Leetcode Spider

基于 `nodejs` 爬取 leetcode 上已通过的题目，生成 markdown，并支持多种编程语言。如果传了多个编程语言，多次执行不会重复爬取同一题目和同一编程语言，但是该题目如果已经通过了，且其中某个编程语言未通过，仍然会爬取对应编程语言的算法。

# 使用

```bash
npm i @x1ngyu/lc-spider -g
```

创建一个目录，在根目录下新建 lc-config.json ，或者在命令行中指定 config 文件，但必须是 `json` 格式。

```json
{
  "username": "xxxxx",
  "password": "xxxxx",
  "output": "path",
  "languages": ["javascript"],
  "translate": boolean
}
```

- `username、password`：leetcode 账号密码。
- `output`: markdown 输出的路径。`default: ./questions`
- `languages`: 指定编程语言。e.g. `c#、java、python、python3、c、ruby、javascript、go、swift、scala、kotlin`
- `translate`: 输出的 markdown 是否使用中文。`true`: zh、`false`: en。 `defalut: true`.

# 注意事项

单个算法题的最近提交的算法代码请求个数取决于 `config.languages` 中, 该算法已通过的编程语言个数。

例如：

```json
config.languages = ["java", "javascript", "python3"]
```

两树之和的算法题，提交并通过了 java 和 javascript 的算法，那么该题会发送 2 个最近提交的算法代码请求。

由于 leetcode 限制了每分钟内最近提交的算法代码接口的请求个数，超过后将获取不到算法代码，因此分批并延迟去请求，爬取时间可能较长。如果最近提交的算法代码请求个数低于 50 ，将并发全部执行。否则每 20s 同时发送 10 个请求。
