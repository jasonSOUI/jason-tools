import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { 
  FaBookmark, 
  FaExternalLinkAlt, 
  FaLaptopCode, 
  FaTrash, 
  FaSearch, 
  FaSave, 
  FaCheck,
  FaCopy
} from 'react-icons/fa';

export interface SavedCaseRecord {
  id: string;
  applNum: string;
  nodeName: string;
  originalUrl: string;
  transformedUrl: string;
  createdAt: string;
  notes: string;
}

const CaseRecord: React.FC = () => {
  const [records, setRecords] = useState<SavedCaseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    try {
      const stored = localStorage.getItem('savedCaseRecords');
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Failed to load savedCaseRecords from localStorage', error);
      setRecords([]);
    }
  };

  const saveRecordsToStorage = (updatedRecords: SavedCaseRecord[]) => {
    setRecords(updatedRecords);
    localStorage.setItem('savedCaseRecords', JSON.stringify(updatedRecords));
  };

  const handleDeleteOne = (id: string) => {
    if (window.confirm('確定要刪除這筆案件紀錄嗎？')) {
      const updated = records.filter(r => r.id !== id);
      saveRecordsToStorage(updated);
      setAlertMessage({ type: 'success', text: '已刪除該筆案件紀錄' });
    }
  };

  const handleDeleteAll = () => {
    saveRecordsToStorage([]);
    setShowClearModal(false);
    setAlertMessage({ type: 'success', text: '已清除所有案件紀錄' });
  };

  const handleStartEdit = (record: SavedCaseRecord) => {
    setEditingId(record.id);
    setEditNotesText(record.notes || '');
  };

  const handleSaveNotes = (id: string) => {
    const updated = records.map(r => {
      if (r.id === id) {
        return { ...r, notes: editNotesText };
      }
      return r;
    });
    saveRecordsToStorage(updated);
    setEditingId(null);
    setSavedSuccessId(id);
    setTimeout(() => setSavedSuccessId(null), 2000);
  };

  const handleCopyUrls = (record: SavedCaseRecord) => {
    const textToCopy = `受理號碼: ${record.applNum}\n狀態: ${record.nodeName || '無'}\n原本連結: ${record.originalUrl}\n本機連結: ${record.transformedUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccessId(record.id);
    setTimeout(() => setCopySuccessId(null), 2000);
  };

  // Filter records by search term
  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (r.applNum && r.applNum.toLowerCase().includes(term)) ||
      (r.nodeName && r.nodeName.toLowerCase().includes(term)) ||
      (r.notes && r.notes.toLowerCase().includes(term)) ||
      (r.originalUrl && r.originalUrl.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-2">
      {alertMessage && (
        <Alert variant={alertMessage.type} dismissible onClose={() => setAlertMessage(null)}>
          {alertMessage.text}
        </Alert>
      )}

      {/* Control Header */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="搜尋受理號碼、狀態、備註或網址..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    清除
                  </Button>
                )}
              </InputGroup>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end align-items-center gap-2">
              <Badge bg="primary" className="fs-6 px-3 py-2">
                共 {records.length} 筆案件
              </Badge>
              {records.length > 0 && (
                <Button variant="outline-danger" size="sm" onClick={() => setShowClearModal(true)}>
                  <FaTrash className="me-1" /> 全部清除
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Main Table */}
      {filteredRecords.length > 0 ? (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover striped className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '13%' }}>受理號碼</th>
                  <th style={{ width: '13%' }}>目前狀態</th>
                  <th style={{ width: '24%' }}>連結 (原本 / 本機)</th>
                  <th style={{ width: '15%' }}>建立時間</th>
                  <th style={{ width: '23%' }}>備註 (點擊可修改)</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    {/* 受理號碼 */}
                    <td>
                      <span className="fw-bold text-dark">{record.applNum || '無受理號碼'}</span>
                    </td>

                    {/* 目前狀態 */}
                    <td>
                      {record.nodeName ? (
                        <Badge bg="info" text="dark" className="fs-6 fw-normal">
                          {record.nodeName}
                        </Badge>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>

                    {/* 連結 */}
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <a
                          href={record.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm text-start text-truncate d-inline-flex align-items-center"
                          style={{ maxWidth: '280px' }}
                          title={record.originalUrl}
                        >
                          <FaExternalLinkAlt className="me-1 flex-shrink-0" />
                          <span className="text-truncate">原本連結</span>
                        </a>
                        <a
                          href={record.transformedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success btn-sm text-start text-truncate d-inline-flex align-items-center"
                          style={{ maxWidth: '280px' }}
                          title={record.transformedUrl}
                        >
                          <FaLaptopCode className="me-1 flex-shrink-0" />
                          <span className="text-truncate">本機端連結</span>
                        </a>
                      </div>
                    </td>

                    {/* 建立時間 */}
                    <td>
                      <small className="text-muted">{record.createdAt}</small>
                    </td>

                    {/* 備註 (可修改) */}
                    <td>
                      {editingId === record.id ? (
                        <InputGroup size="sm">
                          <Form.Control
                            type="text"
                            value={editNotesText}
                            onChange={(e) => setEditNotesText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNotes(record.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                          <Button variant="success" onClick={() => handleSaveNotes(record.id)}>
                            <FaSave /> 儲存
                          </Button>
                        </InputGroup>
                      ) : (
                        <div
                          className="p-1 rounded cursor-pointer border-hover"
                          onClick={() => handleStartEdit(record)}
                          style={{ cursor: 'pointer', minHeight: '32px' }}
                          title="點擊修改備註"
                        >
                          {record.notes ? (
                            <span>{record.notes}</span>
                          ) : (
                            <span className="text-muted fst-italic small">點擊新增備註...</span>
                          )}
                          {savedSuccessId === record.id && (
                            <Badge bg="success" className="ms-2">
                              已儲存
                            </Badge>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 操作 */}
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleCopyUrls(record)}
                          title="複製此案件資訊"
                        >
                          {copySuccessId === record.id ? <FaCheck className="text-success" /> : <FaCopy />}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteOne(record.id)}
                          title="刪除此紀錄"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Card className="text-center p-5 border-0 shadow-sm">
          <Card.Body>
            <FaBookmark className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.4 }} />
            <h5 className="text-secondary">尚無留存的案件紀錄</h5>
            <p className="text-muted">
              您可以在「NB URL 分析」右側歷史紀錄點擊 <FaBookmark className="text-primary mx-1" /> 按鈕，將重要案件特別保留至此。
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>確認清空所有案件紀錄</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          確定要刪除全部的案件紀錄嗎？此操作無法復原。
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDeleteAll}>
            確認清空
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CaseRecord;
