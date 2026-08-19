const $ = (selector) => document.querySelector(selector);
const list = $('#list');
const status = $('#status');
const input = $('#import');
const filters = $('#filters');
const searchInput = $('#search');
const importButton = $('#import-button');

const MAX_IMPORT_SIZE = 2 * 1024 * 1024;
const MAX_IMPORT_COUNT = 8;
const DB_NAME = 'file-sample-library';
const DB_VERSION = 1;
const STORE = 'imports';
const OBJECT_URL_TTL = 60_000;

let activeFilter = 'all';
let searchQuery = '';
let importedFiles = [];

const samples = [
  { ext: 'txt', category: 'text', name: '纯文本', note: 'UTF-8 文本', color: '#d7f0e6', content: 'Hello, file tester!\n这是一个 UTF-8 文本样本。\n', type: 'text/plain' },
  { ext: 'md', category: 'text', name: 'Markdown', note: '标题、列表与链接', color: '#f4e8bf', content: '# Test file\n\n- Upload test\n- Parser test\n', type: 'text/markdown' },
  { ext: 'html', category: 'text', name: '网页文档', note: '简短 HTML 页面', color: '#f6dacd', content: '<!doctype html><h1>Test page</h1><p>Small HTML sample.</p>', type: 'text/html' },
  { ext: 'json', category: 'data', name: 'JSON 数据', note: '常见 API 结构', color: '#d8e7ff', content: '{"id":1,"name":"test-file","enabled":true}\n', type: 'application/json' },
  { ext: 'csv', category: 'data', name: 'CSV 表格', note: '两行用户数据', color: '#d7f0df', content: 'id,name,active\n1,Ada,true\n2,Linus,false\n', type: 'text/csv' },
  { ext: 'xml', category: 'data', name: 'XML 数据', note: '简单节点结构', color: '#eadcf7', content: '<?xml version="1.0"?><sample><name>test</name><valid>true</valid></sample>', type: 'application/xml' },
  { ext: 'yaml', category: 'data', name: 'YAML 配置', note: '两行键值', color: '#e4efe6', content: 'name: test-file\nenabled: true\n', type: 'text/yaml' },
  { ext: 'zip', category: 'data', name: 'ZIP 压缩包', note: '含 readme.txt', color: '#efe6d8', asset: 'samples/test-sample.zip', type: 'application/zip' },
  { ext: 'svg', category: 'media', name: 'SVG 图片', note: '60 × 60 矢量图形', color: '#feded6', content: '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#5c86e8"/><circle cx="30" cy="30" r="15" fill="#172033"/></svg>', type: 'image/svg+xml' },
  { ext: 'png', category: 'media', name: 'PNG 图片', note: '60 × 60 位图', color: '#e4f0ff', asset: 'samples/test-sample.png', type: 'image/png' },
  { ext: 'jpg', category: 'media', name: 'JPEG 图片', note: '60 × 60 位图', color: '#f3e4d4', asset: 'samples/test-sample.jpg', type: 'image/jpeg' },
  { ext: 'webp', category: 'media', name: 'WebP 图片', note: '60 × 60 位图', color: '#e8f3d8', asset: 'samples/test-sample.webp', type: 'image/webp' },
  { ext: 'pdf', category: 'media', name: 'PDF 文档', note: '单页合法 PDF', color: '#ffd5d1', asset: 'samples/test-sample.pdf', type: 'application/pdf' },
  { ext: 'mp3', category: 'media', name: 'MP3 音频', note: '0.25 秒静音', color: '#f0e0f4', asset: 'samples/test-sample.mp3', type: 'audio/mpeg' },
  { ext: 'wav', category: 'media', name: 'WAV 音频', note: '0.2 秒静音', color: '#dceaf5', asset: 'samples/test-sample.wav', type: 'audio/wav' },
  { ext: 'mp4', category: 'media', name: 'MP4 视频', note: '64 × 48 色块', color: '#f6dce8', asset: 'samples/test-sample.mp4', type: 'video/mp4' },
  { ext: 'dwg', category: 'cad', name: 'DWG 图纸', note: 'DWG R21 (2007-2009)', color: '#fae3bd', asset: 'samples/test-sample.dwg', type: 'application/acad' },
  { ext: 'ocf', category: 'cad', name: 'OCF 专用文件', note: 'OCF-P 二进制样本', color: '#dbe2ff', asset: 'samples/test-sample.ocf', type: 'application/octet-stream' },
];

const assetCache = new Map();

const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

const ICON_DOWNLOAD = '<svg class="icon" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/></svg>';
const ICON_TRASH = '<svg class="icon" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/></svg>';

function iconButton({ action, attrs, label, icon, danger = false }) {
  return `<button type="button" class="icon-button${danger ? ' danger' : ''}" data-action="${action}" ${attrs} aria-label="${escapeHTML(label)}" title="${escapeHTML(label)}">${icon}</button>`;
}

function humanSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeFilename(name, fallback) {
  const cleaned = String(name || fallback).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim();
  return (cleaned || fallback).slice(0, 120);
}

