# mihomo-override

Mihomo（Clash Meta）配置覆写脚本仓库。

## 文件

| 文件 | 说明 |
| --- | --- |
| `steam-direct.js` | 精简稳定版覆写脚本：WebRTC 防泄漏 + 自定义域名/IP 直连 + Steam 下载 CDN 直连分流 |

## 在客户端里怎么用

把下面任意一条链接填入客户端的「覆写 / Override / 配置脚本」输入框即可。
脚本内容更新后**链接不用换**，客户端重新拉取就会拿到最新版。

### 主链接（GitHub 官方 Raw）

```
https://raw.githubusercontent.com/zhongxianlian-debug/mihomo-override/main/steam-direct.js
```

### 加速链接（jsDelivr CDN，国内推荐）

```
https://cdn.jsdelivr.net/gh/zhongxianlian-debug/mihomo-override@main/steam-direct.js
```

国内访问不稳时可换用备用节点：

```
https://fastly.jsdelivr.net/gh/zhongxianlian-debug/mihomo-override@main/steam-direct.js
https://gcore.jsdelivr.net/gh/zhongxianlian-debug/mihomo-override@main/steam-direct.js
```

> jsDelivr 有缓存，推送新版本后可能需要等几分钟才生效；急着验证就用 GitHub Raw 那条。

## 脚本要点

- 删除默认代理 / 自动选择 / 负载均衡 / 各地区策略组，全部改为手动选择
- AI 与 Gemini 策略组分开；FCM 默认直连
- AdBlock 默认 REJECT；保留名称含「备用」的节点
- 本地拦截 WebRTC / STUN 探测（UDP 3478 / 5349 / 19302-19309 + `stun` 关键字）
- 指定 `lumina00001.com`、`dpdns.org`、`wybcs.work` 及 5 个固定 IP 走直连
- **Steam 分流**：下载 CDN（`steamcontent.com`、`steamserver.net`、`steampipe.akamaized.net`、`content.steamchina.com`）强制直连，商店/社区走 `Steam` 策略组

## 更新方式

```bash
git add steam-direct.js
git commit -m "update"
git push
```

推送后上面的链接自动指向最新版本。
