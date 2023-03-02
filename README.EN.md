## leetcode spider

Fetching the algorithm questions that have been passed on own LeetCode account,
And generate a markdown file. Multiple calls will only add newly passed questions

## Usage

```bash
npm i @x1ngyu/lc-spider -g
```

Ceate an config lc-config.json in the root directory or specifie config file path in the command line, The file type must be json.

```js
//
{
  // leetcode account
  "username": "xxxxx",
  "password": "xxxxx",
  // markdown output path. default: "./questions"
  "output": "path",
  /*
  *
  * programing language.
  * e.g.: c#、java、python、python3、c、ruby、javascript、go、swift、scala、kotlin
  *
  */
  "languages": ["javascript"],
  // Whether the output markdown should be translated into Chinese.
  // true: zh false: en
  // default: true
  "translate": boolean
}
```

```bash
lc-spider
```
