/**
 * Mihomo 配置覆写脚本（晚高峰版 · 精简稳定版 + WebRTC 防泄漏 + 自定义域名/IP直连 + Steam 分流）
 *
 * 本文件为晚高峰时段使用的版本；白天版见 steam-direct-day.js。
 *
 * 设定：
 * 1. 删除“默认代理”策略组
 * 2. 删除“自动选择”策略组
 * 3. 删除“负载均衡”策略组
 * 4. 删除香港、日本、美国、新加坡、台湾、韩国等地区策略组
 * 5. 彻底移除 GLOBAL 策略组
 * 6. AI 与 Gemini 分开
 * 7. 普通服务：手动选择 + 全部节点，默认“手动选择”
 *    - 特例 1：Gemini 策略组在“手动选择”后追加“AI”策略组选项
 *    - 特例 2：FCM 与 Emby 默认“直连”
 * 8. 支持直连的服务额外保留“直连”选项
 * 9. AdBlock 默认 REJECT
 * 10. 保留名称中含“备用”的节点
 * 11. 本地拦截 WebRTC / STUN 探测
 * 12. 指定 lumina.lumina00001.com 直连
 * 13. 指定 5 个特定服务器 IP 走直连
 * 14. Steam 分流：下载 CDN 走“直连”，商店/社区走“Steam”策略组
 */

const ruleOptionsEnable = {
  AI: true,
  Gemini: true,
  Media: true,
  FCM: true,
  Google: true,
  Microsoft: true,
  Apple: true,
  Telegram: true,
  Steam: true,
  TikTok: true,
  Twitter: true,
  Emby: true,
  PikPak: true,
  Spotify: true,
  AdBlock: true,
};

const excludeHighRateProxiesEnable = false;

// 保留“备用”节点，不在此过滤名单中
const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|Test|⚠️|@|Expire|http|com\/u/;

const highRateRegex =
  /(?:[*×xX✕✖⨉]\s*(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?)|(?:(?<![\d.])(?:[2-9]\d*|[1-9]\d+)(?:\.\d+)?\s*(?:倍|[*×xX✕✖⨉]))/u;

const rules = [
  // 帝服 emby
  'DOMAIN,emby.di0.uk,手动选择',
  // 茶百道 emby
  'DOMAIN,emby.chapanda.site,手动选择',
  'DOMAIN,emby.teawaya.com,手动选择',
  // BB emby
  'DOMAIN,emby.bbqwq.com,手动选择',
  // 步兵营地
  'DOMAIN,bb.emby.edu.kg,手动选择',
  // 折纸
  'DOMAIN,cdn.zhezhi.art,手动选择',
  'DOMAIN,emby101.origamiart.uk,手动选择',
  // 龙宫
  'DOMAIN,dragon.wybcs.work,手动选择',
  // 流光画廊 emby
  'DOMAIN-SUFFIX,dqx99999.shop,手动选择',
  //MB闷豹
  'DOMAIN,emby.zhouzhou00.dpdns.org,手动选择',
  //墨云阁
  'DOMAIN,er8mm.mobaiemby.site,手动选择',

  // 屏蔽海外 QUIC
  'AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn_additional),(RULE-SET,cn_ip,no-resolve)))))),REJECT',
  // WebRTC / STUN 常用探测端口拦截
  'AND,((NETWORK,UDP),(OR,((DST-PORT,3478),(DST-PORT,5349),(DST-PORT,19302-19309)))),REJECT',
  // WebRTC / STUN 域名关键字拦截
  'DOMAIN-KEYWORD,stun,REJECT',

  // 指定单个 IP 走直连
  'IP-CIDR,38.105.27.21/32,直连,no-resolve',
  'IP-CIDR,154.26.240.234/32,直连,no-resolve',
  'IP-CIDR,103.158.117.129/32,直连,no-resolve',

  'RULE-SET,private,直连',
  'RULE-SET,private_ip,直连,no-resolve',
  'RULE-SET,games_cn,直连',
  'RULE-SET,epicgames,直连',
  'RULE-SET,nvidia_cn,直连',
  'RULE-SET,apple_cn,直连',
  'RULE-SET,microsoft_cn,直连',
  'DOMAIN,fsend.cn,直连',
  'DOMAIN,international-gfe.download.nvidia.com,直连',

  // 指定 Lumina 走直连
  'DOMAIN-SUFFIX,lumina00001.com,直连',
  'DOMAIN,lumina.lumina00001.com,直连',
  //茶包emby
  'DOMAIN-SUFFIX,dpdns.org,直连',
  //宸澄emby
  'DOMAIN-SUFFIX,wybcs.work,直连',
  'DOMAIN-SUFFIX,ccmedia.top,直连',
  //茉莉emby
  'DOMAIN-SUFFIX,mlhyy.top,直连',
];

const ruleProviderCommonDomain = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'domain',
};

