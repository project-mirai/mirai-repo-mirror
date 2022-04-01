# Mirai Repo

用于放置包版本信息。

## 使用本仓库的软件

* [iTXTech Mirai Console Loader](https://github.com/iTXTech/mirai-console-loader)

## 如何添加包到本仓库

1. 包**必须遵循**`AGPLv3`开源
1. 提交`Pull Request`

## 下载途径

1. `Maven Central` - 如果`repo`字段没有定义将默认使用
1. 使用`repo`字段为每个版本定义下载链接

## 仓库镜像

* [GitHub project-mirai/mirai-repo-mirror](https://github.com/project-mirai/mirai-repo-mirror) - 主仓库
* [`https://repo.iTXTech.org`](https://repo.itxtech.org) - Cloudflare Pages
* [`https://mcl.repo.mamoe.net`](https://mcl.repo.mamoe.net) - GitHub Pages
* [`https://repo.mirai.mamoe.net/keep/mcl`](https://repo.mirai.mamoe.net/keep/mcl) - Mamoe Repo Server
* [`https://mirai.mamoe.net/assets/mcl`](https://mirai.mamoe.net/assets/mcl) - Mirai Forum
* ~~[Gitee peratx/mirai-repo](https://gitee.com/peratx/mirai-repo)~~ - 原主仓库, 已停用

## `package.json` 参考格式

```json
{
  "announcement": "包公告",
  "type": "core/plugin-jar/plugin-native/plugin-js/mcl-module等",
  "defaultChannel": "stable",
  "name": "包显示名称（为空则不在插件中心显示）",
  "description": "简介（可空）",
  "website": "网站，可为GitHub（可空）",
  "forum": "Mirai Forum 帖子链接（可空）",
  "logo": "Logo链接（可空，但不建议）",
  "readme": "README.md链接（可空，链接请指向RAW）",
  "channels": {
    "stable": [
      "1.0.0"
    ]
  },
  "repo": {
    "1.0.0": {
      "archive": "https://example.org/org/example/1.0.0/example.zip",
      "metadata": "https://example.org/org/example/1.0.0/example.metadata",
      "sha1": "https://example.org/org/example/1.0.0/example.zip.sha1"
    }
  }
}
```

## 开源许可证

    Mirai Repo
    Copyright (C) 2021-2022 Mamoe Technologies
    Copyright (C) 2020-2022 iTX Technologies

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
