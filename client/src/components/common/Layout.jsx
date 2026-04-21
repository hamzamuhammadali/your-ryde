import { useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import { useTranslation, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../../i18n';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  position: relative;
  z-index: 2;
  background-color: var(--primary-white);
  margin-bottom: 420px;
  border-radius: 0 0 60px 60px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    margin-bottom: 480px;
    border-radius: 0 0 40px 40px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 560px;
    border-radius: 0 0 30px 30px;
  }
`;

const Layout = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { setLanguage } = useTranslation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguage(lang);
    } else if (lang && !SUPPORTED_LANGUAGES.includes(lang)) {
      navigate(`/${DEFAULT_LANGUAGE}`, { replace: true });
    }
  }, [lang, setLanguage, navigate]);

  return (
    <LayoutContainer>
      <Header />
      <MainContent>
        <Outlet />
      </MainContent>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout;