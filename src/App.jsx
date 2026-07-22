import LiquidRevealCard from './components/LiquidRevealCard';

const picture1 = new URL('../Picture1.PNG', import.meta.url).href;
const picture2 = new URL('../Picture2.PNG', import.meta.url).href;

export default function App() {
  return (
    <main className="landing-shell">
      <LiquidRevealCard image1={picture1} image2={picture2} />
    </main>
  );
}
