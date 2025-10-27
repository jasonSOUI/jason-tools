# 專案規劃：多功能小工具網站 (使用 Vite + React)

本文檔旨在規劃與引導「多功能小工具網站」的開發，並為初次使用 Vite 的開發者提供詳細的步驟說明。

## 1. 摘要

本專案旨在建立一個單頁式應用程式 (SPA)，整合多種實用小工具。應用程式將採用現代化的前端技術，以確保高效的開發體驗與流暢的使用者體驗。

## 2. 核心技術

- **建置工具 (Build Tool):** Vite - 提供極速的開發伺服器啟動與熱模組更新 (HMR)。
- **前端框架 (Framework):** React (使用 TypeScript) - 採用元件化架構，利於模組化開發與維護。
- **路由管理 (Routing):** React Router - 實現 SPA 中的頁面切換。
- **UI 框架 (UI Framework):** React-Bootstrap & Bootstrap - 快速建立響應式且美觀的介面。
- **主題管理 (Theme Management):** React Context API 結合 CSS 變數，實現深色/淺色模式切換。

## 3. 主要功能與互動

- **身分證工具**：整合身分證字號的驗證與隨機產生功能，提供縣市、性別選擇，並具備歷史紀錄管理。
- **NB URL 分析**：輸入特定格式的網址，自動替換網域並解析參數，結果以表格呈現，並具備歷史紀錄管理與刪除功能。
- **掃描案件產生器**：輸入案件名稱，自動產生一系列帶有特定後綴的完整檔名，並具備歷史紀錄管理與刪除功能。
- **保險年齡計算**：根據出生日期和計算日期，精確計算實際足歲與保險年齡（考慮六個月加歲規則）。
- **西元與民國年轉換**：提供西元與民國年日期雙向即時轉換功能，支援日期格式解析與輸出。
- **檔案大小比對**：提供兩個檔案選擇器，可分別選擇多個原始檔案與修改後檔案，比對相同名稱檔案的大小差異，並以表格顯示結果。

## 4. 專案檔案結構 (規劃)

專案初始化後，我們會將 `src` 資料夾整理成以下結構：

```
/src
|-- components
|   `-- Sidebar.tsx         // 左側選單元件 (已整合至 App.tsx)
|-- contexts
|   `-- ThemeContext.tsx    // 主題管理 Context
|-- tools                   // 放置所有工具元件的資料夾
|   |-- IdTool.tsx          // 身分證驗證與產生器 (整合)
|   |-- NBUrlParser.tsx     // NB URL 分析工具
|   |-- ScanCaseGenerator.tsx // 掃描案件產生器
|   |-- InsuranceAgeCalculator.tsx // 保險年齡計算
|   |-- YearConverter.tsx   // 西元與民國年轉換
|   |-- Welcome.tsx         // 預設歡迎頁面
|
|-- App.tsx                 // 主應用程式，組合選單和各頁面
|-- main.tsx                // 應用程式進入點 (由 Vite 生成)
|-- index.css               // 全域樣式
```

## 5. Vite 專案建立與設定步驟

請依照以下步驟操作即可完成專案的初始化。

### 步驟一：使用 Vite 初始化專案

在您的終端機 (command line) 中，執行以下指令：

```bash
npm create vite@latest
```

執行後，Vite 會引導您進行幾個選擇：
1.  **Project name:** ... `jason-tools` (您可以輸入您喜歡的專案名稱，我們暫定為 `jason-tools`)
2.  **Select a framework:** ... `React` (使用上下方向鍵選擇)
3.  **Select a variant:** ... `TypeScript`

Vite 會根據您的選擇，在當前目錄下建立一個名為 `jason-tools` 的資料夾，並生成基本的專案檔案。

### 步驟二：進入專案目錄並安裝基本依賴

```bash
# 進入您剛剛建立的專案資料夾
cd jason-tools

# 安裝所有在 package.json 中定義的基本套件
npm install
```

`npm install` 會讀取 `package.json` 檔案，並將 React、Vite 等核心工具下載到您的 `node_modules` 資料夾中。

### 步驟三：安裝額外套件

我們的專案還需要路由和 UI 框架，請執行以下指令來安裝它們：

```bash
npm install react-router-dom bootstrap react-bootstrap
```
- `react-router-dom`: 用於處理頁面導航。
- `bootstrap`: 提供核心的 CSS 樣式。
- `react-bootstrap`: 將 Bootstrap 元件封裝為 React 元件，方便我們在 `.tsx` 檔案中使用。

### 步驟四：啟動開發伺服器

完成以上步驟後，您的專案就緒了。執行以下指令來啟動它：

```bash
npm run dev
```

終端機將顯示一個本地網址 (通常是 `http://localhost:5173`)。在瀏覽器中打開它，您就可以看到 Vite + React 的預設歡迎頁面了。接下來的開發，我們將在這個基礎上進行。
