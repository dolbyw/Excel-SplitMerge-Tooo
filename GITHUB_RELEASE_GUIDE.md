# GitHub Release 创建指南

## 📋 准备工作

✅ **已完成的步骤**:
- Git标签 `v1.0.0` 已创建并推送
- 便携版应用已构建: `Tooo-Portable-v1.0.0.zip`
- Release说明文档已准备: `RELEASE_NOTES.md`

## 🚀 创建GitHub Release步骤

### 1. 访问GitHub仓库
- 打开: https://github.com/dolbyw/Excel-SplitMerge-Tooo
- 点击 "Releases" 标签页
- 点击 "Create a new release" 按钮

### 2. 配置Release信息

#### 标签版本
- **Tag version**: `v1.0.0` (已存在)
- **Target**: `master` (默认分支)

#### Release标题
```
Tooo Excel处理工具 v1.0.0 - 首个正式版本
```

#### Release描述
复制以下内容到描述框:

```markdown
# 🎉 Tooo Excel处理工具 v1.0.0

## 功能特性
- ✅ **Excel文件拆分**: 按行数拆分大型Excel文件
- ✅ **Excel文件合并**: 合并多个Excel文件
- ✅ **格式保留**: 基础版和格式保留版两种模式
- ✅ **多格式支持**: 兼容.xlsx和.xls格式
- ✅ **现代界面**: React + Electron桌面应用

## 📦 下载

### 便携版（推荐）
- **文件**: `Tooo-Portable-v1.0.0.zip`
- **大小**: ~110MB
- **系统**: Windows 10/11 x64
- **使用**: 解压即用，无需安装

## 🚀 快速开始
1. 下载便携版压缩包
2. 解压到任意目录
3. 双击 `Tooo.exe` 启动
4. 开始处理Excel文件

## 🔧 主要改进
- 修复导出文件序号问题
- 优化大文件处理性能
- 改善用户界面体验
- 完善错误处理机制

## 📋 系统要求
- Windows 10/11 (x64)
- 4GB+ 内存推荐
- 200MB 可用磁盘空间

## 🆘 支持
遇到问题请在 [Issues](https://github.com/dolbyw/Excel-SplitMerge-Tooo/issues) 页面反馈。
```

### 3. 上传Release资产

#### 必需文件
- **主要下载**: `Tooo-Portable-v1.0.0.zip`
- **说明文档**: `RELEASE_NOTES.md` (可选)

#### 上传步骤
1. 在 "Attach binaries" 区域
2. 拖拽或点击选择 `Tooo-Portable-v1.0.0.zip`
3. 等待上传完成
4. 可选：上传 `RELEASE_NOTES.md`

### 4. 发布设置

#### 选项配置
- ✅ **Set as the latest release** (设为最新版本)
- ❌ **Set as a pre-release** (不勾选，这是正式版)
- ✅ **Create a discussion for this release** (可选，创建讨论)

### 5. 发布Release
- 检查所有信息无误
- 点击 "Publish release" 按钮
- 等待发布完成

## ✅ 发布后验证

### 检查项目
1. **Release页面**: 确认v1.0.0显示在Releases列表
2. **下载链接**: 测试便携版下载链接
3. **文件完整性**: 验证下载的zip文件可正常解压
4. **应用启动**: 测试解压后的Tooo.exe可正常运行

### 更新文档
- 更新README.md中的下载链接
- 指向新的Release页面
- 更新版本号信息

## 📝 注意事项

1. **文件大小**: 便携版约110MB，在GitHub限制范围内
2. **下载统计**: GitHub会自动统计下载次数
3. **版本管理**: 后续版本使用v1.0.1, v1.1.0等标签
4. **更新通知**: 发布后可在项目README中添加更新通知

## 🔄 后续版本发布

对于未来版本:
1. 更新版本号 (如v1.0.1)
2. 重新构建便携版
3. 创建新的Git标签
4. 重复上述Release创建流程

---

**创建时间**: 2025年1月20日  
**适用版本**: v1.0.0  
**文档版本**: 1.0