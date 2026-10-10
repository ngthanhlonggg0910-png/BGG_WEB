import AppRouter from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";
import { ConfigProvider } from "antd";

const egmfTheme = {
  token: {
    colorPrimary: "#6865D9",
    colorInfo: "#6865D9",
    colorText: "#252530",
    colorTextSecondary: "#74747f",
    colorBorder: "#e1e1ec",
    colorBgLayout: "#f6f7fa",
    colorBgContainer: "#ffffff",
    borderRadius: 14,
    borderRadiusLG: 18,
    controlHeight: 48,
    controlHeightLG: 52,
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
  },
  components: {
    Collapse: { headerBg: "#ffffff", contentBg: "#ffffff" },
    Input: { activeBorderColor: "#6865D9", hoverBorderColor: "#9795e7" },
  },
};

function App() {
  return (
    <ConfigProvider theme={egmfTheme}>
      <AppRouter />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </ConfigProvider>
  );
}

export default App;
