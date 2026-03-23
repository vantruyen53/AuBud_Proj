import { AuthProvider } from "./Context/AuthContext";
import AppProvider from "./Context/AppContext";
import RoutesApp from "./router/RoutesApp";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RoutesApp/>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
