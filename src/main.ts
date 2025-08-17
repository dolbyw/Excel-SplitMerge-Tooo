import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { ProcessManager, CommandBuilder } from "./utils/processUtils";

// 使用环境变量判断开发环境，避免在app初始化前调用app.isPackaged
const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

// 创建主窗口
function createWindow(): void {
  const baseOptions: Electron.BrowserWindowConstructorOptions = {
    width: 800,
    height: 600,
    minWidth: 700,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    title: "Tooo",
    show: false,
    autoHideMenuBar: true,
  };

  // Windows 不支持 SVG 作为窗口图标，避免加载失败的警告
  if (process.platform !== "win32") {
    baseOptions.icon = path.join(
      __dirname,
      isDev ? "../public/tooo-icon.svg" : "tooo-icon.svg",
    );
  }

  mainWindow = new BrowserWindow(baseOptions);

  // 加载应用
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // 在打包环境中，渲染进程文件在 dist/renderer 目录（__dirname 指向 dist）
    mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
  }

  // 监听加载失败，便于排查白屏
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error("页面加载失败:", { errorCode, errorDescription, validatedURL });
  });

  // 窗口准备好后显示
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// 应用准备就绪
app.whenReady().then(() => {
  // 完全隐藏菜单栏
  Menu.setApplicationMenu(null);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC 通信接口

// 选择Excel文件
ipcMain.handle("select-excel-file", async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: "选择Excel文件",
      filters: [
        { name: "Excel文件", extensions: ["xlsx", "xls"] },
        { name: "所有文件", extensions: ["*"] },
      ],
      properties: ["openFile"],
    });

    if (result.canceled) {
      return {
        success: false,
        message: "用户取消选择文件"
      };
    }

    const filePath = result.filePaths[0];
    if (!filePath) {
      return {
        success: false,
        message: "未选择文件"
      };
    }

    return {
      success: true,
      filePath: filePath,
      fileName: path.basename(filePath)
    };
  } catch (error) {
    console.error("选择文件失败:", error);
    return {
      success: false,
      message: `选择文件失败: ${error instanceof Error ? error.message : "未知错误"}`
    };
  }
});

// 选择目录
ipcMain.handle("select-directory", async () => {
  try {
    if (!mainWindow) {
      console.error("主窗口未初始化");
      return {
        success: false,
        message: "主窗口未初始化"
      };
    }

    console.log("开始选择目录对话框");
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "选择包含Excel文件的目录",
      properties: ["openDirectory"],
      buttonLabel: "选择目录",
    });

    console.log("目录选择结果:", result);
    
    if (result.canceled) {
      return {
        success: false,
        message: "用户取消选择目录"
      };
    }

    const dirPath = result.filePaths[0];
    if (!dirPath) {
      return {
        success: false,
        message: "未选择目录"
      };
    }

    return {
      success: true,
      dirPath: dirPath,
      dirName: path.basename(dirPath)
    };
  } catch (error) {
    console.error("选择目录时发生错误:", error);
    return {
      success: false,
      message: `选择目录失败: ${error instanceof Error ? error.message : "未知错误"}`
    };
  }
});

// 选择保存文件
ipcMain.handle("select-save-file", async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: "保存Excel文件",
      filters: [
        { name: "Excel文件", extensions: ["xlsx", "xls"] },
        { name: "所有文件", extensions: ["*"] },
      ],
      defaultPath: "merged.xlsx",
    });

    if (result.canceled) {
      return {
        success: false,
        message: "用户取消保存文件"
      };
    }

    const filePath = result.filePath;
    if (!filePath) {
      return {
        success: false,
        message: "未指定保存路径"
      };
    }

    return {
      success: true,
      filePath: filePath,
      fileName: path.basename(filePath)
    };
  } catch (error) {
    console.error("保存文件对话框失败:", error);
    return {
      success: false,
      message: `保存文件失败: ${error instanceof Error ? error.message : "未知错误"}`
    };
  }
});