function setStatus(message, error = false) {
  status.textContent = message;
  status.classList.toggle('error', error);
}

function remainingSlots() {
  return Math.max(0, MAX_IMPORT_COUNT - importedFiles.length);
}

function setFilter(filter) {
  activeFilter = filter;
  for (const button of filters.querySelectorAll('button')) {
    button.classList.toggle('active', button.dataset.filter === filter);
  }
}

function matchesQuery(file) {
  if (!searchQuery) return true;
  return [file.ext, file.name, file.note].filter(Boolean).join(' ').toLowerCase().includes(searchQuery);
}

function emptyMessage() {
  if (searchQuery) return `没有匹配“${escapeHTML(searchQuery)}”的样本。`;
  if (activeFilter === 'imported') return '还没有导入文件。<br>点击右上角“导入”添加测试样本。';
  return '这个分类下没有样本。';
}

function sampleRow(file) {
  return `<tr title="${escapeHTML(file.note)}">
    <td class="file-ext">${escapeHTML(file.ext.toUpperCase())}</td>
    <td class="file-name">${escapeHTML(file.name)}</td>
    <td class="file-size">${escapeHTML(humanSize(file.size) || '-')}</td>
    <td>
      <div class="row-actions">
        ${iconButton({ action: 'download-sample', attrs: `data-ext="${escapeHTML(file.ext)}"`, label: `下载 ${file.ext.toUpperCase()}`, icon: ICON_DOWNLOAD })}
      </div>
    </td>
  </tr>`;
}

function importRow(file) {
  return `<tr>
    <td class="file-ext">${escapeHTML(file.ext)}</td>
    <td class="file-name">${escapeHTML(file.name)}</td>
    <td class="file-size">${escapeHTML(humanSize(file.size) || '-')}</td>
    <td>
      <div class="row-actions">
        ${iconButton({ action: 'download-import', attrs: `data-id="${escapeHTML(file.id)}"`, label: `下载 ${file.name}`, icon: ICON_DOWNLOAD })}
        ${iconButton({ action: 'remove-import', attrs: `data-id="${escapeHTML(file.id)}"`, label: `移除 ${file.name}`, icon: ICON_TRASH, danger: true })}
      </div>
    </td>
  </tr>`;
}

function updateImportChrome() {
  const left = remainingSlots();
  const hint = left
    ? `本地保存，还可导入 ${left} 个，单个不超过 2 MB。`
    : `已达 ${MAX_IMPORT_COUNT} 个上限，移除后可继续导入。`;
  importButton.title = hint;
  importButton.setAttribute('aria-label', left ? '导入文件' : hint);
  importButton.classList.toggle('is-disabled', left === 0);
  input.disabled = left === 0;
}

function render() {
  const shownSamples = samples.filter((file) => (activeFilter === 'all' || file.category === activeFilter) && matchesQuery(file));
  const shownImports = importedFiles.filter((file) => (activeFilter === 'all' || activeFilter === 'imported') && matchesQuery(file));
  const rows = [...shownSamples.map(sampleRow), ...shownImports.map(importRow)];
  list.innerHTML = rows.length
    ? `<table class="file-table"><thead><tr><th>格式</th><th>名称</th><th>大小</th><th></th></tr></thead><tbody>${rows.join('')}</tbody></table>`
    : `<div class="empty-state">${emptyMessage()}</div>`;
  updateImportChrome();
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('无法打开本地存储。'));
  });
}

function runStore(mode, prepare) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      db.close();
      fn(value);
    };
    const tx = db.transaction(STORE, mode);
    const request = prepare(tx.objectStore(STORE));
    let result;
    if (request) {
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => finish(reject, request.error);
    }
    tx.oncomplete = () => finish(resolve, result);
    tx.onerror = () => finish(reject, tx.error || new Error('本地存储失败。'));
  }));
}

const getAllImports = () => runStore('readonly', (store) => store.getAll()).then((rows) => rows || []);
const putImport = (record) => runStore('readwrite', (store) => store.put(record));
const deleteImport = (id) => runStore('readwrite', (store) => store.delete(id));

function assetURL(path) {
  return globalThis.chrome?.runtime?.getURL?.(path) || path;
}

async function loadAsset(path) {
  if (!assetCache.has(path)) {
    const response = await fetch(assetURL(path));
    if (!response.ok) throw new Error(`无法读取样本 ${path}`);
    assetCache.set(path, await response.blob());
  }
  return assetCache.get(path);
}

async function hydrateSampleSizes() {
  await Promise.all(samples.map(async (sample) => {
    try {
      if (sample.content != null) sample.size = new Blob([sample.content]).size;
      else if (sample.asset) sample.size = (await loadAsset(sample.asset)).size;
    } catch {
      sample.size = 0;
    }
  }));
}

async function sampleBlob(sample) {
  if (sample.asset) {
    const blob = await loadAsset(sample.asset);
    return blob.type ? blob : new Blob([blob], { type: sample.type });
  }
  return new Blob([sample.content], { type: sample.type });
}

