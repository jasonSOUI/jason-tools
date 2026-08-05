import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import { 
  FaDownload, 
  FaUpload, 
  FaCopy, 
  FaCheck, 
  FaTrash, 
  FaExchangeAlt, 
  FaExclamationTriangle,
  FaFileCode,
  FaInfoCircle
} from 'react-icons/fa';

interface BackupDataStructure {
  app: string;
  version: string;
  exportDate: string;
  data: Record<string, any>;
}

const DataBackup: React.FC = () => {
  // Export states
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Import states
  const [importInput, setImportInput] = useState('');
  const [parsedBackup, setParsedBackup] = useState<BackupDataStructure | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('merge');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'danger' | 'warning'; text: string } | null>(null);

  // Clear modal state
  const [showClearModal, setShowClearModal] = useState(false);

  // 1. Gather all relevant localStorage data
  const generateBackupPayload = (): BackupDataStructure => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const item = localStorage.getItem(key);
          if (item !== null) {
            // Attempt to parse JSON, if fails keep raw string
            try {
              data[key] = JSON.parse(item);
            } catch {
              data[key] = item;
            }
          }
        } catch (e) {
          console.error(`Error reading key ${key} from localStorage`, e);
        }
      }
    }

    return {
      app: 'jason-tools',
      version: '1.0',
      exportDate: new Date().toISOString(),
      data
    };
  };

  // 2. Export & Download JSON
  const handleDownloadBackup = () => {
    try {
      const payload = generateBackupPayload();
      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `jason-tools-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage({ type: 'success', text: '備份檔案已成功下載！' });
    } catch (err) {
      setExportMessage({ type: 'danger', text: '備份下載失敗，請稍後再試。' });
    }
  };

  // 3. Export & Copy to Clipboard
  const handleCopyBackup = () => {
    try {
      const payload = generateBackupPayload();
      const jsonString = JSON.stringify(payload, null, 2);
      navigator.clipboard.writeText(jsonString);
      setCopySuccess(true);
      setExportMessage({ type: 'success', text: '備份內容已複製至剪貼簿！' });
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      setExportMessage({ type: 'danger', text: '複製失敗，請手動複製內容。' });
    }
  };

  // 4. Handle File Select for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportInput(content);
      parseAndSetBackup(content);
    };
    reader.readAsText(file);
  };

  // 5. Parse JSON Input for Import Preview
  const parseAndSetBackup = (text: string) => {
    setImportMessage(null);
    if (!text.trim()) {
      setParsedBackup(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null && parsed.data && typeof parsed.data === 'object') {
        setParsedBackup(parsed as BackupDataStructure);
        setImportMessage({ type: 'success', text: '備份資料解析成功，請檢視上方預覽並選擇匯入方式。' });
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Fallback: raw key-value pair object
        setParsedBackup({
          app: 'jason-tools',
          version: '1.0',
          exportDate: new Date().toISOString(),
          data: parsed
        });
        setImportMessage({ type: 'warning', text: '偵測到自訂 JSON 結構，已自動嘗試載入為備份資料。' });
      } else {
        setParsedBackup(null);
        setImportMessage({ type: 'danger', text: '無效的備份 JSON 格式，請確認內容是否完整。' });
      }
    } catch (err) {
      setParsedBackup(null);
      setImportMessage({ type: 'danger', text: 'JSON 格式錯誤，無法正確解析。' });
    }
  };

  // 6. Execute Import
  const handleExecuteImport = () => {
    if (!parsedBackup || !parsedBackup.data) return;

    try {
      const targetData = parsedBackup.data;
      const MAX_ITEMS = 50;

      if (importMode === 'overwrite') {
        // Overwrite mode: clear target keys or all localStorage and set new ones
        Object.keys(targetData).forEach((key) => {
          const val = targetData[key];
          const valString = typeof val === 'string' ? val : JSON.stringify(val);
          localStorage.setItem(key, valString);
        });
      } else {
        // Merge mode: deduplicate history items up to MAX_ITEMS (50)
        Object.keys(targetData).forEach((key) => {
          const newVal = targetData[key];
          const oldValRaw = localStorage.getItem(key);

          if (Array.isArray(newVal)) {
            let oldVal: any[] = [];
            if (oldValRaw) {
              try {
                oldVal = JSON.parse(oldValRaw);
              } catch {
                oldVal = [];
              }
            }

            if (Array.isArray(oldVal)) {
              let merged: any[] = [];
              if (key === 'nbUrlHistory') {
                const combined = [...newVal, ...oldVal];
                const seen = new Set<string>();
                merged = combined.filter((item) => {
                  if (item?.originalUrl && !seen.has(item.originalUrl)) {
                    seen.add(item.originalUrl);
                    return true;
                  }
                  return !item?.originalUrl;
                }).slice(0, MAX_ITEMS);
              } else if (key === 'scanCaseHistory') {
                const combined = [...newVal, ...oldVal];
                const seen = new Set<string>();
                merged = combined.filter((item) => {
                  if (item?.baseName && !seen.has(item.baseName)) {
                    seen.add(item.baseName);
                    return true;
                  }
                  return !item?.baseName;
                }).slice(0, MAX_ITEMS);
              } else if (key === 'savedCaseRecords') {
                const combined = [...newVal, ...oldVal];
                const seen = new Set<string>();
                merged = combined.filter((item) => {
                  if (item?.originalUrl && !seen.has(item.originalUrl)) {
                    seen.add(item.originalUrl);
                    return true;
                  }
                  return !item?.originalUrl;
                });
              } else {
                merged = [...newVal, ...oldVal].slice(0, MAX_ITEMS);
              }
              localStorage.setItem(key, JSON.stringify(merged));
            } else {
              localStorage.setItem(key, JSON.stringify(newVal));
            }
          } else {
            // Non-array data (e.g. theme) overwrite directly
            const valString = typeof newVal === 'string' ? newVal : JSON.stringify(newVal);
            localStorage.setItem(key, valString);
          }
        });
      }

      setImportMessage({ type: 'success', text: '🎉 資料已成功匯入！相關歷史紀錄已同步還原。' });
      
      // Delay reload to give visual feedback
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setImportMessage({ type: 'danger', text: '匯入失敗：' + (err as Error).message });
    }
  };

  // 7. Clear all localStorage
  const handleClearAllStorage = () => {
    localStorage.clear();
    setShowClearModal(false);
    alert('所有本地儲存資料已清除！頁面即將重新整理。');
    window.location.reload();
  };

  // Helper function to count items in preview
  const getItemCount = (val: any) => {
    if (Array.isArray(val)) {
      return `${val.length} 筆紀錄`;
    } else if (typeof val === 'object' && val !== null) {
      return `物件 (${Object.keys(val).length} 項)`;
    }
    return String(val);
  };

  return (
    <div className="p-2">
      <Row className="g-4">
        {/* Export Data Card */}
        <Col lg={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <FaDownload className="me-2" /> 匯出資料 (Export Backup)
            </Card.Header>
            <Card.Body className="d-flex flex-column">
              <p className="text-muted fs-6">
                將您在此電腦瀏覽器中累積的所有小工具歷史紀錄（最高支援 50 筆紀錄）與個人設定備份為 JSON 檔案，以便搬移至其他電腦使用。
              </p>

              {exportMessage && (
                <Alert variant={exportMessage.type} dismissible onClose={() => setExportMessage(null)}>
                  {exportMessage.text}
                </Alert>
              )}

              <div className="bg-light p-3 rounded mb-3 border">
                <h6 className="d-flex align-items-center text-secondary mb-2">
                  <FaInfoCircle className="me-2" /> 目前已儲存的項目概覽：
                </h6>
                <ul className="mb-0 text-dark small">
                  <li>
                    <strong>NB URL 分析歷史:</strong>{' '}
                    <Badge bg="info" text="dark">
                      {getItemCount(JSON.parse(localStorage.getItem('nbUrlHistory') || '[]'))}
                    </Badge>
                  </li>
                  <li className="mt-1">
                    <strong>案件紀錄:</strong>{' '}
                    <Badge bg="success">
                      {getItemCount(JSON.parse(localStorage.getItem('savedCaseRecords') || '[]'))}
                    </Badge>
                  </li>
                  <li className="mt-1">
                    <strong>掃描案件產生歷史:</strong>{' '}
                    <Badge bg="info" text="dark">
                      {getItemCount(JSON.parse(localStorage.getItem('scanCaseHistory') || '[]'))}
                    </Badge>
                  </li>
                  <li className="mt-1">
                    <strong>主題模式 setting:</strong>{' '}
                    <Badge bg="secondary">
                      {localStorage.getItem('theme') || 'light'}
                    </Badge>
                  </li>
                </ul>
              </div>

              <div className="mt-auto d-flex flex-wrap gap-2">
                <Button variant="primary" onClick={handleDownloadBackup} className="d-flex align-items-center">
                  <FaDownload className="me-2" /> 匯出並下載 JSON 備份檔
                </Button>
                <Button variant="outline-secondary" onClick={handleCopyBackup} className="d-flex align-items-center">
                  {copySuccess ? <FaCheck className="me-2 text-success" /> : <FaCopy className="me-2" />}
                  {copySuccess ? '已複製!' : '複製 JSON 文字'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Import Data Card */}
        <Col lg={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-success text-white d-flex align-items-center">
              <FaUpload className="me-2" /> 匯入資料 (Import Backup)
            </Card.Header>
            <Card.Body className="d-flex flex-column">
              <p className="text-muted fs-6">
                上傳或貼上從其他電腦匯出的 JSON 備份檔，還原您的工具紀錄與設定。
              </p>

              {importMessage && (
                <Alert variant={importMessage.type} dismissible onClose={() => setImportMessage(null)}>
                  {importMessage.text}
                </Alert>
              )}

              {/* File Upload / Text Area */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">選擇 JSON 備份檔案：</Form.Label>
                <Form.Control type="file" accept=".json" onChange={handleFileChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">或直接貼上 JSON 文字：</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="請在此貼上 JSON 備份內容..."
                  value={importInput}
                  onChange={(e) => {
                    setImportInput(e.target.value);
                    parseAndSetBackup(e.target.value);
                  }}
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </Form.Group>

              {/* Parsed Preview Section */}
              {parsedBackup && (
                <div className="bg-light p-3 rounded mb-3 border">
                  <h6 className="d-flex align-items-center text-success mb-2">
                    <FaFileCode className="me-2" /> 備份資料內容預覽
                  </h6>
                  {parsedBackup.exportDate && (
                    <div className="small text-muted mb-2">
                      匯出時間: {new Date(parsedBackup.exportDate).toLocaleString()}
                    </div>
                  )}
                  <Table striped size="sm" className="mb-2">
                    <thead>
                      <tr>
                        <th>資料欄位 (Key)</th>
                        <th>資料筆數 / 內容</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(parsedBackup.data).map((key) => (
                        <tr key={key}>
                          <td><code>{key}</code></td>
                          <td>{getItemCount(parsedBackup.data[key])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Mode Selector */}
                  <Form.Group className="mt-3">
                    <Form.Label className="fw-semibold">匯入方式選項：</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="合併現有資料 (保留新舊資料並去重，最高50筆)"
                        name="importMode"
                        id="mode-merge"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="覆蓋現有資料 (完全以備份資料取代)"
                        name="importMode"
                        id="mode-overwrite"
                        checked={importMode === 'overwrite'}
                        onChange={() => setImportMode('overwrite')}
                      />
                    </div>
                  </Form.Group>

                  <Button variant="success" className="mt-3 w-100 fw-bold" onClick={handleExecuteImport}>
                    <FaExchangeAlt className="me-2" /> 執行匯入
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Danger Zone: Clear Data */}
      <Card className="mt-4 border-danger shadow-sm">
        <Card.Header className="bg-danger text-white d-flex align-items-center">
          <FaExclamationTriangle className="me-2" /> 危險區域 (Danger Zone)
        </Card.Header>
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h6 className="mb-1 text-danger fw-bold">清空本機的所有資料與歷史紀錄</h6>
            <p className="text-muted small mb-0">
              此操作將會徹底刪除儲存在此瀏覽器中的所有小工具歷史紀錄（無法復原，請先備份）。
            </p>
          </div>
          <Button variant="outline-danger" className="mt-2 mt-sm-0" onClick={() => setShowClearModal(true)}>
            <FaTrash className="me-2" /> 清除所有資料
          </Button>
        </Card.Body>
      </Card>

      {/* Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title><FaExclamationTriangle className="me-2" /> 確認清除資料</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          確定要刪除此電腦瀏覽器上的所有歷史紀錄與設定嗎？<strong>此操作無法復原！</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleClearAllStorage}>
            確認徹底清除
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DataBackup;
