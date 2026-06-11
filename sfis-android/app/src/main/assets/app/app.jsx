// app.jsx — the real app shell & router for the replica.
// Wires the full designed flow with no designer "tweaks" panel:
//
//   Onboarding:  Welcome → Profile setup → Email → (into the app)
//   App (tabs):  Diary (home) · Patterns · Profile
//   Scan loop:   Scan tab → Camera → Processing → Result (Standard/Child toggle)
//
// Theme defaults to Blossom + Fuchsia to match Design.pdf. Anything whose final
// content/behaviour is still the founder's call surfaces the global InfoSheet
// ("info to be added") instead of going nowhere.

// Match the Design.pdf walkthrough theme: Blossom background + Fuchsia accent.
Object.assign(T, { accent: '#D6398A', accentDeep: '#AC2C6E', accentSoft: '#FAE0EE', accentTint: '#FDF0F7' });
Object.assign(T, { bg: '#FCEDF3', bgDeep: '#F6DCE7', surfaceWarm: '#FEF5F8' });

// Scales the fixed 390×844 phone to fit the window (from the flow reference).
function PhoneStage({ children }) {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      const pad = 28;
      setScale(Math.min(1, (window.innerHeight - pad) / 844, (window.innerWidth - pad) / 390));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(135% 105% at 50% -12%, #FBE8F1 0%, #F3D9E6 45%, #E9CcDB 100%)', overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <div style={{ width: 390, height: 844, borderRadius: 46, overflow: 'hidden', position: 'relative',
          boxShadow: '0 2px 4px rgba(40,30,20,.08), 0 30px 80px rgba(40,30,20,.22), 0 0 0 1px rgba(40,30,20,.04)' }}>
          <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
          <div style={{ position: 'absolute', left: '50%', bottom: 9, transform: 'translateX(-50%)', width: 128, height: 5,
            borderRadius: 3, background: 'rgba(40,30,20,.22)', zIndex: 60, pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}

// Dev affordance: ?start=<view> jumps straight to a screen (handy for QA/screens).
const QS = new URLSearchParams(window.location.search);

// The demo product + a fallback profile (used for a sample scan before the user
// has set up their own). Label is the raw "OCR" text the matcher reads.
const SAMPLE_PRODUCT = {
  product: 'Sunflower Seed Cookies', brand: 'Field & Oat Co.',
  label: 'wheat flour, sugar, sunflower oil, sunflower seeds, butter (milk), eggs, soy lecithin, salt, baking soda, natural flavoring, may contain traces of tree nuts',
};
const DEMO_PROFILE = { 'allergen.milk': 'Severe', 'allergen.soy': 'Moderate', 'allergen.treenut': 'Severe', 'intol.gluten': 'Moderate', 'goal.less_sugar': 'Focused' };

function App() {
  const [view, setView] = React.useState(QS.get('start') || 'onboarding'); // onboarding | log | patterns | profile-home | camera | processing | result
  const [child, setChild] = React.useState(QS.get('child') === '1');
  const [profile, setProfile] = React.useState(null);   // { account, selections }
  const [scan, setScan] = React.useState(null);          // { product, brand, findings, unverified }
  const go = (v) => setView(v);
  // QA hook: ?info=1 pops the "info to be added" sheet on load.
  React.useEffect(() => { if (QS.get('info') === '1') window.openInfo({ title: 'Export my diary', sub: 'Download your full scan history and profile as a file you keep.', lines: 3 }); }, []);
  // Bottom-tab routing: Scan opens the camera; Profile opens the profile home.
  const onNav = (k) => go(k === 'scan' ? 'camera' : k === 'profile' ? 'profile-home' : k);

  // Run the real matcher over a product against the active profile (or the demo
  // profile if the user hasn't set one up), then enter the processing → result flow.
  const startScan = (prod) => {
    const own = profile && profile.selections && Object.keys(profile.selections).length ? Object.keys(profile.selections) : null;
    const ids = own || Object.keys(DEMO_PROFILE);
    const { findings, unverified } = window.SFIS.scanLabel(prod.label, ids);
    setScan({ product: prod.product, brand: prod.brand, findings, unverified });
    go('processing');
  };
  // Fallback so the Result screen always has something real to show (e.g. ?start=result).
  const sampleScan = React.useMemo(() => {
    const { findings, unverified } = window.SFIS.scanLabel(SAMPLE_PRODUCT.label, Object.keys(DEMO_PROFILE));
    return { product: SAMPLE_PRODUCT.product, brand: SAMPLE_PRODUCT.brand, findings, unverified };
  }, []);
  const shownScan = scan || sampleScan;

  let screen;
  switch (view) {
    case 'onboarding':   screen = <Onboarding onDone={(p) => { setProfile(p); go('log'); }} onSample={() => startScan(SAMPLE_PRODUCT)} />; break;
    case 'camera':       screen = <CameraScreen onCapture={() => startScan(SAMPLE_PRODUCT)} onBack={() => go('log')} />; break;
    case 'processing':   screen = <ProcessingScreen onDone={() => go('result')} />; break;
    case 'result':       screen = <ResultScreen child={child} setChild={setChild} variant="minimal" onBack={() => go('log')}
                                    product={shownScan.product} brand={shownScan.brand}
                                    findings={shownScan.findings} unverified={shownScan.unverified} />; break;
    case 'patterns':     screen = <PatternsScreen onNav={onNav} />; break;
    case 'profile-home': screen = <ProfileHomeScreen onNav={onNav} />; break;
    case 'log':
    default:             screen = <DiaryScreen onNav={onNav} onSample={() => startScan(SAMPLE_PRODUCT)} trackingDays={30} scansSaved={32} autoEntries={true} calendarActivity={55} />; break;
  }

  return (
    <PhoneStage>
      <div className="fs-anim-up" key={view} style={{ width: '100%', height: '100%' }}>{screen}</div>
      <InfoSheet />
    </PhoneStage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