// Excel拆分处理
ipcMain.handle("split-excel", async (_event, options) => {
  const { inputFile, outputDir, rowsPerFile, preserveFormat, copyHeaders } =
    options;

  return new Promise((resolve) => {
    const scriptName = preserveFormat
      ? "split_excel_format.py"
      : "split_excel.py";
    const scriptPath = path.join(__dirname, "..", scriptName);

    // 使用CommandBuilder构建参数
    const args = new CommandBuilder()
      .addArg("input", inputFile)
      .addArg("output", outputDir)
      .addArg("rows", rowsPerFile)
      .addArg("copy_headers", copyHeaders)
      .build();

    // 记录开始时间，用于后续按修改时间筛选新生成的文件
    const startTime = Date.now();

    console.log("执行拆分命令:", scriptPath, args.join(" "));
    console.log("脚本路径:", scriptPath);
    console.log("脚本是否存在:", fs.existsSync(scriptPath));

    const pythonProcess = spawn("py", [scriptPath, ...args], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });
    let output = "";
    let errorOutput = "";

    // 使用ProcessManager创建超时处理
    const timeoutHandler = ProcessManager.createTimeoutHandler(
      pythonProcess,
      ProcessManager.DEFAULT_TIMEOUT,
      () => {
        console.log("Python合并进程超时，正在终止...");

        mainWindow?.webContents.send("processing-progress", {
          type: "error",
          message: "处理超时，请检查文件大小或网络连接",
        });

        resolve({
          success: false,
          message: "处理超时，请检查文件大小或网络连接",
          outputFile: "",
        });
      },
    );

    pythonProcess.stdout.on("data", (data) => {
      const message = data.toString("utf8");
      output += message;
      console.log("Python输出:", message.trim());

      // 发送进度更新
      mainWindow?.webContents.send("processing-progress", {
        progress: 50, // 简化的进度计算
        message: message.trim(),
        type: "info",
      });
    });

    pythonProcess.stderr.on("data", (data) => {
      const error = data.toString("utf8");
      errorOutput += error;
      console.error("Python错误输出:", error.trim());
    });

    pythonProcess.on("error", (error) => {
      console.error("Python进程启动失败:", error);
      timeoutHandler.clearTimeout();

      mainWindow?.webContents.send("processing-progress", {
        progress: 0,
        message: `进程启动失败: ${error.message}`,
        type: "error",
      });

      resolve({
        success: false,
        message: `进程启动失败: ${error.message}`,
        outputFiles: [],
      });
    });

    pythonProcess.on("close", (code) => {
      timeoutHandler.clearTimeout();

      console.log("Python进程退出，退出码:", code);
      console.log("完整输出:", output);
      if (errorOutput) console.error("完整错误输出:", errorOutput);

      if (code === 0) {
        // 获取输出文件列表（更健壮的匹配：优先按修改时间筛选最近生成的Excel文件，回退到名称模式匹配）
        let allFiles: string[] = [];
        try {
          allFiles = fs.readdirSync(outputDir);
          console.log("输出目录文件列表:", allFiles);
        } catch (error) {
          console.error("读取输出目录失败:", error);
          resolve({
            success: false,
            message: "读取输出目录失败",
            outputFiles: [],
          });
          return;
        }

        const recentExcelFiles = allFiles.filter((file) => {
          if (!/\.(xlsx|xls)$/i.test(file)) return false;
          try {
            const stat = fs.statSync(path.join(outputDir, file));
            // 容忍2秒误差，筛选出本次任务开始后生成/修改的文件
            return stat.mtimeMs >= startTime - 2000;
          } catch {
            return false;
          }
        });

        let outputFiles = recentExcelFiles.map((file) =>
          path.join(outputDir, file),
        );

        // 若未检测到近期生成的文件，则回退到名称匹配（支持 Split1.xlsx、split_1.xlsx、带空格等情况）
        if (outputFiles.length === 0) {
          const nameMatched = allFiles.filter((file) =>
            /split\s*_?\d+\.(xlsx|xls)$/i.test(file),
          );
          outputFiles = nameMatched.map((file) => path.join(outputDir, file));
        }

        console.log("检测到输出文件:", outputFiles);

        mainWindow?.webContents.send("processing-progress", {
          progress: 100,
          message: "拆分完成！",
          type: "success",
        });

        resolve({
          success: true,
          message: "拆分完成",
          outputFiles,
        });
      } else {
        mainWindow?.webContents.send("processing-progress", {
          progress: 0,
          message: `拆分失败: ${errorOutput}`,
          type: "error",
        });

        resolve({
          success: false,
          message: errorOutput || "拆分失败",
          outputFiles: [],
        });
      }
    });
  });
});

