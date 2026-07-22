import LiquidRevealCard from './components/LiquidRevealCard';
import picture1 from '../Picture1.PNG';
import picture2 from '../Picture2.PNG';

export default function App() {
  return (
    <main className="landing-shell">
      <LiquidRevealCard image1={picture1} image2={picture2} />
    </main>
  );
}
