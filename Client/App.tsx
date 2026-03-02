import RootPrvider from './src/navigation/_layout';
import { AppProvider } from './src/hooks/useProvider';

export default function App() {
  return (
    <AppProvider>
      <RootPrvider/>
    </AppProvider>
  );
}
