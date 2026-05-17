import { useState, useMemo } from 'react';
import { PRODUCTS, PRICING_PLANS, MODEL_TIERS, MACHINE_SIZES, USER_LICENSES, GOTCHAS } from './data/licensingRules';
import { DISAMBIGUATION_QUESTIONS, getResult } from './data/disambiguator';
import './App.css';

/* ── Shared Components ─────────────────────────── */

function ProductCard({ product, selected, onToggle }) {
  const statusColor = { GA: '#22c55e', Preview: '#f59e0b' };
  return (
    <div className={`product-card ${selected ? 'selected' : ''}`} onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onToggle()}>
      <div className="product-card-header">
        <span className="product-icon">{product.icon}</span>
        <span className="product-status" style={{ backgroundColor: statusColor[product.status] || '#6b7280' }}>{product.status}</span>
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-subtitle">{product.subtitle}</p>
      <p className="product-description">{product.description}</p>
      <div className="product-checkbox">
        <input type="checkbox" checked={selected} readOnly tabIndex={-1} />
        <span>{selected ? 'Selected' : 'Click to add'}</span>
      </div>
    </div>
  );
}

function InputField({ input, value, onChange }) {
  if (input.type === 'select') {
    let options = [];
    if (input.options === 'modelTiers') options = Object.entries(MODEL_TIERS).map(([k, t]) => ({ value: k, label: `${t.name} (${t.examples})` }));
    else if (input.options === 'machineSizes') options = Object.entries(MACHINE_SIZES).map(([k, s]) => ({ value: k, label: `${s.name} — ${s.unified} PU/exec` }));
    else if (input.options === 'userLicenses') options = Object.entries(USER_LICENSES).map(([k, l]) => ({ value: k, label: `${l.name} — ${l.freeMessages} free msgs/${l.period}` }));
    return (
      <div className="input-field">
        <label>{input.label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      </div>
    );
  }
  return (
    <div className="input-field">
      <label>{input.label}</label>
      <input type="number" min="0" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </div>
  );
}

function ConfigPanel({ product, inputs, onInputChange }) {
  return (
    <div className="config-panel">
      <div className="config-header"><span className="product-icon">{product.icon}</span><h3>{product.name}</h3></div>
      <div className="config-inputs">{product.inputs.map((input) => <InputField key={input.id} input={input} value={inputs[input.id]} onChange={(val) => onInputChange(product.id, input.id, val)} />)}</div>
    </div>
  );
}

function ResultCard({ product, result }) {
  return (
    <div className="result-card">
      <div className="result-header">
        <span className="product-icon">{product.icon}</span>
        <h3>{product.name}</h3>
        <span className="result-total">{result.total.toLocaleString(undefined, { maximumFractionDigits: 1 })} {result.unit}</span>
      </div>
      <div className="result-breakdown">{result.breakdown.split('\n').map((line, i) => <div key={i} className="breakdown-line">{line}</div>)}</div>
      {result.note && <div className="result-note">{result.note}</div>}
    </div>
  );
}

function GotchaCard({ gotcha }) {
  const icons = { critical: '!!', warning: '!', info: 'i' };
  const colors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
  return (
    <div className="gotcha-card" style={{ borderLeftColor: colors[gotcha.severity] }}>
      <div className="gotcha-header">
        <span className="gotcha-badge" style={{ backgroundColor: colors[gotcha.severity] }}>{icons[gotcha.severity]}</span>
        <h4>{gotcha.title}</h4>
      </div>
      <p className="gotcha-description">{gotcha.description}</p>
      <p className="gotcha-action"><strong>Action:</strong> {gotcha.action}</p>
    </div>
  );
}

/* ── Disambiguator Module ──────────────────────── */

function Disambiguator() {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (qId, value) => {
    const next = { ...answers, [qId]: value };
    setAnswers(next);
    if (currentQ < DISAMBIGUATION_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => { setAnswers({}); setCurrentQ(0); setShowResult(false); };

  if (showResult) {
    const result = getResult(answers);
    const statusColor = { GA: '#22c55e', 'GA (May 2026)': '#22c55e', Preview: '#f59e0b', 'Preview (70+ customers)': '#f59e0b', 'Private Preview': '#f59e0b', 'Public Preview': '#f59e0b', 'Public Preview (May 2026)': '#f59e0b', 'GA + Private Preview': '#f59e0b' };
    return (
      <section className="section">
        <h2>Your Product Match</h2>
        <div className="disambig-result">
          <div className="disambig-result-header">
            <h3 className="disambig-product-name">{result.product}</h3>
            <span className="product-status" style={{ backgroundColor: statusColor[result.status] || '#6b7280' }}>{result.status}</span>
          </div>
          <p className="disambig-result-desc">{result.description}</p>
          <div className="disambig-when">
            <strong>Use when:</strong> {result.when}
          </div>
          <div className="disambig-not">
            <strong>Not this if:</strong> {result.notThis}
          </div>
          <div className="disambig-answers">
            <h4>Your answers:</h4>
            {DISAMBIGUATION_QUESTIONS.map((q) => (
              <div key={q.id} className="disambig-answer-row">
                <span className="disambig-answer-q">{q.question}</span>
                <span className="disambig-answer-a">{q.options.find((o) => o.value === answers[q.id])?.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="nav-buttons">
          <button className="back-btn" onClick={reset}>Start Over</button>
        </div>
      </section>
    );
  }

  const q = DISAMBIGUATION_QUESTIONS[currentQ];
  return (
    <section className="section">
      <h2>Product Disambiguator</h2>
      <p className="section-desc">Answer 3 questions to find the right UiPath agentic product for your use case.</p>
      <div className="disambig-progress">
        {DISAMBIGUATION_QUESTIONS.map((_, i) => (
          <div key={i} className={`disambig-dot ${i < currentQ ? 'done' : ''} ${i === currentQ ? 'active' : ''}`} />
        ))}
      </div>
      <div className="disambig-question">
        <h3>Q{currentQ + 1}: {q.question}</h3>
        <div className="disambig-options">
          {q.options.map((opt) => (
            <button key={opt.value} className="disambig-option" onClick={() => handleAnswer(q.id, opt.value)}>
              <span className="disambig-option-icon">{opt.icon}</span>
              <span className="disambig-option-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      {currentQ > 0 && (
        <div className="nav-buttons">
          <button className="back-btn" onClick={() => { setCurrentQ(currentQ - 1); const next = { ...answers }; delete next[DISAMBIGUATION_QUESTIONS[currentQ].id]; setAnswers(next); }}>Back</button>
        </div>
      )}
    </section>
  );
}

/* ── Calculator Module ─────────────────────────── */

function Calculator() {
  const [plan, setPlan] = useState('unified');
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [productInputs, setProductInputs] = useState(() => {
    const initial = {};
    PRODUCTS.forEach((p) => { initial[p.id] = {}; p.inputs.forEach((input) => { initial[p.id][input.id] = input.default; }); });
    return initial;
  });
  const [step, setStep] = useState(1);

  const toggleProduct = (id) => { setSelectedProducts((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }); };
  const handleInputChange = (productId, inputId, value) => { setProductInputs((prev) => ({ ...prev, [productId]: { ...prev[productId], [inputId]: value } })); };

  const results = useMemo(() => {
    const res = [];
    PRODUCTS.forEach((product) => { if (selectedProducts.has(product.id)) res.push({ product, result: product.calculate(productInputs[product.id], plan) }); });
    return res;
  }, [selectedProducts, productInputs, plan]);

  const grandTotal = useMemo(() => results.reduce((sum, r) => sum + r.result.total, 0), [results]);
  const categories = [...new Set(PRODUCTS.map((p) => p.category))];

  return (
    <>
      <div className="step-nav">
        <button className={`step-btn ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)}><span className="step-num">1</span> Plan</button>
        <button className={`step-btn ${step === 2 ? 'active' : ''}`} onClick={() => setStep(2)}><span className="step-num">2</span> Products</button>
        <button className={`step-btn ${step === 3 ? 'active' : ''}`} onClick={() => setStep(3)} disabled={selectedProducts.size === 0}><span className="step-num">3</span> Usage</button>
        <button className={`step-btn ${step === 4 ? 'active' : ''}`} onClick={() => setStep(4)} disabled={selectedProducts.size === 0}><span className="step-num">4</span> Results</button>
      </div>

      {step === 1 && (
        <section className="section">
          <h2>Select Your Pricing Plan</h2>
          <p className="section-desc">UiPath offers two pricing frameworks. Your plan determines the consumption unit type.</p>
          <div className="plan-cards">
            {Object.values(PRICING_PLANS).map((p) => (
              <div key={p.id} className={`plan-card ${plan === p.id ? 'selected' : ''}`} onClick={() => setPlan(p.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setPlan(p.id)}>
                <div className="plan-radio"><input type="radio" checked={plan === p.id} readOnly tabIndex={-1} /></div>
                <h3>{p.name}</h3>
                <p className="plan-unit"><strong>Unit:</strong> {p.unit}</p>
                <p className="plan-desc">{p.description}</p>
              </div>
            ))}
          </div>
          <button className="next-btn" onClick={() => setStep(2)}>Next: Select Products</button>
        </section>
      )}

      {step === 2 && (
        <section className="section">
          <h2>Select Products You're Using</h2>
          <p className="section-desc">Choose the agentic products your use case requires. Click cards to toggle selection.</p>
          {categories.map((cat) => (
            <div key={cat} className="category-section">
              <h3 className="category-title">{cat}</h3>
              <div className="product-grid">{PRODUCTS.filter((p) => p.category === cat).map((product) => <ProductCard key={product.id} product={product} selected={selectedProducts.has(product.id)} onToggle={() => toggleProduct(product.id)} />)}</div>
            </div>
          ))}
          <div className="nav-buttons">
            <button className="back-btn" onClick={() => setStep(1)}>Back</button>
            <button className="next-btn" onClick={() => setStep(3)} disabled={selectedProducts.size === 0}>Next: Configure Usage ({selectedProducts.size} selected)</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="section">
          <h2>Configure Your Usage</h2>
          <p className="section-desc">Adjust the usage parameters for each selected product. Defaults are typical starting values.</p>
          <div className="config-grid">{PRODUCTS.filter((p) => selectedProducts.has(p.id)).map((product) => <ConfigPanel key={product.id} product={product} inputs={productInputs[product.id]} onInputChange={handleInputChange} />)}</div>
          <div className="nav-buttons">
            <button className="back-btn" onClick={() => setStep(2)}>Back</button>
            <button className="next-btn" onClick={() => setStep(4)}>Calculate Results</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="section">
          <h2>Consumption Estimate</h2>
          <p className="section-desc">Based on your selections using <strong>{PRICING_PLANS[plan].name}</strong></p>
          <div className="grand-total-card">
            <div className="grand-total-label">Estimated Monthly Consumption</div>
            <div className="grand-total-value">{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })}<span className="grand-total-unit">{plan === 'unified' ? 'Platform Units' : 'Agent Units'}</span></div>
            <div className="grand-total-products">Across {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''}</div>
          </div>
          <div className="results-grid">{results.map(({ product, result }) => <ResultCard key={product.id} product={product} result={result} />)}</div>
          <div className="gotchas-section">
            <h2>Important Gotchas & Warnings</h2>
            <p className="section-desc">Key licensing pitfalls discovered from internal Slack and customer engagements</p>
            <div className="gotchas-grid">{GOTCHAS.map((gotcha, i) => <GotchaCard key={i} gotcha={gotcha} />)}</div>
          </div>
          <div className="disclaimer"><strong>Disclaimer:</strong> Estimates based on documented rates from docs.uipath.com (May 2026). Actual consumption may vary. Contact your UiPath sales representative for official pricing. Advanced Agents pricing is estimated — product is in Private Preview.</div>
          <div className="nav-buttons">
            <button className="back-btn" onClick={() => setStep(3)}>Adjust Usage</button>
            <button className="back-btn" onClick={() => setStep(1)}>Start Over</button>
          </div>
        </section>
      )}
    </>
  );
}

/* ── Main App with Tabs ────────────────────────── */

function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>UiPath Agentic Navigator</h1>
          <p className="header-subtitle">
            Licensing calculator, product disambiguator, and decision guide — all in one place
          </p>
          <div className="header-meta">
            <span className="meta-badge">Internal Tool</span>
            <span className="meta-badge">Data as of May 2026</span>
            <span className="meta-badge">docs.uipath.com + internal Slack sourced</span>
          </div>
        </div>
      </header>

      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => setActiveTab('calculator')}>
          Licensing Calculator
        </button>
        <button className={`tab-btn ${activeTab === 'disambiguator' ? 'active' : ''}`} onClick={() => setActiveTab('disambiguator')}>
          Product Disambiguator
        </button>
      </div>

      <main className="app-main">
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'disambiguator' && <Disambiguator />}
      </main>

      <footer className="app-footer">
        <p>Built by Bronze Support Ops | Sourced from docs.uipath.com + internal Slack research | Not an official UiPath pricing tool</p>
      </footer>
    </div>
  );
}

export default App;
