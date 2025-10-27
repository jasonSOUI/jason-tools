import { BrowserRouter as Router, Route, Routes, NavLink, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Welcome from './tools/Welcome';
import IdTool from './tools/IdTool';
import NBUrlParser from './tools/NBUrlParser';
import ScanCaseGenerator from './tools/ScanCaseGenerator';
import InsuranceAgeCalculator from './tools/InsuranceAgeCalculator';
import YearConverter from './tools/YearConverter';
import JsonView from './tools/JsonView';
import FileSizeComparer from './tools/FileSizeComparer'; // Import the new tool
import { useTheme } from './contexts/ThemeContext';
import './index.css';

// Import icons
import { FaHome, FaIdCard, FaSun, FaMoon, FaLink, FaBarcode, FaUserClock, FaCalendarAlt, FaCode, FaExchangeAlt } from 'react-icons/fa'; // Add new icon

const toolRoutes = [
  { path: '/', name: '歡迎', component: Welcome, icon: FaHome },
  { path: '/id-tool', name: '身分證工具', component: IdTool, icon: FaIdCard },
  { path: '/nb-url-parser', name: 'NB URL 分析', component: NBUrlParser, icon: FaLink },
  { path: '/scan-case-generator', name: '掃描案件產生器', component: ScanCaseGenerator, icon: FaBarcode },
  { path: '/insurance-age-calculator', name: '保險年齡計算', component: InsuranceAgeCalculator, icon: FaUserClock },
  { path: '/year-converter', name: '西元與民國年轉換', component: YearConverter, icon: FaCalendarAlt },
  { path: '/json-view', name: 'JSON View', component: JsonView, icon: FaCode },
  { path: '/file-size-comparer', name: '檔案大小比對', component: FileSizeComparer, icon: FaExchangeAlt }, // Add new route
];

const PageHeader = () => {
  const location = useLocation();
  const currentRoute = toolRoutes.find(route => route.path === location.pathname);
  const title = currentRoute ? currentRoute.name : '工具';
  return (
    <Card.Header as="h5">{title}</Card.Header>
  );
};

const ThemeToggler = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="mt-auto p-3 text-center">
      <Button variant="outline-secondary" onClick={toggleTheme}>
        {theme === 'light' ? <FaMoon /> : <FaSun />} 
        <span className="ms-2">{theme === 'light' ? '深色' : '淺色'}模式</span>
      </Button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        <div id="sidebar-wrapper" className="d-flex flex-column">
          <div>
            <div className="sidebar-heading">JASON'S TOOLS</div>
            <Nav className="flex-column">
              {toolRoutes.map(route => (
                <Nav.Link key={route.path} as={NavLink} to={route.path} end>
                  <route.icon className="me-2" /> {route.name}
                </Nav.Link>
              ))}
            </Nav>
          </div>
          <ThemeToggler />
        </div>

        <main id="page-content-wrapper">
          <Container fluid className="p-4">
            <Card>
              <PageHeader />
              <Card.Body>
                <Routes>
                  {toolRoutes.map(route => (
                    <Route key={`route-${route.path}`} path={route.path} element={<route.component />} />
                  ))}
                </Routes>
              </Card.Body>
            </Card>
          </Container>
        </main>
      </div>
    </Router>
  );
}

export default App;