# Mirai Repo

用于放置包版本信息。

## 如何在此仓库被列出

1. 包**必须遵循**`AGPLv3`协议开源
1. `JAR`必须已在`Maven Central`或`JCenter`上线（暂定，之后会支持更多途径）
1. 提交`Pull Request`

## 仓库链接

* [Gitee](https://gitee.com/peratx/mirai-repo) - 主仓库
* [GitHub](https://github.com/project-mirai/mirai-repo-mirror) - GitHub镜像

## `package.json` 参考格式

```json
{
    "announcement": "包公告",
    "type": "core/plugin-jar/plugin-native/plugin-js等",
    "channels": {
        "stable": [
            "1.0.0"
        ]
    },
    "repo": {
        "1.0.0": "https://example.org/org/example/1.0.0/example.zip"
    }
}
```


## 开源许可证

    Copyright (C) 2020-2021 iTX Technologies

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
