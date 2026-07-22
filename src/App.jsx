import InfiniteCarousel from './components/InfiniteCarousel';

const galleryImages = [
  new URL('../Gallery1.jpg', import.meta.url).href,
  new URL('../Gallery2.jpg', import.meta.url).href,
  new URL('../Gallery3.jpg', import.meta.url).href,
  new URL('../Gallery4.jpg', import.meta.url).href,
];

export default function App() {
  return (
    <main className="landing-shell">
      <InfiniteCarousel images={galleryImages} />
    </main>
  );
}
