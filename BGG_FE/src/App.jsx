import AppRouter from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";
import { ConfigProvider } from "antd";
import { PwaProvider } from "./features/pwa/hooks/usePwa";
import "react-toastify/dist/ReactToastify.css";
import "./shared/styles/toast.css";

function App() {
  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();

  const egmfTheme = {
    token: {
      colorPrimary: token("--egmf-primary"),
      colorInfo: token("--egmf-primary"),
      colorText: token("--egmf-ink"),
      colorTextSecondary: token("--egmf-muted"),
      colorBorder: token("--egmf-border"),
      colorBgLayout: token("--egmf-surface"),
      colorBgContainer: token("--egmf-surface-raised"),
      borderRadius: Number.parseFloat(token("--egmf-radius")),
      borderRadiusLG: Number.parseFloat(token("--egmf-radius-large")),
      controlHeight: Number.parseFloat(token("--egmf-control-height")),
      controlHeightLG: Number.parseFloat(token("--egmf-control-height-large")),
      fontFamily: token("--egmf-font-sans"),
    },
    components: {
      Collapse: {
        headerBg: token("--egmf-surface-raised"),
        contentBg: token("--egmf-surface-raised"),
      },
      Input: {
        activeBorderColor: token("--egmf-primary"),
        hoverBorderColor: token("--egmf-primary-hover-border"),
      },
    },
  };

  return (
    <ConfigProvider theme={egmfTheme}>
      <PwaProvider>
        <AppRouter />

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          closeButton={true}
        />
      </PwaProvider>
    </ConfigProvider>
  );
}

export default App;
