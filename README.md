<center>

[简体中文](/README.md)｜[English](/README.EN.md)

</center>

## leetcode spider

基于 `nodejs` 爬取 leetcode 上已经通过的题目，生成 markdown，支持多种编程语言。如果传了多个编程语言，多次执行不会重复爬取同一题目和同一编程语言，但是该题目如果已经通过了，但是其中某个编程语言未通过，仍然会爬取对应编程语言的算法。

## 使用

1. 下载包 `npm i @x1ngyu/lc-spider -g`

2. 创建一个目录，在根目录下新建 lc-config.json ，或者在命令行中指定 config 文件，但必须是 `json` 格式。

```js
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
