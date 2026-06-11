// onboarding-flow.jsx — onboarding wizard.
// Flow:  Welcome → Create account (required) → Set up (ONE unified screen:
//        search + browse all domains + per-item tailored severity) →
//        Getting ready → onDone(profile). Returning: Welcome → Sign in → onDone.
//
// Selection is one screen now (no per-domain tabs). Search runs over the real
// DB (window.SFIS) so any ingredient name — incl. hidden synonyms — resolves to
// the preference to add. Severity scales are tailored per domain.

// ── brand glyphs for social sign-in ──
function AppleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="currentColor" aria-hidden="true">
      <path d="M11.62 9.02c-.02-1.78 1.45-2.63 1.52-2.67-.83-1.21-2.12-1.38-2.58-1.4-1.1-.11-2.14.64-2.7.64-.55 0-1.41-.62-2.32-.6-1.19.02-2.29.69-2.9 1.76-1.24 2.15-.32 5.33.89 7.07.59.85 1.29 1.81 2.21 1.77.89-.04 1.22-.57 2.3-.57s1.38.57 2.32.55c.96-.02 1.56-.87 2.15-1.72.68-.99.96-1.95.97-2-.02-.01-1.86-.71-1.88-2.8zM9.85 4.3c.49-.6.82-1.43.73-2.26-.71.03-1.56.47-2.06 1.06-.45.53-.85 1.38-.74 2.19.79.06 1.59-.4 2.07-.99z"/>
    </svg>
  );
}
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.65-3.88 2.65-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.94v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.94A9 9 0 0 0 0 9c0 1.45.35 2.82.94 4.04l3.02-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 .94 4.96L3.96 7.3C4.67 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

// ── Create account / Sign in (required) ──
function AccountScreen({ mode = 'create', onSubmit, onSwitchMode, onBack }) {
  const signin = mode === 'signin';
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);

  const field = (label, value, set, props = {}) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, color: T.ink2, letterSpacing: .2 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 14px', marginTop: 6, borderRadius: 14, background: T.surface, boxShadow: `inset 0 0 0 1.5px ${T.line}` }}>
        <input value={value} onChange={(e) => set(e.target.value)} {...props}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: T.sans, fontSize: 16, color: T.ink }} />
        {label === 'Password' && (
          <button className="fs-press" onClick={() => setShow((s) => !s)} style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 600, color: T.accentDeep, padding: '6px 4px' }}>{show ? 'Hide' : 'Show'}</button>
        )}
      </div>
    </div>
  );

  return (
    <PhoneScreen bg={T.bg} scroll={false}>
      <StatusBar />
      <FlowHeader onBack={onBack} />
      <div className="fs-scroll" style={{ flex: 1, padding: '6px 26px 10px' }}>
        <h2 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 27, lineHeight: 1.12, letterSpacing: -.4, color: T.ink, margin: '0 0 6px' }}>
          {signin ? 'Welcome back.' : 'Create your account'}
        </h2>
        <p style={{ fontFamily: T.sans, fontSize: 15, color: T.ink2, margin: '0 0 18px', lineHeight: 1.45 }}>
          {signin ? 'Sign in to restore your profile and diary.' : 'Saves your profile and syncs your diary across devices.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="fs-press" onClick={() => onSubmit({ method: 'apple' })}
            style={{ height: 52, borderRadius: 14, background: '#111', color: '#fff', fontFamily: T.sans, fontWeight: 600, fontSize: 15.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <AppleMark /> Continue with Apple
          </button>
          <button className="fs-press" onClick={() => onSubmit({ method: 'google' })}
            style={{ height: 52, borderRadius: 14, background: T.surface, color: T.ink, fontFamily: T.sans, fontWeight: 600, fontSize: 15.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `inset 0 0 0 1.5px ${T.line}` }}>
            <GoogleMark /> Continue with Google
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: T.line }} />
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3, letterSpacing: 1 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: T.line }} />
        </div>
        {field('Email', email, setEmail, { type: 'email', placeholder: 'you@example.com', autoCapitalize: 'none' })}
        {field('Password', pw, setPw, { type: show ? 'text' : 'password', placeholder: signin ? 'Your password' : 'Create a password' })}
        {!signin && (
          <div style={{ marginTop: 8 }}>
            <Overline>How your data is handled</Overline>
            <div style={{ marginTop: 9 }}>
              <PendingBlock lines={3} label="Privacy & data disclosure · placed verbatim · pending legal" />
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: '0 0 auto', padding: '12px 26px 24px' }}>
        <Btn onClick={() => onSubmit({ method: 'email', email })}>{signin ? 'Sign in' : 'Create account'}</Btn>
        <button className="fs-press" onClick={onSwitchMode}
          style={{ width: '100%', marginTop: 12, fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink2 }}>
          {signin ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </PhoneScreen>
  );
}

// ── Unified Set-up screen: search + browse + per-item severity ──
const DOMAIN_BROWSE = [
  { domain: 'ALLERGEN',           title: 'Allergies' },
  { domain: 'INTOLERANCE',        title: 'Intolerances', beta: true },
  { domain: 'DIETARY_PREFERENCE', title: 'Dietary preferences' },
  { domain: 'GOAL',               title: 'Goals' },
];
const DOMAIN_CHIP = { ALLERGEN: 'allergen', INTOLERANCE: 'intoler', DIETARY_PREFERENCE: 'goal', GOAL: 'goal' };

