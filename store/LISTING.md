# Chrome 网上应用店提交清单

扩展代码、图标、截图和文案都已按上架要求准备好。下面按顺序做**你必须亲手完成**的账号与上传步骤。文案和图都在本目录，直接粘贴 / 上传即可。

## 0. 生成图片（改界面后重跑）

在项目根目录：

```bash
python3 store/make-assets.py
```

会写出：

| 文件 | 用途 | 尺寸 |
|------|------|------|
| `store/icon-128.png` | 商店图标 | 128×128 |
| `store/assets/screenshot-catalog.png` | 截图：目录 | 1280×800 |
| `store/assets/screenshot-cad.png` | 截图：CAD | 1280×800 |
| `store/assets/screenshot-search.png` | 截图：搜索 | 1280×800 |
| `store/assets/promo-small.png` | **小型宣传图块**（必传） | 440×280 |
| `store/assets/promo-marquee.png` | **顶部宣传图块**（推荐） | 1400×560 |

需要 Google Chrome。商店要求截图为 24 位 PNG（无透明通道），脚本已处理。

## 1. 开发者账号（一次性）

1. 打开 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 同意协议，支付 **$5**
3. Google 账号开启 [两步验证](https://myaccount.google.com/signinoptions/two-step-verification)
4. 按提示完成身份核验（证件）
5. 免费个人扩展：Trader 选 **Non-trader**

## 2. 隐私政策（已上线）

商店 Privacy 页填：

```
https://github.com/whisper-xiang/file-sample-library-extension/blob/main/PRIVACY.md
```

## 3. 打 zip

```bash
./pack-store.sh
```

得到 `dist/file-sample-library.zip`。zip 根目录必须是 `manifest.json`，不要多包一层文件夹。

## 4. 后台填表

New item → 上传 zip，然后按标签页填：

| 标签 | 打开这份稿 |
|------|------------|
| Store listing（中文） | [`listing-zh.md`](listing-zh.md) |
| Store listing（英文，可选） | [`listing-en.md`](listing-en.md) |
| Privacy | [`privacy-practices.md`](privacy-practices.md) |
| Distribution | 公开、免费；见 `listing-zh.md` 底部 |
| Test instructions | [`test-instructions.md`](test-instructions.md) |

Listing 图片上传：

1. 图标：`store/icon-128.png`
2. 截图（按此顺序，最多 5 张）：catalog → cad → search
3. 小型宣传图块：`store/assets/promo-small.png`
4. 顶部宣传图块：`store/assets/promo-marquee.png`

## 5. 提交

点 **Submit for Review**。建议勾选审核通过后再手动 Publish，方便你先自己装一遍商店版。

首次审核常见几天到两周。`downloads` 权限把 Test instructions 填完整会快一些。

## 6. 若因「说明关键字过多」被拒（Yellow Argon）

1. 打开 Store listing，把**详细介绍**整段换成 [`listing-zh.md`](listing-zh.md) / [`listing-en.md`](listing-en.md) 里的新稿（已改成叙述，不再罗列 TXT、JSON、MP3 等）。
2. 简短介绍也换成同一文件里的新句。
3. 上传 `dist/file-sample-library.zip`（版本已升到 **1.3.1**）。
4. 提交一份**新草稿**。不要把旧说明原样再贴回去。

## 发布之后

1. 把 Chrome 商店链接补进根目录 `README.md`
2. 以后改版本：先改 `manifest.json` 的 `version`，再 `./pack-store.sh`，后台上传新 zip
