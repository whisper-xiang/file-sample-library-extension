# Chrome 网上应用店 · Privacy 页粘贴稿

后台路径：Developer Dashboard → 你的扩展 → **Privacy**。

隐私政策需要 **HTTPS 公网地址**。把根目录 `PRIVACY.md` 或 `store/privacy.html` 推到 GitHub / GitHub Pages 后，把 URL 填进后台。不要填本地路径。

示例（仓库推送到 GitHub 后替换为真实地址）：

```
https://github.com/<你的用户名>/<仓库名>/blob/main/PRIVACY.md
```

或 Pages：

```
https://<你的用户名>.github.io/<仓库名>/store/privacy.html
```

---

## Single purpose（单一用途）

```
A local sample-file library for developers and testers. Users download tiny built-in files (text, data, media, CAD) or import their own test files for upload, preview, and parser checks. Files stay on the device. There is no account and no cloud sync.
```

中文备忘：

> 给开发和测试用的本地样本库。用户下载内置轻量文件，或导入自己的测试文件，用于上传、预览和解析。文件只留在本机。无账号、无云同步。

---

## Permission justification

### `downloads`

```
Only used when the user clicks Download. The extension writes the selected built-in sample or an imported local file to the browser’s default Downloads folder. It does not read download history or start downloads in the background.
```

---

## Remote code

选：**No, I am not using remote code.**

说明（若出现文本框）：

```
All sample files and scripts are bundled in the extension package. The extension does not load remote code.
```

---

## Data usage / certification

**Does this item collect or use any user data?**  
选 **No**（导入文件只存在用户自己的 IndexedDB，开发者收不到）。

若表单强制解释本地文件，在说明里写：

```
User-imported test files are stored only in IndexedDB on the device and are never transmitted.
```

认证声明全部勾选同意（Limited Use、不出售、不用于无关目的等），以后台当前英文原文为准。
