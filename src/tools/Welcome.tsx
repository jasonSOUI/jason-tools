import React from 'react';

const Welcome: React.FC = () => {
  return (
    <div className="p-2">
      <h4 className="mb-3 text-primary fw-bold">歡迎使用 JASON'S TOOLS 小工具網站</h4>
      <p className="text-muted">
        請點擊左側選單選擇您需要的工具。本網站提供多種實用分析與輔助產生工具，所有歷史紀錄最高支援保存 <strong>50 筆</strong>。
      </p>
      <div className="alert alert-info border-0 shadow-sm d-flex align-items-center mb-4">
        <div>
          <strong>✨ 新功能上線：資料備份與搬移 (Export & Import)</strong><br />
          更換電腦或瀏覽器時，可至左側選單點選 <strong>「資料備份與搬移」</strong>，將歷史紀錄一鍵匯出為 JSON 檔並在新設備無縫還原！
        </div>
      </div>
      <p>
        <a href="https://github.com/jasonSOUI/LifeDocument/blob/main/%E7%AF%84%E4%BE%8B.md" target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
          檢視參考範例文件
        </a>
      </p>
    </div>
  );
};

export default Welcome;
