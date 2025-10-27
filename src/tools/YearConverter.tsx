import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';

// Helper to format a Date object into YYYY/MM/DD string
const formatDateToWestern = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// Helper to format a Date object into YYYY/MM/DD string (Minguo year)
const formatDateToMinguo = (date: Date): string => {
  const year = date.getFullYear() - 1911;
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// Helper to parse a date string (YYYY/MM/DD or YYY/MM/DD) into a Date object
const parseDateString = (dateStr: string, isMinguo: boolean): Date | null => {
  const parts = dateStr.split('/').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    let year = parts[0];
    const month = parts[1];
    const day = parts[2];

    if (isMinguo) {
      year += 1911;
    }

    const date = new Date(year, month - 1, day);
    // Validate date components (e.g., month is 1-12, day is valid for month)
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return date;
    }
  }
  return null;
};

const YearConverter: React.FC = () => {
  const today = new Date();
  const [minguoDateStr, setMinguoDateStr] = useState(formatDateToMinguo(today));
  const [westernDateStr, setWesternDateStr] = useState(formatDateToWestern(today));
  const [lastChanged, setLastChanged] = useState<'minguo' | 'western' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effect for Minguo input changes
  useEffect(() => {
    if (lastChanged === 'minguo') {
      setError(null);
      if (!minguoDateStr.trim()) {
        setWesternDateStr('');
        return;
      }
      const parsedDate = parseDateString(minguoDateStr, true);
      if (parsedDate) {
        setWesternDateStr(formatDateToWestern(parsedDate));
      } else {
        setWesternDateStr('');
        setError('民國年日期格式不正確 (例如: 114/10/27)');
      }
    }
  }, [minguoDateStr, lastChanged]);

  // Effect for Western input changes
  useEffect(() => {
    if (lastChanged === 'western') {
      setError(null);
      if (!westernDateStr.trim()) {
        setMinguoDateStr('');
        return;
      }
      const parsedDate = parseDateString(westernDateStr, false);
      if (parsedDate) {
        setMinguoDateStr(formatDateToMinguo(parsedDate));
      } else {
        setMinguoDateStr('');
        setError('西元年日期格式不正確 (例如: 2025/10/27)');
      }
    }
  }, [westernDateStr, lastChanged]);

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>民國年日期 (YYY/MM/DD)</Form.Label>
            <Form.Control
              type="text"
              placeholder="例如: 114/10/27"
              value={minguoDateStr}
              onChange={(e) => {
                setMinguoDateStr(e.target.value);
                setLastChanged('minguo');
              }}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>西元年日期 (YYYY/MM/DD)</Form.Label>
            <Form.Control
              type="text"
              placeholder="例如: 2025/10/27"
              value={westernDateStr}
              onChange={(e) => {
                setWesternDateStr(e.target.value);
                setLastChanged('western');
              }}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default YearConverter;
