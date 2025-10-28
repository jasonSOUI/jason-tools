import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

interface JsonTreeNodeProps {
  label: string | number;
  value: any;
  isLast?: boolean;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({ label, value }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const renderValue = (val: any) => {
    if (typeof val === 'object' && val !== null) {
      const isArray = Array.isArray(val);
      const keys = Object.keys(val);
      const length = isArray ? val.length : keys.length;

      return (
        <span className="json-node-toggle" onClick={toggleExpanded}>
          {isArray ? '[' : '{'} ({length} {isArray ? 'items' : 'keys'})
          {isExpanded ? <FaChevronDown className="ms-2" /> : <FaChevronRight className="ms-2" />}
        </span>
      );
    } else if (typeof val === 'string') {
      return <span className="json-string">"{val}"</span>;
    } else if (typeof val === 'number') {
      return <span className="json-number">{val}</span>;
    } else if (typeof val === 'boolean') {
      return <span className="json-boolean">{String(val)}</span>;
    } else if (val === null) {
      return <span className="json-null">null</span>;
    }
    return <span>{String(val)}</span>;
  };

  return (
    <div className="json-tree-node">
      <span className="json-label">{label}:</span> {renderValue(value)}
      {typeof value === 'object' && value !== null && isExpanded && (
        <div className="json-tree-children ps-3">
          {Object.entries(value).map(([key, val], index, arr) => (
            <JsonTreeNode key={key} label={key} value={val} isLast={index === arr.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const JsonView: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  const [parsedObject, setParsedObject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormat = () => {
    setError(null);
    setParsedObject(null);
    setFormattedJson('');
    if (!jsonInput.trim()) {
      return;
    }
    try {
      const obj = JSON.parse(jsonInput);
      setParsedObject(obj);
      setFormattedJson(JSON.stringify(obj, null, 2));
    } catch (e: any) {
      setError(`無效的 JSON 格式: ${e.message}`);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>輸入 JSON 字串</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="貼上 JSON 字串..."
        />
      </Form.Group>
      <Button onClick={handleFormat}>格式化 JSON</Button>

      {(formattedJson || parsedObject) && (
        <Tabs defaultActiveKey="formatted" id="json-view-tabs" className="mt-4 mb-3">
          <Tab eventKey="formatted" title="格式化結果">
            <div className="p-3">
              {formattedJson && (
                <Form.Control as="textarea" rows={15} value={formattedJson} readOnly className="json-formatted-output" />
              )}
            </div>
          </Tab>
          <Tab eventKey="tree" title="JSON 結構樹">
            <div className="p-3">
              {parsedObject && (
                <Card className="json-tree-card">
                  <Card.Body>
                    {typeof parsedObject === 'object' && parsedObject !== null ? (
                      <JsonTreeNode label={Array.isArray(parsedObject) ? 'root[]' : 'root{}'} value={parsedObject} />
                    ) : (
                      <JsonTreeNode label="root" value={parsedObject} />
                    )}
                  </Card.Body>
                </Card>
              )}
            </div>
          </Tab>
        </Tabs>
      )}
    </div>
  );
};

export default JsonView;