function DomainChip({ domain }) {
  const labels = { ALLERGEN: 'Allergy', INTOLERANCE: 'Intolerance', DIETARY_PREFERENCE: 'Diet', GOAL: 'Goal' };
  const pal = T[DOMAIN_CHIP[domain]];
  return (
    <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: .4, textTransform: 'uppercase',
      color: pal.label, background: pal.tint, boxShadow: `inset 0 0 0 1px ${pal.edge}`, padding: '2px 7px', borderRadius: 999 }}>{labels[domain]}</span>
  );
}

function SetupScreen({ sel, setSel, onContinue, onBack }) {
  const S = window.SFIS;
  const [q, setQ] = React.useState('');
  const results = q.trim() ? S.searchSubGroups(q) : [];

  const add = (sgid) => setSel((s) => (s[sgid] ? s : { ...s, [sgid]: S.SEVERITY_DEFAULT[S.domainOf(sgid)] }));
  const remove = (sgid) => setSel((s) => { const n = { ...s }; delete n[sgid]; return n; });
  const toggle = (sgid) => (sel[sgid] ? remove(sgid) : add(sgid));
  const setSev = (sgid, v) => setSel((s) => ({ ...s, [sgid]: v }));
  const count = Object.keys(sel).length;

  return (
    <PhoneScreen bg={T.bg} scroll={false}>
      <StatusBar />
      <FlowHeader onBack={onBack} />
      <div className="fs-scroll" style={{ flex: 1, padding: '4px 22px 14px' }}>
        <h2 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 27, lineHeight: 1.15, letterSpacing: -.4, color: T.ink, margin: '0 0 6px' }}>
          What should we watch for?
        </h2>
        <p style={{ fontFamily: T.sans, fontSize: 15, color: T.ink2, margin: '0 0 16px', lineHeight: 1.45 }}>
          Search any ingredient, or pick below — allergies, intolerances, diet and goals all in one place.
        </p>

        {/* global search over the real DB */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 50, padding: '0 16px', borderRadius: 14, background: T.surface, boxShadow: `inset 0 0 0 1.5px ${T.line}` }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke={T.ink3} strokeWidth="1.7" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="5"/><path d="M11.5 11.5L15 15"/></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ingredients… (try “whey” or “marzipan”)"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: T.sans, fontSize: 15.5, color: T.ink }} />
            {q && <button className="fs-press" onClick={() => setQ('')} style={{ color: T.ink3, padding: 4 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg></button>}
          </div>
          {q.trim() && (
            <div style={{ position: 'absolute', top: 56, left: 0, right: 0, zIndex: 5, background: T.surface, borderRadius: 14, boxShadow: T.shadowCard, overflow: 'hidden' }}>
              {results.length ? results.map((r) => {
                const on = !!sel[r.sgid];
                return (
                  <button key={r.sgid} className="fs-tap" onClick={() => { toggle(r.sgid); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '12px 14px', borderBottom: `1px solid ${T.lineSoft}`, background: 'transparent' }}>
                    <span style={{ width: 22, fontSize: 19, color: on ? T.accent : T.accent, lineHeight: 1 }}>{on ? '✓' : '+'}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: T.sans, fontWeight: 600, fontSize: 15, color: T.ink }}>{r.label}</span>
                      {r.via && <span style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, display: 'block', marginTop: 1 }}>matches “{r.via}”</span>}
                    </span>
                    <DomainChip domain={r.domain} />
                  </button>
                );
              }) : (
                <div style={{ padding: '14px 16px', fontFamily: T.sans, fontSize: 13.5, color: T.ink3 }}>No match yet — try a different name, or pick from the lists below.</div>
              )}
            </div>
          )}
        </div>

        {/* browse by domain */}
        {DOMAIN_BROWSE.map((d) => (
          <div key={d.domain} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <Overline>{d.title}</Overline>
              {d.beta && <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: .5, color: T.intoler.label, background: T.intoler.tint, boxShadow: `inset 0 0 0 1px ${T.intoler.edge}`, padding: '2px 7px', borderRadius: 999 }}>BETA</span>}
              {d.domain === 'ALLERGEN' && (
                <button className="fs-press" onClick={() => S.subGroupsByDomain('ALLERGEN').forEach((sg) => add(sg.id))}
                  style={{ marginLeft: 'auto', fontFamily: T.sans, fontSize: 12.5, fontWeight: 600, color: T.accent }}>Add all 9</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
              {S.subGroupsByDomain(d.domain).map((sg) => {
                const on = !!sel[sg.id];
                return (
                  <button key={sg.id} className="fs-tap" onClick={() => toggle(sg.id)}
                    style={{ minHeight: 52, padding: '8px 6px', borderRadius: 13, fontFamily: T.sans, fontWeight: 600, fontSize: 12.5, lineHeight: 1.15,
                      color: on ? T.accentDeep : T.ink, background: on ? T.accentSoft : T.surface,
                      boxShadow: on ? `inset 0 0 0 2px ${T.accent}` : `inset 0 0 0 1.5px ${T.line}` }}>
                    {sg.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* your selections + tailored severity */}
        {count > 0 && (
          <div style={{ marginTop: 4 }}>
            <Overline>Your selections · severity</Overline>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {Object.keys(sel).map((sgid) => {
                const domain = S.domainOf(sgid);
                const scale = S.SEVERITY[domain] || ['Moderate'];
                return (
                  <div key={sgid} style={{ background: T.surface, borderRadius: 14, padding: '12px 14px', boxShadow: `inset 0 0 0 1px ${T.line}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15.5, color: T.ink }}>{S.labelOf(sgid)}</span>
                        <DomainChip domain={domain} />
                      </span>
                      <button className="fs-press" onClick={() => remove(sgid)} aria-label="Remove" style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', color: T.ink3 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
                      {scale.map((sv) => {
                        const on = sel[sgid] === sv;
                        return (
                          <button key={sv} className="fs-tap" onClick={() => setSev(sgid, sv)}
                            style={{ flex: 1, minHeight: 38, borderRadius: 10, fontFamily: T.sans, fontWeight: 600, fontSize: 12.5,
                              color: on ? '#FBF7EF' : T.ink2, background: on ? T.ink : T.surfaceWarm,
                              boxShadow: on ? 'none' : `inset 0 0 0 1px ${T.line}` }}>{sv}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: '0 0 auto', padding: '12px 22px 26px', background: 'linear-gradient(transparent, ' + T.bg + ' 28%)' }}>
        <Btn onClick={onContinue}>{count ? `Continue with ${count} selected` : 'Continue'}</Btn>
      </div>
    </PhoneScreen>
  );
}

// ── Getting ready (selective offline download) ──
function GettingReadyScreen({ onDone }) {
  const steps = ['Saving your profile…', 'Downloading your selections for offline use…', 'Setting up your diary…', 'Almost there…'];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (i >= steps.length) { const t = setTimeout(onDone, 480); return () => clearTimeout(t); }
    const t = setTimeout(() => setI((x) => x + 1), i === 0 ? 650 : 720);
    return () => clearTimeout(t);
  }, [i]);
  return (
    <PhoneScreen bg={T.bg} scroll={false}>
      <StatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 30px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 34 }}>
          <div style={{ width: 76, height: 76, position: 'relative' }}>
            <svg width="76" height="76" viewBox="0 0 76 76" style={{ animation: 'fs-spin 1.6s linear infinite' }}>
              <circle cx="38" cy="38" r="32" fill="none" stroke={T.line} strokeWidth="5" />
              <circle cx="38" cy="38" r="32" fill="none" stroke={T.accent} strokeWidth="5" strokeLinecap="round" strokeDasharray="50 160" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><AmberDot size={16} /></div>
          </div>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: T.ink3, textAlign: 'center', marginBottom: 16 }}>Getting your profile ready</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {steps.map((s, k) => {
            const done = k < i, active = k === i;
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: k > i ? .32 : 1, transition: 'opacity .4s' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', flex: '0 0 22px', display: 'grid', placeItems: 'center',
                  background: done ? T.accent : (active ? T.accentSoft : T.surface), boxShadow: done ? 'none' : `inset 0 0 0 1.5px ${T.line}` }}>
                  {done && <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#FBF7EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5l2.3 2.3L9 3"/></svg>}
                  {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent, animation: 'fs-pulse 1s infinite' }} />}
                </span>
                <span style={{ fontFamily: T.serif, fontSize: 18, color: active ? T.ink : T.ink2, fontWeight: active ? 600 : 400 }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneScreen>
  );
}

// ── Orchestrator ──
function Onboarding({ onDone = () => {}, onSample = () => {} }) {
  const _ob = new URLSearchParams(window.location.search).get('ob'); // QA: ?ob=account|signin|select|ready
  const [step, setStep] = React.useState(_ob || 'welcome');
  const [account, setAccount] = React.useState(null);
  const [sel, setSel] = React.useState({}); // sgid → severity

  const finish = () => onDone({ account, selections: sel });

  if (step === 'welcome') return <WelcomeScreen onNext={() => setStep('account')} onSignIn={() => setStep('signin')} onSample={onSample} />;
  if (step === 'account' || step === 'signin') {
    const signin = step === 'signin';
    return (
      <AccountScreen mode={signin ? 'signin' : 'create'} onBack={() => setStep('welcome')}
        onSwitchMode={() => setStep(signin ? 'account' : 'signin')}
        onSubmit={(acct) => { setAccount(acct); if (signin) onDone({ account: acct, selections: {} }); else setStep('select'); }} />
    );
  }
  if (step === 'select') return <SetupScreen sel={sel} setSel={setSel} onBack={() => setStep('account')} onContinue={() => setStep('ready')} />;
  return <GettingReadyScreen onDone={finish} />;
}

Object.assign(window, { Onboarding, AccountScreen, SetupScreen, GettingReadyScreen });