// Excel合并处理
ipcMain.handle("merge-excel", async (_event, options) => {
  const { inputDir, outputFile, preserveFormat, removeDuplicateHeaders } =
    options;

  return new Promise((resolve) => {
    const scriptName = preserveFormat
      ? "merge_excel_format.py"
      : "merge_excel.py";
    const scriptPath = path.join(__dirname, "..", scriptName);

    // 使用CommandBuilder构建参数
    const args = new CommandBuilder()
      .addArg("input_dir", inputDir)
      .addArg("output_file", outputFile)
      .addArg("remove_duplicate_headers", removeDuplicateHeaders)
      .build();

    console.log("执行合并命令:", scriptPath, args.join(" "));

    const pythonProcess = spawn("py", [scriptPath, ...args], {
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    let output = "";
    let errorOutput = "";

    // 使用ProcessManager创建超时处理
    const timeoutHandler = ProcessManager.createTimeoutHandler(
      pythonProcess,
      ProcessManager.DEFAULT_TIMEOUT,
      () => {
        console.log("Python合并进程超时，正在终止...");

        mainWindow?.webContents.send("processing-progress", {
          type: "error",
          message: "处理超时，请检查文件大小或网络连接",
        });

        resolve({
          success: false,
          message: "处理超时，请检查文件大小或网络连接",
          outputFile: "",
        });
      },
    );

    pythonProcess.stdout.on("data", (data) => {
      const message = data.toString("utf8");
      output += message;
      console.log("Python输出:", message.trim());

      // 发送进度更新
      mainWindow?.webContents.send("processing-progress", {
        progress: 50, // 简化的进度计算
        message: message.trim(),
        type: "info",
      });
    });

    pythonProcess.stderr.on("data", (data) => {
      const error = data.toString("utf8");
      errorOutput += error;
      console.error("Python错误输出:", error.trim());
    });

    pythonProcess.on("error", (error) => {
      console.error("Python合并进程启动失败:", error);
      timeoutHandler.clearTimeout();

      mainWindow?.webContents.send("processing-progress", {
        progress: 0,
        message: `进程启动失败: ${error.message}`,
        type: "error",
      });

      resolve({
        success: false,
        message: `进程启动失败: ${error.message}`,
        outputFile: "",
      });
    });

    pythonProcess.on("close", (code) => {
      timeoutHandler.clearTimeout();

      console.log("Python进程退出，退出码:", code);
      console.log("完整输出:", output);
      if (errorOutput) console.error("完整错误输出:", errorOutput);

      if (code === 0) {
        mainWindow?.webContents.send("processing-progress", {
          progress: 100,
          message: "合并完成！",
          type: "success",
        });

        resolve({
          success: true,
          message: "合并完成",
          outputFile,
        });
      } else {
        mainWindow?.webContents.send("processing-progress", {
          progress: 0,
          message: `合并失败: ${errorOutput}`,
          type: "error",
        });

        resolve({
          success: false,
          message: errorOutput || "合并失败",
          outputFile: "",
        });
      }
    });
  });
});

// 获取应用配置
ipcMain.handle("get-app-config", async () => {
  const configPath = path.join(app.getPath("userData"), "config.json");

  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      // 确保新的默认路径存在
      if (!config.defaultSplitOutputDir) {
        config.defaultSplitOutputDir = path.join(
          app.getPath("documents"),
          "ToooOutput",
          "Split",
        );
      }
      if (!config.defaultMergeOutputDir) {
        config.defaultMergeOutputDir = path.join(
          app.getPath("documents"),
          "ToooOutput",
          "Merge",
        );
      }
      return config;
    }
  } catch (error) {
    console.error("读取配置失败:", error);
  }

  // 返回默认配置
  return {
    defaultOutputDir: path.join(app.getPath("documents"), "ExcelOutput"), // 保持向后兼容
    defaultSplitOutputDir: path.join(
      app.getPath("documents"),
      "ToooOutput",
      "Split",
    ),
    defaultMergeOutputDir: path.join(
      app.getPath("documents"),
      "ToooOutput",
      "Merge",
    ),
    defaultRowsPerFile: 1000,
    defaultPreserveFormat: false,
    recentFiles: [],
  };
});

// 保存应用配置
ipcMain.handle("save-app-config", async (_event, config) => {
  const configPath = path.join(app.getPath("userData"), "config.json");

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    console.error("保存配置失败:", error);
    return { success: false, error: (error as Error).message };
  }
});

// 创建默认输出目录
ipcMain.handle("ensure-default-output-dirs", async () => {
  try {
    const splitDir = path.join(app.getPath("documents"), "ToooOutput", "Split");
    const mergeDir = path.join(app.getPath("documents"), "ToooOutput", "Merge");

    // 创建目录（如果不存在）
    if (!fs.existsSync(splitDir)) {
      fs.mkdirSync(splitDir, { recursive: true });
    }
    if (!fs.existsSync(mergeDir)) {
      fs.mkdirSync(mergeDir, { recursive: true });
    }

    return {
      success: true,
      splitDir,
      mergeDir,
    };
  } catch (error) {
    console.error("创建默认输出目录失败:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});