function startDownload(url, filename) {
  if (!globalThis.chrome?.downloads?.download) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    return Promise.resolve(-1);
  }

  return new Promise((resolve, reject) => {
    chrome.downloads.download({ url, filename, saveAs: false }, (id) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(id);
    });
  });
}

async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const revoke = () => URL.revokeObjectURL(url);
  try {
    const id = await startDownload(url, filename);
    if (id < 0 || !globalThis.chrome?.downloads?.onChanged) {
      setTimeout(revoke, 1000);
      return;
    }
    const onChanged = (delta) => {
      if (delta.id !== id || !delta.state) return;
      if (delta.state.current === 'complete' || delta.state.current === 'interrupted') {
        chrome.downloads.onChanged.removeListener(onChanged);
        revoke();
      }
    };
    chrome.downloads.onChanged.addListener(onChanged);
    setTimeout(() => {
      chrome.downloads.onChanged.removeListener(onChanged);
      revoke();
    }, OBJECT_URL_TTL);
  } catch (error) {
    revoke();
    throw error;
  }
}

async function withBusy(button, task) {
  if (!button || button.disabled) return;
  button.disabled = true;
  try {
    await task();
  } finally {
    button.disabled = false;
  }
}

async function downloadSample(ext, button) {
  const sample = samples.find((item) => item.ext === ext);
  if (!sample) return setStatus('未找到该样本。', true);
  await withBusy(button, async () => {
    try {
      await downloadBlob(await sampleBlob(sample), safeFilename(`test-sample.${sample.ext}`, `test-sample.${sample.ext}`));
      setStatus(`test-sample.${sample.ext} 已开始下载。`);
    } catch (error) {
      setStatus(`下载失败：${error.message}`, true);
    }
  });
}

async function downloadImportedFile(id, button) {
  const file = importedFiles.find((item) => item.id === id);
  if (!file) return setStatus('未找到该导入文件。', true);
  await withBusy(button, async () => {
    try {
      await downloadBlob(file.blob, safeFilename(file.name, `imported.${file.ext.toLowerCase()}`));
      setStatus(`${file.name} 已开始下载。`);
    } catch (error) {
      setStatus(`下载失败：${error.message}`, true);
    }
  });
}

async function importFiles(fileList) {
  const files = [...fileList];
  if (!files.length) return;

  const saved = [];
  const skipped = [];

  for (const file of files) {
    if (importedFiles.length >= MAX_IMPORT_COUNT) {
      skipped.push(`${file.name}（数量已满）`);
      continue;
    }
    if (file.size > MAX_IMPORT_SIZE) {
      skipped.push(`${file.name}（超过 2 MB）`);
      continue;
    }

    const ext = (file.name.split('.').pop() || 'FILE').slice(0, 8).toUpperCase();
    const record = {
      id: crypto.randomUUID(),
      name: file.name,
      ext,
      size: file.size,
      type: file.type || 'application/octet-stream',
      blob: file.slice(0, file.size, file.type || 'application/octet-stream'),
    };

    try {
      await putImport(record);
      importedFiles.push(record);
      saved.push(file.name);
    } catch (error) {
      skipped.push(`${file.name}（${error.message}）`);
    }
  }

  if (saved.length) {
    setFilter('imported');
    render();
  }

  if (saved.length && skipped.length) setStatus(`已保存 ${saved.length} 个文件，跳过：${skipped.join('、')}。`, true);
  else if (saved.length) setStatus(saved.length === 1 ? `${saved[0]} 已保存到“我的文件”。` : `已保存 ${saved.length} 个文件到“我的文件”。`);
  else setStatus(`导入失败：${skipped.join('、') || '没有可保存的文件'}。`, true);
}

async function removeImportedFile(id) {
  const file = importedFiles.find((item) => item.id === id);
  try {
    await deleteImport(id);
    importedFiles = importedFiles.filter((item) => item.id !== id);
    render();
    setStatus(`${file?.name || '文件'} 已移除。`);
  } catch (error) {
    setStatus(`移除失败：${error.message}`, true);
  }
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  setFilter(button.dataset.filter);
  render();
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  render();
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.action === 'download-sample') downloadSample(button.dataset.ext, button);
  if (button.dataset.action === 'download-import') downloadImportedFile(button.dataset.id, button);
  if (button.dataset.action === 'remove-import') removeImportedFile(button.dataset.id);
});

input.addEventListener('change', async () => {
  try {
    await importFiles(input.files);
  } finally {
    input.value = '';
  }
});

const preview = new URLSearchParams(location.search);
if (preview.get('filter')) setFilter(preview.get('filter'));
if (preview.get('q')) {
  searchInput.value = preview.get('q');
  searchQuery = preview.get('q').trim().toLowerCase();
}

render();

hydrateSampleSizes()
  .then(getAllImports)
  .then((rows) => {
    importedFiles = rows;
    render();
  })
  .catch((error) => {
    render();
    setStatus(`无法读取已导入文件：${error.message}`, true);
  });
