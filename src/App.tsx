
import './App.css'
import { Hero } from './components/hero';
import { ApiKeyInput } from './components/api-key-input';

function App() {
  return (
    <main className='min-h-screen h-screen bg-gray-100 dark:bg-neutral-950 transition-colors'>
      <ApiKeyInput />
      <Hero />
    </main>
  )
}

export default App;