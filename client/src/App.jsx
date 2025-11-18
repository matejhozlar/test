import Header from "./components/Header/Header.jsx";
import Content from "./components/Content/Content.jsx";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.headerShadow} />
      <Content />
    </div>
  );
}

export default App;
