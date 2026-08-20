# 文件样本库

独立的 Chrome 扩展，用于下载和保留小体积测试文件。内置文本、数据、图片、音视频和图纸类样本。导入的文件保存在浏览器 IndexedDB，最多 8 个、单个不超过 2 MB。

## 本地加载

在 `chrome://extensions` 开启开发者模式后，选择“加载已解压的扩展程序”，并选择本目录。若已加载过旧版本，点击“重新加载”即可。

## 上架 Chrome 网上应用店

商店文案、隐私政策和图片在 `store/`。逐步填写说明见 [`store/LISTING.md`](store/LISTING.md)。

打包上传：

```bash
python3 store/make-assets.py   # 改界面后重出截图
./pack-store.sh
```

生成的 zip 在 `dist/file-sample-library.zip`。
