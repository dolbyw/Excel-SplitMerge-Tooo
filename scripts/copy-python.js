const fs = require('fs');
const path = require('path');

// 确保dist目录存在
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 需要复制的Python文件
const pythonFiles = [
  'split_excel.py',
  'merge_excel.py',
  'split_excel_format.py',
  'merge_excel_format.py'
];

// 需要复制的其他文件
const otherFiles = [
  { src: 'public/tooo-icon.svg', dest: 'tooo-icon.svg' }
];

// 复制Python文件到dist目录
pythonFiles.forEach(file => {
  const srcPath = path.join(__dirname, '..', file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`已复制: ${file}`);
  } else {
    console.warn(`文件不存在: ${file}`);
  }
});

// 复制其他文件到dist目录
otherFiles.forEach(item => {
  const srcPath = path.join(__dirname, '..', item.src);
  const destPath = path.join(distDir, item.dest);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`已复制: ${item.src} -> ${item.dest}`);
  } else {
    console.warn(`文件不存在: ${item.src}`);
  }
});

console.log('资源文件复制完成');