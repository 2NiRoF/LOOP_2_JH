import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import styled from "@emotion/styled";
import { Global, css } from "@emotion/react";

import Auth from "./pages/Auth.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import Home from "./pages/Home";
import Main from "./pages/Main";
import Matching from "./pages/Matching";
import Records from "./pages/Records";
import MyPage from "./pages/MyPage";
import BottomNav from "./components/BottomNav";

const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --color-primary: #03C75A;
    --color-primary-light: #66D78A;
    --color-primary-pale: #E8F5E9;
    --color-accent: #FF8F00;
    --color-accent-light: #FFB300;
    --color-bg: #F9FBF7;
    --color-surface: #FFFFFF;
    --color-text: #1B2A1C;
    --color-text-secondary: #5A7260;
    --color-border: #D8EBD9;
    --radius-sm: 12px;
    --radius-md: 20px;
    --radius-lg: 28px;
    --shadow-sm: 0 2px 8px rgba(46,125,50,0.08);
    --shadow-md: 0 4px 20px rgba(46,125,50,0.12);
    --nav-height: 72px;
    --font: 'Nunito', sans-serif;
  }

  html, body {
    height: 100%;
    background: var(--color-bg);
    font-family: var(--font);
    color: var(--color-text);
    -webkit-font-smoothing: antialiased;
  }

  #root {
    height: 100%;
    max-width: 430px;
    margin: 0 auto;
    background: var(--color-bg);
    position: relative;
    overflow: hidden;
  }
`;

const AppShell = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PageArea = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: var(--nav-height);
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

function MainAppLayout() {
  return (
    <AppShell>
      <PageArea>
        <Outlet />
      </PageArea>
      <BottomNav />
    </AppShell>
  );
}

function App() {
  return (
    <>
      <Global styles={globalStyles} />
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Auth />} />
          <Route path="/signup"  element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/home"    element={<Home />} />
          <Route element={<MainAppLayout />}>
            <Route path="/main"     element={<Main />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/records"  element={<Records />} />
            <Route path="/mypage"   element={<MyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