const ruleProviderCommonIpcidr = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'ipcidr',
};

const baseRuleProviders = {
  private: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs',
    path: './ruleset/private.mrs',
    'path-in-bundle': 'geo/geosite/private.mrs',
  },

  private_ip: {
    ...ruleProviderCommonIpcidr,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs',
    path: './ruleset/private_ip.mrs',
    'path-in-bundle': 'geo/geoip/private.mrs',
  },

  games_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-games@cn.mrs',
    path: './ruleset/category-games@cn.mrs',
    'path-in-bundle': 'geo/geosite/category-games@cn.mrs',
  },

  epicgames: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/epicgames.mrs',
    path: './ruleset/epicgames.mrs',
    'path-in-bundle': 'geo/geosite/epicgames.mrs',
  },

  nvidia_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/nvidia@cn.mrs',
    path: './ruleset/nvidia@cn.mrs',
    'path-in-bundle': 'geo/geosite/nvidia@cn.mrs',
  },

  apple_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple@cn.mrs',
    path: './ruleset/apple@cn.mrs',
    'path-in-bundle': 'geo/geosite/apple@cn.mrs',
  },

  microsoft_cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft@cn.mrs',
    path: './ruleset/microsoft_cn.mrs',
    'path-in-bundle': 'geo/geosite/microsoft@cn.mrs',
  },

  cn_additional: {
    ...ruleProviderCommonDomain,
    url: 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
    path: './ruleset/cn-additional-list.mrs',
    'path-in-bundle': 'geo/geosite/cn.mrs',
  },

  cn_ip: {
    ...ruleProviderCommonIpcidr,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cn.mrs',
    path: './ruleset/cn_ip.mrs',
    'path-in-bundle': 'geo/geoip/cn.mrs',
  },

  github: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/github.mrs',
    path: './ruleset/github.mrs',
    'path-in-bundle': 'geo/geosite/github.mrs',
  },

  gfw: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/gfw.mrs',
    path: './ruleset/gfw.mrs',
    'path-in-bundle': 'geo/geosite/gfw.mrs',
  },

  fakeip_filter: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/wwqgtxx/clash-rules@release/fakeip-filter.mrs',
    path: './ruleset/fakeip-filter.mrs',
    'path-in-bundle': 'geo/geosite/private.mrs',
  },

  cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/wwqgtxx/clash-rules@release/direct.mrs',
    path: './ruleset/cn.mrs',
    'path-in-bundle': 'geo/geosite/cn.mrs',
  },
};

const groupBaseOption = {
  interval: 600,
  timeout: 3000,
  url: 'https://g.cn/generate_204',
  lazy: true,
  'max-failed-times': 3,
  'empty-fallback': 'REJECT',
};

const selectBaseOption = {
  ...groupBaseOption,
  type: 'select',
  hidden: false,
};

const serviceConfigs = [
  {
    name: 'AI',
    providers: {
      ai: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-ai-!cn.mrs',
        path: './ruleset/ai.mrs',
        'path-in-bundle': 'geo/geosite/category-ai-!cn.mrs',
      },
      gemini: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google-gemini.mrs',
        path: './ruleset/google-gemini.mrs',
        'path-in-bundle': 'geo/geosite/google-gemini.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png',
    rules: [
      'AND,((RULE-SET,ai),(NOT,((RULE-SET,gemini)))),AI',
    ],
  },
  {
    name: 'Gemini',
    providers: {
      gemini: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google-gemini.mrs',
        path: './ruleset/google-gemini.mrs',
        'path-in-bundle': 'geo/geosite/google-gemini.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png',
    rules: [
      'RULE-SET,gemini,Gemini',
    ],
  },
  {
    name: 'Media',
    providers: {
      youtube: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/youtube.mrs',
        path: './ruleset/youtube.mrs',
        'path-in-bundle': 'geo/geosite/youtube.mrs',
      },
      instagram: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/instagram.mrs',
        path: './ruleset/instagram.mrs',
        'path-in-bundle': 'geo/geosite/instagram.mrs',
      },
      netflix: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/netflix.mrs',
        path: './ruleset/netflix.mrs',
        'path-in-bundle': 'geo/geosite/netflix.mrs',
      },
      netflix_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/netflix.mrs',
        path: './ruleset/netflix_ip.mrs',
        'path-in-bundle': 'geo/geoip/netflix.mrs',
      },
      hbo: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/hbo.mrs',
        path: './ruleset/hbo.mrs',
        'path-in-bundle': 'geo/geosite/hbo.mrs',
      },
      twitch: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/twitch.mrs',
        path: './ruleset/twitch.mrs',
        'path-in-bundle': 'geo/geosite/twitch.mrs',
      },
      disney: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/disney.mrs',
        path: './ruleset/disney.mrs',
        'path-in-bundle': 'geo/geosite/disney.mrs',
      },
      niconico: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/niconico.mrs',
        path: './ruleset/niconico.mrs',
        'path-in-bundle': 'geo/geosite/niconico.mrs',
      },
      bbc: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/bbc.mrs',
        path: './ruleset/bbc.mrs',
        'path-in-bundle': 'geo/geosite/bbc.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ForeignMedia.png',
    rules: [
      'RULE-SET,youtube,Media',
      'RULE-SET,instagram,Media',
      'RULE-SET,netflix,Media',
      'RULE-SET,netflix_ip,Media,no-resolve',
      'RULE-SET,hbo,Media',
      'RULE-SET,twitch,Media',
      'RULE-SET,disney,Media',
      'RULE-SET,niconico,Media',
      'RULE-SET,bbc,Media',
    ],
  },
  {
    name: 'FCM',
    direct: true,
    providers: {
      googlefcm: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/googlefcm.mrs',
        path: './ruleset/googlefcm.mrs',
        'path-in-bundle': 'geo/geosite/googlefcm.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/MiToverG422/Qure@master/IconSet/Color/fcm.png',
    rules: [
      'RULE-SET,googlefcm,FCM',
    ],
  },
  {
    name: 'Google',
    providers: {
      google: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google.mrs',
        path: './ruleset/google.mrs',
        'path-in-bundle': 'geo/geosite/google.mrs',
      },
      google_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/google.mrs',
        path: './ruleset/google_ip.mrs',
        'path-in-bundle': 'geo/geoip/google.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png',
    rules: [
      'RULE-SET,google,Google',
      'RULE-SET,google_ip,Google,no-resolve',
    ],
  },
  {
    name: 'Microsoft',
    direct: true,
    providers: {
      microsoft: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft.mrs',
        path: './ruleset/microsoft.mrs',
        'path-in-bundle': 'geo/geosite/microsoft.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png',
    rules: [
      'RULE-SET,microsoft,Microsoft',
    ],
  },
  {
    name: 'Apple',
    direct: true,
    providers: {
      apple: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple.mrs',
        path: './ruleset/apple.mrs',
        'path-in-bundle': 'geo/geosite/apple.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple.png',
    rules: [
      'RULE-SET,apple,Apple',
    ],
  },
  {
    name: 'Telegram',
    providers: {
      telegram: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs',
        path: './ruleset/telegram.mrs',
        'path-in-bundle': 'geo/geosite/telegram.mrs',
      },
      telegram_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/telegram.mrs',
        path: './ruleset/telegram_ip.mrs',
        'path-in-bundle': 'geo/geoip/telegram.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png',
    rules: [
      'RULE-SET,telegram,Telegram',
      'RULE-SET,telegram_ip,Telegram,no-resolve',
    ],
  },
  {
    name: 'Steam',
    direct: true,
    providers: {
      steam_cn: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam@cn.mrs',
        path: './ruleset/steam_cn.mrs',
        'path-in-bundle': 'geo/geosite/steam@cn.mrs',
      },
      steam: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam.mrs',
        path: './ruleset/steam.mrs',
        'path-in-bundle': 'geo/geosite/steam.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Steam.png',
    rules: [
      // 1. Steam 下载 CDN 强制直连（优先命中）
      'DOMAIN-SUFFIX,steamcontent.com,直连',
      'DOMAIN-SUFFIX,steamserver.net,直连',
      'DOMAIN-SUFFIX,steampipe.akamaized.net,直连',
      'DOMAIN-SUFFIX,content.steamchina.com,直连',
      'DOMAIN-KEYWORD,steamcontent,直连',
      'RULE-SET,steam_cn,直连',

      // 2. Steam 商店、社区、客户端 API 走 Steam 策略组
      'RULE-SET,steam,Steam',
    ],
  },
  {
    name: 'TikTok',
    providers: {
      tiktok: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/tiktok.mrs',
        path: './ruleset/tiktok.mrs',
        'path-in-bundle': 'geo/geosite/tiktok.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png',
    rules: [
      'RULE-SET,tiktok,TikTok',
    ],
  },
  {
    name: 'Twitter',
    providers: {
      twitter: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/twitter.mrs',
        path: './ruleset/twitter.mrs',
        'path-in-bundle': 'geo/geosite/twitter.mrs',
      },
      twitter_ip: {
        ...ruleProviderCommonIpcidr,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/twitter.mrs',
        path: './ruleset/twitter_ip.mrs',
        'path-in-bundle': 'geo/geoip/twitter.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Twitter.png',
    rules: [
      'RULE-SET,twitter,Twitter',
      'RULE-SET,twitter_ip,Twitter,no-resolve',
    ],
  },
  {
    name: 'Emby',
    direct: true,
    providers: {
      emby: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/666OS/rules@release/mihomo/domain/Emby.mrs',
        path: './ruleset/emby.mrs',
        'path-in-bundle': 'geo/geosite/category-emby.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Emby.png',
    rules: [
      'RULE-SET,emby,Emby',
      'DOMAIN-SUFFIX,mb3admin.com,Emby',
      'DOMAIN-KEYWORD,emby,Emby',
    ],
  },
  {
    name: 'PikPak',
    direct: true,
    providers: {
      pikpak: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/pikpak.mrs',
        path: './ruleset/pikpak.mrs',
        'path-in-bundle': 'geo/geosite/pikpak.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/lige47/QuanX-icon-rule@main/icon/03CNSoft/pikpak.png',
    rules: [
      'RULE-SET,pikpak,PikPak',
    ],
  },
  {
    name: 'Spotify',
    direct: true,
    providers: {
      spotify: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/spotify.mrs',
        path: './ruleset/spotify.mrs',
        'path-in-bundle': 'geo/geosite/spotify.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png',
    rules: [
      'RULE-SET,spotify,Spotify',
    ],
  },
  {
    name: 'AdBlock',
    reject: true,
    providers: {
      adblockmihomolite: {
        ...ruleProviderCommonDomain,
        url: 'https://fastly.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs',
        path: './ruleset/adblockmihomolite.mrs',
        'path-in-bundle': 'geo/geosite/category-ads-all.mrs',
      },
    },
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Advertising.png',
    rules: [
      'RULE-SET,adblockmihomolite,AdBlock',
    ],
  },
];

function main(config) {
  const newConfig = {};

  // =============================
  // 过滤节点
  // =============================

  const filteredProxies = (config.proxies || []).filter(
    (proxy) => {
      const type = String(
        proxy.type ?? '',
      ).toLowerCase();

      const name = String(
        proxy.name ?? '',
      );

      return (
        type !== 'direct' &&
        type !== 'reject' &&
        !excludeFilter.test(name) &&
        !(
          excludeHighRateProxiesEnable &&
          highRateRegex.test(name)
        )
      );
    },
  );

  if (!filteredProxies.length) {
    throw new Error(
      '配置文件中未找到任何代理节点，请使用机场提供的配置文件进行覆写',
    );
  }

  const allProxyNames =
    filteredProxies.map(
      (proxy) => proxy.name,
    );

  const functionalGroups = [];

  const finalRules = [
    ...rules,
  ];

  const finalRuleProviders = {
    ...baseRuleProviders,
  };

  // =============================
  // 总手动选择
  // =============================

  functionalGroups.push({
    ...selectBaseOption,
    name: '手动选择',
    proxies: [
      ...allProxyNames,
    ],
    icon:
      'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Rocket.png',
  });

  // =============================
  // 各服务策略组
  // =============================

  for (const service of serviceConfigs) {
    if (
      !ruleOptionsEnable[
        service.name
      ]
    ) {
      continue;
    }

    finalRules.push(
      ...service.rules,
    );

    Object.assign(
      finalRuleProviders,
      service.providers || {},
    );

    // ==========================
    // AdBlock
    // ==========================

    if (service.reject) {
      functionalGroups.push({
        ...selectBaseOption,
        name: service.name,
        icon: service.icon,
        proxies: [
          'REJECT',
          'REJECT-DROP',
          'PASS',
        ],
        'default-selected': 'REJECT',
      });
      continue;
    }

    // ==========================
    // 默认策略
    // FCM / Emby = 直连，其他 = 手动选择
    // Gemini: 手动选择后面紧跟 AI 策略组选项
    // ==========================

    const defaultProxy =
      (service.name === 'FCM' || service.name === 'Emby')
        ? '直连'
        : '手动选择';

    const commonProxies = [
      '手动选择',
      ...(service.name === 'Gemini' ? ['AI'] : []),
      ...allProxyNames,
      ...(service.direct ? ['直连'] : []),
    ];

    const serviceProxies = [
      defaultProxy,
      ...commonProxies.filter(
        (name) => name !== defaultProxy,
      ),
    ];

    functionalGroups.push({
      ...selectBaseOption,
      name: service.name,
      icon: service.icon,
      proxies: serviceProxies,
      'default-selected': defaultProxy,
    });
  }

  // =============================
  // 漏网之鱼
  // =============================

  functionalGroups.push({
    ...selectBaseOption,
    name: '漏网之鱼',
    proxies: [
      '手动选择',
      ...allProxyNames,
      '直连',
    ],
    'default-selected': '手动选择',
    icon:
      'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Stack.png',
  });

  // =============================
  // 直连
  // =============================

  functionalGroups.push({
    ...selectBaseOption,
    name: '直连',
    proxies: [
      '🇨🇳 直连 | IPv4优先',
      '🇨🇳 直连 | IPv6优先',
      '🇨🇳 直连 | 双栈',
    ],
    icon:
      'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China_Map.png',
  });

  // =============================
  // DNS
  // =============================

  const originalDnsConfig = config.dns || {};

  const commonDnsRegex =
    /(223\.5\.5\.5|223\.6\.6\.6|119\.29\.29\.29|1\.12\.12\.12|120\.53\.53\.53|114\.114\.114\.114|180\.76\.76\.76|1\.1\.1\.1|1\.0\.0\.1|8\.8\.8\.8|8\.8\.4\.4|94\.140\.14\.14|94\.140\.15\.15|127\.0\.0\.1|alidns|doh\.pub|dot\.pub|dnspod|dns\.baidu|dns\.google|cloudflare|adguard|system)/i;

  const originalProxyServerNameserver = (
    originalDnsConfig['proxy-server-nameserver'] || []
  ).filter((dns) => !commonDnsRegex.test(String(dns)));

  const originalPolicyNameserver = {};

  for (const policy of [
    originalDnsConfig['proxy-server-nameserver-policy'] || {},
    originalDnsConfig['nameserver-policy'] || {},
  ]) {
    for (const [rule, dns] of Object.entries(policy)) {
      const dnsList = Array.isArray(dns) ? dns : [dns];
      if (dnsList.some((item) => commonDnsRegex.test(String(item)))) {
        continue;
      }
      originalPolicyNameserver[rule] = dns;
    }
  }

  const chinaDNS = [
    'https://dns.alidns.com/dns-query#DIRECT',
    'https://doh.pub/dns-query#DIRECT',
  ];

  const foreignDNS = [
    'https://dns.cloudflare.com/dns-query#手动选择',
    'https://dns.google/dns-query#手动选择',
  ];

  newConfig.dns = {
    enable: true,
    ipv6: true,
    'use-hosts': true,
    'cache-algorithm': 'arc',
    'use-system-hosts': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/16',
    'fake-ip-filter': [
      'rule-set:private',
      'rule-set:fakeip_filter',
    ],
    'proxy-server-nameserver': [
      ...chinaDNS,
      ...originalProxyServerNameserver,
    ],
    ...(Object.keys(originalPolicyNameserver).length > 0 && {
      'proxy-server-nameserver-policy': originalPolicyNameserver,
    }),
    'default-nameserver': [
      '223.5.5.5',
      '119.29.29.29',
    ],
    nameserver: [
      ...foreignDNS,
    ],
    'nameserver-policy': {
      'rule-set:cn': [
        ...chinaDNS,
      ],
    },
    'direct-nameserver': [
      'system',
      '223.5.5.5',
      '119.29.29.29',
    ],
  };

  // =============================
  // Hosts
  // =============================

  const proxyDomains = new Set(
    filteredProxies
      .filter((proxy) => typeof proxy.server === 'string')
      .map((proxy) => proxy.server.toLowerCase()),
  );

  const originalHosts = config.hosts || {};
  const proxyHosts = {};

  for (const [host, value] of Object.entries(originalHosts)) {
    if (proxyDomains.has(host.toLowerCase())) {
      proxyHosts[host] = value;
    }
  }

  newConfig.hosts = {
    'dns.alidns.com': ['223.5.5.5', '223.6.6.6'],
    'doh.pub': ['1.12.12.12', '120.53.53.53'],
    'dns.cloudflare.com': ['1.1.1.1', '1.0.0.1'],
    'dns.google': ['8.8.8.8', '8.8.4.4'],
    'services.googleapis.cn': ['services.googleapis.com'],
    '+.mcdn.bilivideo.com': ['0.0.0.0'],
    '+.mcdn.bilivideo.cn': ['0.0.0.0'],
    '+.edge.mountaintoys.cn': ['0.0.0.0'],
    ...proxyHosts,
  };

  // =============================
  // 基础配置
  // =============================

  newConfig['allow-lan'] = true;
  newConfig.ipv6 = true;
  newConfig.mode = 'rule';
  newConfig['log-level'] = 'info';
  newConfig['bind-address'] = '*';
  newConfig['unified-delay'] = true;
  newConfig['tcp-concurrent'] = true;
  newConfig['keep-alive-idle'] = 600;
  newConfig['keep-alive-interval'] = 60;
  newConfig['find-process-mode'] = 'strict';
  newConfig['external-controller'] = '127.0.0.1:9090';
  newConfig['external-ui'] = 'ui';
  newConfig['external-ui-url'] =
    'https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip';

  newConfig.profile = {
    'store-selected': false,
    'store-fake-ip': true,
  };

  // =============================
  // NTP
  // =============================

  newConfig.ntp = {
    enable: true,
    'write-to-system': false,
    server: 'ntp.aliyun.com',
    port: 123,
    interval: 60,
  };

  // =============================
  // TUN
  // =============================

  newConfig.tun = {
    enable: true,
    stack: 'system',
    'auto-route': true,
    'strict-route': true,
    'auto-redirect': true,
    'auto-detect-interface': true,
    'dns-hijack': [
      'any:53',
      'tcp://any:53',
    ],
  };

  // =============================
  // 节点
  // =============================

  newConfig.proxies = [
    ...filteredProxies,
    {
      name: '🇨🇳 直连 | IPv4优先',
      type: 'direct',
      'ip-version': 'ipv4-prefer',
    },
    {
      name: '🇨🇳 直连 | IPv6优先',
      type: 'direct',
      'ip-version': 'ipv6-prefer',
    },
    {
      name: '🇨🇳 直连 | 双栈',
      type: 'direct',
    },
  ];

  // =============================
  // 策略组
  // =============================

  newConfig['proxy-groups'] = [
    ...functionalGroups,
  ];

  // =============================
  // Rule Providers
  // =============================

  newConfig['rule-providers'] = finalRuleProviders;

  // =============================
  // Rules
  // =============================

  newConfig.rules = [
    'RULE-SET,github,手动选择',
    ...finalRules,
    'RULE-SET,gfw,手动选择',
    'RULE-SET,cn_additional,直连',
    'RULE-SET,cn_ip,直连',
    'MATCH,漏网之鱼',
  ];

  return newConfig;
}
