# leetcode spider

Fetching the algorithm questions that have been passed on own LeetCode account,
And generate a markdown file. Multiple calls will only add newly passed questions

# Usage

```bash
npm i @x1ngyu/lc-spider -g
```

Ceate an config lc-config.json in the root directory or specifie config file path in the command line, The file type must be json.

```json
//
{
  "username": "xxxxx",
  "password": "xxxxx",
  "output": "path",
  "languages": ["javascript"],
  "translate": false
}
```

- `username、password`：leetcode account.
- `output`: markdown output path. `default: "./questions"`.
- `languages`: programing language. e.g. `c#、java、python、python3、c、ruby、javascript、go、swift、scala、kotlin`
- `translate`: Whether the output markdown should be translated into Chinese. `true`: zh、`false`: en。 `defalut: true`.

# Notes

The number of recently submitted algorithm code requests for a single algorithm problem depends on in the `config.languages`, the number of programming languages for the algorithm has passed .
For example:

```json
{
  "languages": ["java", "javascript", "python3"]
}
```

If have submitted and passed Java and JavaScript solutions for the Two Sum problem, two recently submitted algorithm code requests will be sent.

Due to the limitation of LeetCode, only a limited number of recently submitted algorithm code API requests can be sent per minute. If the number of requests exceeds the limit, the algorithm code cannot be retrieved. Therefore, the requests are sent in batches with delays, which may take a longer time to crawl. If the number of recently submitted algorithm code requests is less than 50,all requests will be sent concurrently. Otherwise, 10 requests will be sent simultaneously every 20 seconds.
